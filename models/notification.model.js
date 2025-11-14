import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    type: { type: String, enum: ["BROADCAST", "MULTICAST", "UNICAST "], default: "UNICAST" },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model("notifications", notificationSchema);

export default Notification