import mongoose from "mongoose";

const appointmentSchema = mongoose.Schema({
    user : { type : mongoose.Schema.Types.ObjectId, ref : "User" },
    doctor : { type : mongoose.Schema.Types.ObjectId, ref : "User" },
    startTime : { type : Date },
    endTime : { type : Date },
    status : { type : String, enum : ["PENDING", "ACCEPTED", "DECLINED"], default : "PENDING" },
    message : { type : String }
}, { timestamps : true });

const Appointment = mongoose.model("appointments", appointmentSchema);
export default Appointment;