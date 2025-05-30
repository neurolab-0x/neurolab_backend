import express from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Analysis management routes
router.post('/', analysisController.createAnalysis);
router.get('/user', analysisController.getUserAnalyses);
router.get('/device/:deviceId', analysisController.getDeviceAnalyses);
router.get('/session/:sessionId', analysisController.getSessionAnalyses);
router.get('/:analysisId', analysisController.getAnalysis);
router.put('/:analysisId/status', analysisController.updateAnalysisStatus);

// Buffer status route
router.get('/device/:deviceId/buffer', analysisController.getBufferStatus);

export default router; 