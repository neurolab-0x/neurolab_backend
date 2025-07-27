import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { AppointmentController } from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.use(authenticate)

appointmentRouter.post("/:doctorId", AppointmentController.requestAppointment);
appointmentRouter.post("/:appointmentId", AppointmentController.acceptAppointment);
appointmentRouter.put("/:appointmentId", AppointmentController.declineAppointment);
appointmentRouter.patch("/:appointmentId", AppointmentController.updateAppointment);

export default appointmentRouter