import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { deleteImage, getImageUrl } from '../utils/image.upload.js';
import { logger } from '../config/logger/config.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User ID not found in token'
      });
    }

    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    logger.info(`User profile fetched for user ${userId}`);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  const { userId } = req.user;
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
      const currentUser = await User.findById(userId);
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
          { username: username || currentUser.username },
          { email: email || currentUser.email }
        ],
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: userId },
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
  const { userId } = req.user;
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
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
      { _id: userId },
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
  const { userId } = req.user;
  try {
    const { password } = req.body;

    const user = await User.findById(userId);
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

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
}; 