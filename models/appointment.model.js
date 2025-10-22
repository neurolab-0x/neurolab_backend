import mongoose from "mongoose";

const appointmentSchema = mongoose.Schema({
    user : { type : mongoose.Schema.Types.ObjectId, ref : "User" },
    doctor : { type : mongoose.Schema.Types.ObjectId, ref : "User" },
    startTime : { type : Date },
    endTime : { type : Date },
    status : { type : String, enum : ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"], default : "PENDING" },
    message : { type : String },
    // Calendar integration
    calendarEventId: { type: String },
    calendarLink: { type: String },
    // Payment integration
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentId: { type: String },
    paymentDate: { type: Date },
    // Notification tracking
    reminderSent: { type: Boolean, default: false },
    confirmationSent: { type: Boolean, default: false }
}, { timestamps : true });

const Appointment = mongoose.model("appointments", appointmentSchema);
export default Appointment;