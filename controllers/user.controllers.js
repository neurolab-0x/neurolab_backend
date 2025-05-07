import User from "../models/user.model.js";

export const getProfile = async (req, res) => {
  const { id } = req.user;
  try {
    return id;
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}

export const updateProfile = async (req, res) => {
  const { id } = req.user;
  const { firstName, lastName, username, email } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { firstName, lastName, username, email }, { new: true });
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
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
}
