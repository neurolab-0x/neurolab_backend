import express from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const analysisRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Analysis:
 *       type: object
 *       required:
 *         - deviceId
 *         - type
 *         - parameters
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         deviceId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [EEG, ECG, EMG, COMBINED]
 *           example: EEG
 *         parameters:
 *           type: object
 *           properties:
 *             samplingRate:
 *               type: number
 *               example: 256
 *             duration:
 *               type: number
 *               example: 300
 *             channels:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Fp1", "Fp2", "C3", "C4"]
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: processing
 *         results:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /analysis:
 *   post:
 *     summary: Create a new analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - type
 *               - parameters
 *             properties:
 *               deviceId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               type:
 *                 type: string
 *                 enum: [EEG, ECG, EMG, COMBINED]
 *                 example: "EEG"
 *               parameters:
 *                 type: object
 *                 properties:
 *                   samplingRate:
 *                     type: number
 *                     example: 256
 *                   duration:
 *                     type: number
 *                     example: 300
 *                   channels:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Fp1", "Fp2", "C3", "C4"]
 *     responses:
 *       201:
 *         description: Analysis created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analysis:
 *                   $ref: '#/components/schemas/Analysis'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
analysisRouter.post('/', authenticate, analysisController.createAnalysis);

// Apply authentication middleware to all routes
analysisRouter.use(authenticate);

// Analysis management routes
analysisRouter.get('/user', analysisController.getUserAnalyses);
analysisRouter.get('/device/:deviceId', analysisController.getDeviceAnalyses);
analysisRouter.get('/session/:sessionId', analysisController.getSessionAnalyses);
analysisRouter.get('/:analysisId', analysisController.getAnalysis);
analysisRouter.put('/:analysisId/status', analysisController.updateAnalysisStatus);

// Buffer status route
analysisRouter.get('/device/:deviceId/buffer', analysisController.getBufferStatus);

export default analysisRouter; 