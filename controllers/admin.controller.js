import User from '../models/user.models.js';
import Admin from '../models/admin.models.js';
import mongoose from 'mongoose';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await user.getRoleProfile();
        return {
          ...user.toObject(),
          profile
        };
      })
    );
    res.json({ users: usersWithProfiles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, username, email, password, department, permissions } = req.body;

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role: 'ADMIN'
    });

    const admin = await Admin.create({
      user: user._id,
      department,
      permissions: permissions || ['manage_users']
    });

    user.adminProfile = admin._id;
    await user.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        ...user.toObject(),
        profile: admin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};

export const updateAdminPermissions = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { permissions } = req.body;

    const admin = await Admin.findOneAndUpdate(
      { user: adminId },
      { $set: { permissions } },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      message: 'Admin permissions updated successfully',
      admin
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating permissions', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, roleData } = req.body;

    if (!['USER', 'ADMIN', 'DOCTOR'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    let roleProfile = null;
    if (role !== 'USER') {
      const Model = {
        ADMIN: Admin,
        DOCTOR: mongoose.model('DOCTOR'),
        USER: mongoose.model('USER')
      }[role];

      if (Model) {
        roleProfile = await Model.create({
          user: user._id,
          ...roleData
        });

        user[`${role}Profile`] = roleProfile._id;
        await user.save();
      }
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        ...user.toObject(),
        profile: roleProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const roleProfile = await user.getRoleProfile();
    if (roleProfile) {
      await roleProfile.deleteOne();
    }
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}; 