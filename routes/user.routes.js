import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/user.controller.js';
import { uploadAvatar, handleUploadError } from '../utils/image.upload.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Profile management routes
router.get('/me', getProfile);
router.patch('/me', uploadAvatar, handleUploadError, updateProfile);
router.post('/me/password', changePassword);
router.delete('/me', deleteAccount);

export default router;
