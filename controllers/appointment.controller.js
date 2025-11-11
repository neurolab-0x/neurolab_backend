import { mqttService } from "../config/mqtt/config.js";
import { logger } from "../config/logger/config.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.models.js";
import User from "../models/user.models.js";
import calendarService from "../service/CalendarService.js";
import schedulingService from "../service/SchedulingService.js";
import notificationService from "../service/NotificationService.js";
import paymentService from "../service/PaymentService.js";

export const AppointmentController = {
    // Get available time slots for a doctor
    async getAvailableTimeSlots(req, res) {
        try {
            const { doctorId } = req.params;
            const { date } = req.query;
            
            if (!date) {
                return res.status(400).json({ message: "Date is required" });
            }
            
            const availableSlots = await schedulingService.getAvailableTimeSlots(doctorId, date);
            return res.status(200).json({ availableSlots });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Request a new appointment
    async requestAppointment(req, res) {
        const { startTime, endTime, message } = req.body;
        try {
            // Check if doctor exists
            const doctor = await Doctor.findById(req.params.doctorId);
            if (!doctor) return res.status(404).json({ message: "Doctor not found" });
            
            // Check doctor availability
            const availability = await schedulingService.checkAvailability(
                req.params.doctorId,
                startTime,
                endTime
            );
            
            if (!availability.available) {
                return res.status(409).json({ 
                    message: availability.message,
                    conflicts: availability.conflictingAppointments
                });
            }
            
            // Create appointment
            const appointment = new Appointment({
                user: req.user._id,
                doctor: req.params.doctorId,
                startTime: startTime,
                endTime: endTime,
                message: message,
                status: "PENDING",
                price: doctor.appointmentPrice || 0
            });
            
            await appointment.save();
            
            // Get user details
            const user = await User.findById(req.user.userId || req.user._id);
            
            // Send notification to doctor
            const notification = `${user.fullName} has requested an appointment with you`;

            if(mqttService.isConnected){
                mqttService.publish(`/user/${req.params.doctorId}/appointments`, notification);
            }else {
                logger.warn('MQTT service is not connected. Notification not sent.');
            }

            return res.status(200).json({ 
                message: "Appointment requested",
                appointmentId: appointment._id
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Accept an appointment
    async acceptAppointment(req, res) {
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if (!appointment) return res.status(404).json({ message: "Appointment not found" });
            
            // Update appointment status
            appointment.status = "ACCEPTED";
            
            // Get user and doctor details
            const doctor = await User.findById(req.user._id);
            const user = await User.findById(appointment.user);
            
            // Create calendar event
            if (doctor.calendarTokens) {
                calendarService.setCredentials(doctor.calendarTokens);
                const calendarResult = await calendarService.createEvent({
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    message: appointment.message,
                    userEmail: user.email,
                    doctorEmail: doctor.email,
                    doctorName: doctor.fullName
                });
                
                if (calendarResult.success) {
                    appointment.calendarEventId = calendarResult.eventId;
                    appointment.calendarLink = calendarResult.htmlLink;
                }
            }
            
            await appointment.save();
            
            // Send notification to user
            await notificationService.sendStatusUpdate(appointment, user, doctor, "ACCEPTED");
            
            return res.status(200).json({ message: "Appointment accepted" });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Decline an appointment
    async declineAppointment(req, res) {
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if (!appointment) return res.status(404).json({ message: "Appointment not found" });
            
            // Update appointment status
            appointment.status = "DECLINED";
            await appointment.save();
            
            // Get user and doctor details
            const doctor = await User.findById(req.user._id);
            const user = await User.findById(appointment.user);
            
            // Send notification to user
            await notificationService.sendStatusUpdate(appointment, user, doctor, "DECLINED");
            
            return res.status(200).json({ message: "Appointment declined" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Update an appointment
    async updateAppointment(req, res) {
        const { startTime, endTime, message } = req.body;
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if (!appointment) return res.status(404).json({ message: "Appointment not found" });
            
            // Update appointment details
            if (startTime) appointment.startTime = startTime;
            if (endTime) appointment.endTime = endTime;
            if (message) appointment.message = message;
            
            // If appointment is accepted and has a calendar event, update it
            if (appointment.status === "ACCEPTED" && appointment.calendarEventId) {
                const doctor = await User.findById(appointment.doctor);
                
                if (doctor.calendarTokens) {
                    calendarService.setCredentials(doctor.calendarTokens);
                    await calendarService.updateEvent(appointment.calendarEventId, {
                        startTime: appointment.startTime,
                        endTime: appointment.endTime,
                        message: appointment.message
                    });
                }
            }
            
            await appointment.save();
            
            // Get user and doctor details
            const doctor = await User.findById(appointment.doctor);
            const user = await User.findById(appointment.user);
            
            // Send notification about the update
            await notificationService.sendStatusUpdate(appointment, user, doctor, appointment.status);
            
            return res.status(200).json({ message: "Appointment updated" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Cancel an appointment
    async cancelAppointment(req, res) {
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if (!appointment) return res.status(404).json({ message: "Appointment not found" });
            
            // Update appointment status
            appointment.status = "CANCELLED";
            
            // If appointment has a calendar event, delete it
            if (appointment.calendarEventId) {
                const doctor = await User.findById(appointment.doctor);
                
                if (doctor.calendarTokens) {
                    calendarService.setCredentials(doctor.calendarTokens);
                    await calendarService.deleteEvent(appointment.calendarEventId);
                }
            }
            
            await appointment.save();
            
            // Get user and doctor details
            const doctor = await User.findById(appointment.doctor);
            const user = await User.findById(appointment.user);
            
            // Send notification about cancellation
            await notificationService.sendStatusUpdate(appointment, user, doctor, "CANCELLED");
            
            return res.status(200).json({ message: "Appointment cancelled" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Create payment session for an appointment
    async createPaymentSession(req, res) {
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if (!appointment) return res.status(404).json({ message: "Appointment not found" });
            
            // Check if appointment is already paid
            if (appointment.isPaid) {
                return res.status(400).json({ message: "Appointment is already paid" });
            }
            
            // Get user and doctor details
            const user = await User.findById(appointment.user);
            const doctor = await Doctor.findById(appointment.doctor);
            
            // Create payment session
            const session = await paymentService.createPaymentSession(appointment, user, doctor);
            
            if (!session.success) {
                return res.status(500).json({ message: "Failed to create payment session", error: session.error });
            }
            
            return res.status(200).json({
                message: "Payment session created",
                sessionId: session.sessionId,
                paymentUrl: session.url
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Handle payment success webhook
    async handlePaymentSuccess(req, res) {
        try {
            const { session_id } = req.body;
            
            if (!session_id) {
                return res.status(400).json({ message: "Session ID is required" });
            }
            
            // Process payment success
            const paymentResult = await paymentService.handlePaymentSuccess(session_id);
            
            if (!paymentResult.success) {
                return res.status(500).json({ message: "Failed to process payment", error: paymentResult.error });
            }
            
            // Update appointment payment status
            const appointment = await Appointment.findById(paymentResult.appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: "Appointment not found" });
            }
            
            appointment.isPaid = true;
            appointment.paymentId = paymentResult.paymentId;
            appointment.paymentDate = new Date();
            
            await appointment.save();
            
            // Get user and doctor details
            const user = await User.findById(appointment.user);
            const doctor = await User.findById(appointment.doctor);
            
            // Send payment confirmation notification
            const message = `Your payment for the appointment with Dr. ${doctor.fullName} on ${new Date(appointment.startTime).toLocaleString()} has been received.`;
            mqttService.publish(`/user/${user._id}/payments`, message);
            
            return res.status(200).json({ message: "Payment processed successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
    
    // Mark appointment as completed
    async completeAppointment(req, res) {
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if (!appointment) return res.status(404).json({ message: "Appointment not found" });
            
            // Update appointment status
            appointment.status = "COMPLETED";
            await appointment.save();
            
            // Get user and doctor details
            const doctor = await User.findById(appointment.doctor);
            const user = await User.findById(appointment.user);
            
            // Send notification about completion
            await notificationService.sendStatusUpdate(appointment, user, doctor, "COMPLETED");
            
            return res.status(200).json({ message: "Appointment marked as completed" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}