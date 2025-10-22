import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.models.js';

export class SchedulingService {
  // Check if doctor is available for the requested time slot
  async checkAvailability(doctorId, startTime, endTime) {
    try {
      // Convert string dates to Date objects if needed
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      // Find doctor's working hours
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return { available: false, message: 'Doctor not found' };
      }
      
      // Check if requested time is within doctor's working hours
      // This is a placeholder - you would implement actual working hours logic here
      
      // Check for overlapping appointments
      const overlappingAppointments = await Appointment.find({
        doctor: doctorId,
        status: { $in: ['PENDING', 'ACCEPTED'] },
        $or: [
          // Appointment starts during the requested time
          { startTime: { $gte: start, $lt: end } },
          // Appointment ends during the requested time
          { endTime: { $gt: start, $lte: end } },
          // Appointment encompasses the requested time
          { startTime: { $lte: start }, endTime: { $gte: end } }
        ]
      });
      
      if (overlappingAppointments.length > 0) {
        return { 
          available: false, 
          message: 'Doctor is not available during the requested time',
          conflictingAppointments: overlappingAppointments
        };
      }
      
      return { available: true };
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }
  
  // Get available time slots for a doctor on a specific day
  async getAvailableTimeSlots(doctorId, date) {
    try {
      const requestedDate = new Date(date);
      const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));
      
      // Find doctor's working hours
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      
      // Get all appointments for the doctor on the requested day
      const appointments = await Appointment.find({
        doctor: doctorId,
        status: { $in: ['PENDING', 'ACCEPTED'] },
        startTime: { $gte: startOfDay },
        endTime: { $lte: endOfDay }
      }).sort({ startTime: 1 });
      
      // Default working hours (9 AM to 5 PM)
      const workingHoursStart = 9;
      const workingHoursEnd = 17;
      const appointmentDuration = 60; // minutes
      
      // Generate all possible time slots
      const availableSlots = [];
      for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
        for (let minute = 0; minute < 60; minute += appointmentDuration) {
          const slotStart = new Date(requestedDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotStart.getMinutes() + appointmentDuration);
          
          // Check if slot overlaps with any existing appointment
          const isOverlapping = appointments.some(appointment => {
            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointment.endTime);
            
            return (
              (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
              (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
              (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
            );
          });
          
          if (!isOverlapping) {
            availableSlots.push({
              start: slotStart,
              end: slotEnd
            });
          }
        }
      }
      
      return availableSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  }
}

export default new SchedulingService();