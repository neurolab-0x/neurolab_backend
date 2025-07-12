import express from 'express';
import { sessionController } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const sessionRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       required:
 *         - deviceId
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         deviceId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [EEG, ECG, EMG, COMBINED]
 *           example: EEG
 *         status:
 *           type: string
 *           enum: [active, completed, terminated]
 *           example: active
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *           nullable: true
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
 *         results:
 *           type: object
 *           nullable: true
 */

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
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
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/Session'
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
sessionRouter.post('/', verifyToken, sessionController.createSession);

/**
 * @swagger
 * /sessions/{sessionId}/end:
 *   post:
 *     summary: End a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
sessionRouter.post('/:sessionId/end', verifyToken, sessionController.endSession);

/**
 * @swagger
 * /sessions/{sessionId}/results:
 *   post:
 *     summary: Add analysis results to a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - results
 *             properties:
 *               results:
 *                 type: object
 *                 example: {
 *                   "frequencyBands": {
 *                     "delta": [0.5, 4],
 *                     "theta": [4, 8],
 *                     "alpha": [8, 13],
 *                     "beta": [13, 30],
 *                     "gamma": [30, 100]
 *                   },
 *                   "powerSpectrum": {
 *                     "frequencies": [0, 1, 2, ..., 100],
 *                     "powers": [0.1, 0.2, 0.3, ...]
 *                   }
 *                 }
 *     responses:
 *       200:
 *         description: Results added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
sessionRouter.post('/:sessionId/results', verifyToken, sessionController.addAnalysisResult);

/**
 * @swagger
 * /sessions/{sessionId}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
sessionRouter.get('/:sessionId', verifyToken, sessionController.getSession);

// Apply authentication middleware to all routes
sessionRouter.use(authenticate);

// Session management routes
sessionRouter.get('/', sessionController.getUserSessions);
sessionRouter.get('/active', sessionController.getActiveSessions);
sessionRouter.get('/:sessionId/results', sessionController.getSessionResults);
sessionRouter.post('/:sessionId/results', sessionController.addAnalysisResult);

export default sessionRouter; 