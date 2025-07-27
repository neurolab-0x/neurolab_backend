import { mqttService } from "../config/mqtt/config.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.models.js"
import User from "../models/user.models.js";

export const AppointmentController = {
    async requestAppointment(req, res) {
        const { startTime, endTime, message } = req.body;
        console.log(req.params);
        try {
            const doctor = await Doctor.findById(req.params.doctorId);
            if (!doctor) return res.status(404).json({ message: "Doctor not found" });
            const appointment = new Appointment({
                user: req.user._id,
                doctor: req.params.doctorId,
                startTime : startTime,
                endTime : endTime,
                message : message,
                status : "PENDING"
            });
            console.log(req.user)
            const user = await User.findById(req.user.userId);
            // console.log(user);
            // const notification = `${user.fullName} has requested an appointment with you`

            /* mqttService.publish(`/user/${req.params.doctorId}/appointments`,  notification); */
            await appointment.save();
            return res.status(200).json({ message : "Appointment requested" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message : "Internal server error, check console"})
        }
    },
    async acceptAppointment(req, res){
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if(!appointment) return res.status(404).json({ message : "Appointment not found" });
            appointment.status = "ACCEPTED";
            await appointment.save();
            const user = await User.findById(req.user._id);
            const notification = `Dr. ${user.fullName} has accepted your appointment request`;
            mqttService.publish(`/user/${appointment.user}/appointments`, notification)
            return res.status(200).json({ message : "Appointment accepted" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message : "Internal server error, check console"})
        }
    },
    async declineAppointment(req, res){
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if(!appointment) return res.status(404).json({ message : "Appointment not found" });
            appointment.status = "DECLINED";
            await appointment.save();
            const user = await User.findById(req.user._id);
            const notification = `Dr. ${user.fullName} has declined your appointment request`;
            mqttService.publish(`/user/${appointment.user}/appointments`, notification)
            return res.status(200).json({ message : "Appointment declined" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message : "Internal server error, check console"})
        }
    },
    async updateAppointment(req, res) {
        const { startTime, endTime, message } = req.body;
        try {
            const appointment = await Appointment.findById(req.params.appointmentId);
            if(!appointment) return res.status(404).json({ message : "Appointment not found" });
            startTime ? appointment.startTime = startTime : appointment.startTime = appointment.startTime;
            endTime ? appointment.endTime = endTime : appointment.startTime = appointment.endTime;
            message ? appointment.message = message : appointment.message = appointment.message;
            await appointment.save();
            return res.status(200).json({ message : "Appointment updated" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message : "Internal server error, check console" })
        }
    }
}