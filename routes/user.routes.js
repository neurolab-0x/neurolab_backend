import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { updateProfile, getProfile, deleteProfile, getUserById } from '../controllers/user.controllers.js';

const user_router = express.Router();

user_router.put('/profile',authenticate, updateProfile);
user_router.get('/profile', authenticate, getProfile);
user_router.delete('/profile', authenticate, deleteProfile);
user_router.get('/profile/:id', authenticate, getUserById);

export default user_router;