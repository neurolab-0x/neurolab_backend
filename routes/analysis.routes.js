import express from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const analysisRouter = express.Router();

// Apply authentication middleware to all routes
analysisRouter.use(authenticate);

// Analysis management routes
analysisRouter.post('/', analysisController.createAnalysis);
analysisRouter.get('/user', analysisController.getUserAnalyses);
analysisRouter.get('/device/:deviceId', analysisController.getDeviceAnalyses);
analysisRouter.get('/session/:sessionId', analysisController.getSessionAnalyses);
analysisRouter.get('/:analysisId', analysisController.getAnalysis);
analysisRouter.put('/:analysisId/status', analysisController.updateAnalysisStatus);

// Buffer status route
analysisRouter.get('/device/:deviceId/buffer', analysisController.getBufferStatus);

export default analysisRouter; 