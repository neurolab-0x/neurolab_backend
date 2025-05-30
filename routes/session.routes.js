import express from 'express';
import { sessionController } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const sessionRouter = express.Router();

// Apply authentication middleware to all routes
sessionRouter.use(authenticate);

// Session management routes
sessionRouter.post('/', sessionController.createSession);
sessionRouter.get('/', sessionController.getUserSessions);
sessionRouter.get('/active', sessionController.getActiveSessions);
sessionRouter.get('/:sessionId', sessionController.getSession);
sessionRouter.post('/:sessionId/end', sessionController.endSession);

// Session analysis routes
sessionRouter.get('/:sessionId/results', sessionController.getSessionResults);
sessionRouter.post('/:sessionId/results', sessionController.addAnalysisResult);

export default sessionRouter; 