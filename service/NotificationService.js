import { mqttService } from '../config/mqtt/config.js';
import { EmailService } from './EmailService.js';

export class NotificationService {
  constructor(emailService) {
    this.emailService = emailService || new EmailService();
    this.init();
  }

  async init() {
    try {
      await this.emailService.init();
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Send appointment confirmation notification
  async sendAppointmentConfirmation(appointment, user, doctor) {
    try {
      // Send MQTT notification
      const message = `Your appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()} has been confirmed.`;
      mqttService.publish(`/user/${user._id}/appointments`, message);
      
      // Send email notification
      await this.sendAppointmentEmail(
        user.email,
        'Appointment Confirmation',
        `Your appointment with Dr. ${doctor.fullName} has been confirmed for ${new Date(appointment.startTime).toLocaleString()}.`,
        appointment
      );
      
      // Update appointment confirmation status
      appointment.confirmationSent = true;
      await appointment.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Send appointment reminder notification
  async sendAppointmentReminder(appointment, user, doctor) {
    try {
      // Send MQTT notification
      const message = `Reminder: You have an appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()}.`;
      mqttService.publish(`/user/${user._id}/appointments`, message);
      
      // Send email notification
      await this.sendAppointmentEmail(
        user.email,
        'Appointment Reminder',
        `This is a reminder that you have an appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()}.`,
        appointment
      );
      
      // Update appointment reminder status
      appointment.reminderSent = true;
      await appointment.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Send appointment status update notification
  async sendStatusUpdate(appointment, user, doctor, status) {
    try {
      let message = '';
      let subject = '';
      
      switch (status) {
        case 'ACCEPTED':
          subject = 'Appointment Accepted';
          message = `Your appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()} has been accepted.`;
          break;
        case 'DECLINED':
          subject = 'Appointment Declined';
          message = `Your appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()} has been declined.`;
          break;
        case 'CANCELLED':
          subject = 'Appointment Cancelled';
          message = `Your appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()} has been cancelled.`;
          break;
        case 'COMPLETED':
          subject = 'Appointment Completed';
          message = `Your appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()} has been marked as completed.`;
          break;
        default:
          subject = 'Appointment Update';
          message = `Your appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()} has been updated.`;
      }
      
      // Send MQTT notification
      mqttService.publish(`/user/${user._id}/appointments`, message);
      
      // Send email notification
      await this.sendAppointmentEmail(
        user.email,
        subject,
        message,
        appointment
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error sending status update:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Helper method to send appointment emails
  async sendAppointmentEmail(email, subject, message, appointment) {
    try {
      // Use the existing EmailService to send emails
      const emailContent = `
        <h1>${subject}</h1>
        <p>${message}</p>
        ${appointment.calendarLink ? `<p>Add to calendar: <a href="${appointment.calendarLink}">Click here</a></p>` : ''}
        <p>Appointment details:</p>
        <ul>
          <li>Date: ${new Date(appointment.startTime).toLocaleDateString()}</li>
          <li>Time: ${new Date(appointment.startTime).toLocaleTimeString()} - ${new Date(appointment.endTime).toLocaleTimeString()}</li>
          <li>Status: ${appointment.status}</li>
        </ul>
      `;
      
      await this.emailService.transporter.sendMail({
        from: '"Neurolab" <noreply@neurolab.com>',
        to: email,
        subject: subject,
        html: emailContent
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationService();