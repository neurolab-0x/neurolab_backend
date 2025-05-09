import User from "../models/user.model.js";
import { uploadProfilePicture } from "../utils/upload.cloudinary.js";

export const getProfile = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id).select("-password -_version -createdAt -updatedAt");
    if(!user){
      console.log("User not found");
    };
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const updateProfile = async (req, res) => {
  const { id } = req.user;
  const { profilePicture, firstName, lastName, username, email } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { profilePicture, firstName, lastName, username, email }, { new: true });
    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const deleteProfile = async (req, res) => {
  const { id } = req.user;
  try {
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const updateProfilePicture = async (req, res) => {
  const { id } = req.user;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    }
    const fileBuffer = req.file.buffer.toString("base64");
    if(!fileBuffer){
      return res.status(400).json({ message : "Error converting file to base64" });
    }
    const fileMimetype = req.file.mimetype;
    const url = await uploadProfilePicture(fileBuffer, fileMimetype);
    if(!url){
      return res.status(403).json({ message : "Error uploading file" });
    }
    user.profilePicture = url;
    await user.save();
    return res.status(200).json({ message: `Profile picture updated successfully for user ${user._id}`, url });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message : "Internal server error" });
  }
}

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if(!user){
      return res.status(404).json({ message : "User not found" });
    }
    return res.status(200).json({ message : "User deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User found", user });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ message: "Users found", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
}
