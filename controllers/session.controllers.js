import User from "../models/user.model.js";
import Session from "../models/session.model.js";

export const scheduleSession = async (req, res) => {
  const { id } = req.user;
  const { startTime, endTime } = req.body;
  if (!startTime || !endTime) {
    return res.status(400).json({ message: "Start time and end time are required" });
  }
  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ message: "Start time must be before end time" });
  }
  if (new Date(startTime) < new Date()) {
    return res.status(400).json({ message: "Start time must be in the future" });
  }
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    };
    const session = new Session({ user : id, startTime, endTime, status : "SCHEDULED" });
    await session.save();
    return res.status(201).json({ message : "Session scheduled successfully", session });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal server error" });
  }
}