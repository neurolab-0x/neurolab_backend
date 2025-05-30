import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/user.controller.js';
import { uploadAvatar, handleUploadError } from '../utils/image.upload.js';
import { authorize } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

// All routes require authentication
userRouter.use(authorize);

// Profile management routes
userRouter.get('/me', getProfile);
userRouter.patch('/me', uploadAvatar, handleUploadError, updateProfile);
userRouter.post('/me/password', changePassword);
userRouter.delete('/me', deleteAccount);

export default userRouter;
