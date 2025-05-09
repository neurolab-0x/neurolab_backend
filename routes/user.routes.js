import express from 'express';
import { authenticate, authenticateAdmin } from '../middleware/auth.middleware.js';
import { updateProfile, getProfile, deleteProfile, getUserById, getAllUsers, updateProfilePicture } from '../controllers/user.controllers.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage : storage });

const user_router = express.Router();

user_router.put('/profile',authenticate, updateProfile);
user_router.get('/profile', authenticate, getProfile);
user_router.delete('/profile', authenticate, deleteProfile);
user_router.get('/profile/:id', authenticate, getUserById);
user_router.get('/profiles', authenticateAdmin, getAllUsers);
user_router.post('/profile', authenticate, upload.single('profilePicture'), updateProfilePicture);

export default user_router;