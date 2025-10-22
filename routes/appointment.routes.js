import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { AppointmentController } from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.use(authenticate);

// Get available time slots
appointmentRouter.get("/available-slots/:doctorId", AppointmentController.getAvailableTimeSlots);

// Request appointment
appointmentRouter.post("/:doctorId", AppointmentController.requestAppointment);

// Appointment status management
appointmentRouter.post("/accept/:appointmentId", AppointmentController.acceptAppointment);
appointmentRouter.post("/decline/:appointmentId", AppointmentController.declineAppointment);
appointmentRouter.post("/cancel/:appointmentId", AppointmentController.cancelAppointment);
appointmentRouter.post("/complete/:appointmentId", AppointmentController.completeAppointment);

// Update appointment details
appointmentRouter.patch("/:appointmentId", AppointmentController.updateAppointment);

// Payment endpoints
appointmentRouter.post("/payment/:appointmentId", AppointmentController.createPaymentSession);
appointmentRouter.post("/payment/webhook", AppointmentController.handlePaymentSuccess);

export default appointmentRouter;