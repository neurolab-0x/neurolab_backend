import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user : { type : mongoose.Schema.Types.ObjectId, ref : 'users', index : true },
  status : { type : String, enum : ["ACTIVE", "COMPLETED", "SCHEDULED"], default : "ACTIVE" },
  startTime : { type : Date, default : Date.now },
  endTime : { type : Date, default : Date.now }
}, { timestamps : true });

const Session = mongoose.model('sessions', sessionSchema);

export default Session;