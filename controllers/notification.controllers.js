import Notification from "../models/notification.model.js";

export const getAllNotifications = async (req, res) => {
  const { id } = req.user;
  try {
    const notifications = await Notification.find({ receiver : id });
    if(!notifications){
      return res.status(404).json({ message : "No notifications found" })
    }
    return res.status(200).json({ notifications });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal server error" });
  }
};

export const getAllUnreadNotifications = async (req,res) => {
  const { id } = req.user;
  try {
    const unreads = await Notification.find({ receiver : id, isRead : false });
    if(!unreads){
      return res.status(404).json({ message : "No unread notifications found" });
    }
    return res.status(200).json({ unreads });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal Server error" });
  }
}

export const readAllNotifications = async (req, res) => {
  const { id } = req.user;
  try {
    const notifications = await Notification.find({ receiver : id });
    if(!notifications){
      return res.status(404).json({ message : "No notifications found" });
    }
    notifications.forEach(notification => {
      notification.isRead = true;
      notification.save();
    });
    return res.status(200).json({ message : "All notifications read" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal server error" });
  }
}

export const readNotification = async (notificationId, req, res) => {
  const { id } = req.user;
  try{
    const notification = await Notification.findOne({ _id : notificationId, receiver : id });
    if(!notification){
      return res.status(404).json({ message : "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    return res.status(200).json({ message : "Notification read"})
  }catch(error){
    console.log(error.message);
    return res.status(500).json({ message : "Internal server error" })
  }
}