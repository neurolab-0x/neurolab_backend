import express from 'express';
import { createReview, getAllReviews, getReviewById } from '../controllers/review.controller.js';
import { authorize } from '../middleware/auth.middleware.js';
const reviewRouter = express.Router();

reviewRouter.post('/', createReview);
reviewRouter.get('/', authorize('admin'), getAllReviews);
reviewRouter.get('/:id', authorize('admin'), getReviewById);

export default reviewRouter;



