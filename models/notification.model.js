import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
  receiver : { type : mongoose.Schema.Types.ObjectId, ref : "user", index : true },
  message : { type : String, required : true },
  isRead : { type : Boolean, default : false, index : true }
}, { timestamps : true });

const Notification = mongoose.model("notifications", notificationSchema);

export default Notification;