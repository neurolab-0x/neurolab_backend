import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import {
  getAllUsers,
  createAdmin,
  updateUserRole,
  deleteUser
} from '../controllers/admin.controller.js';

const router = express.Router();

// All routes require admin role
router.use(verifyToken);
router.use(checkRole('admin'));

// Admin routes
router.get('/users', getAllUsers);
router.post('/admins', createAdmin);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

export default router; 