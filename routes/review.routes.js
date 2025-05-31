import express from 'express';
import { createReview, getAllReviews, getReviewById } from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const reviewRouter = express.Router();

// Public routes (authenticated users only)
reviewRouter.post('/', createReview);

// Admin only routes
reviewRouter.get('/', authenticate, authorize('admin'), getAllReviews);
reviewRouter.get('/:id', authenticate, authorize('admin'), getReviewById);

export default reviewRouter;



