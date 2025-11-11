import express from 'express';
import { authenticate,authorize } from '../middleware/auth.middleware.js';
import {
  getAllUsers,
  createAdmin,
  updateUserRole,
  deleteUser
} from '../controllers/admin.controller.js';

const adminRouter = express.Router();

// All routes require admin role
adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));

// Admin routes
adminRouter.get('/users', getAllUsers);
adminRouter.post('/admins', createAdmin);
adminRouter.patch('/users/:userId/role', updateUserRole);
adminRouter.delete('/users/:userId', deleteUser);

export default adminRouter; 