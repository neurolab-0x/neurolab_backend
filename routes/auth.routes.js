import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, refresh, logout } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again later'
});

// Routes
authRouter.post('/register', authLimiter, signup);
authRouter.post('/login', authLimiter, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', verifyToken, logout);

export default authRouter;
