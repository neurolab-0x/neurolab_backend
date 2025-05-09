import express from 'express';
import { contactUs, requestPartnership, getContacts, getPartnershipRequests } from '../controllers/reviews.controllers.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const review_router = express.Router();

review_router.post('/reviews', contactUs);
review_router.post('/partnership-requests', requestPartnership);
review_router.get('/reviews', authenticateAdmin, getContacts);
review_router.get('/partnership-requests', authenticateAdmin, getPartnershipRequests);

export default review_router;