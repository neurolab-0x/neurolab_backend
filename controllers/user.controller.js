import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { deleteImage, getImageUrl } from '../utils/image.upload.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, email } = req.body;
    const updates = {};

    // Only update fields that are provided
    if (fullName) updates.fullName = fullName;
    if (username) updates.username = username;
    if (email) updates.email = email;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      const currentUser = await User.findById(req.user._id);
      if (currentUser.avatar && currentUser.avatar.includes('cloudinary')) {
        const publicId = currentUser.avatar.split('/').slice(-1)[0].split('.')[0];
        await deleteImage(publicId);
      }
      updates.avatar = getImageUrl(req.file);
    }

    // Check if username or email is already taken
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [
          { username: username || req.user.username },
          { email: email || req.user.email }
        ],
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password without validation
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { password: hashedPassword } },
      { runValidators: false }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password before deletion
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
      await deleteImage(publicId);
    }

    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
}; 