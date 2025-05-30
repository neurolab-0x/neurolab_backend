import express from 'express';
import { sessionController } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Session management routes
router.post('/', sessionController.createSession);
router.get('/', sessionController.getUserSessions);
router.get('/active', sessionController.getActiveSessions);
router.get('/:sessionId', sessionController.getSession);
router.post('/:sessionId/end', sessionController.endSession);

// Session analysis routes
router.get('/:sessionId/results', sessionController.getSessionResults);
router.post('/:sessionId/results', sessionController.addAnalysisResult);

export default router; 