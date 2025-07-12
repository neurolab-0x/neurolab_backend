import express from 'express';
import { deviceController } from '../controllers/device.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const deviceRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - serialNumber
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: EEG Device 1
 *         type:
 *           type: string
 *           enum: [EEG, ECG, EMG]
 *           example: EEG
 *         serialNumber:
 *           type: string
 *           example: SN123456
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *           example: active
 *         assignedTo:
 *           type: string
 *           format: uuid
 *           nullable: true
 */

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Device'
 *     responses:
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 device:
 *                   $ref: '#/components/schemas/Device'
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
deviceRouter.post('/', verifyToken, deviceController.createDevice);

// Apply authentication middleware to all routes
deviceRouter.use(authenticate);

// Device management routes
deviceRouter.get('/', deviceController.getUserDevices);
deviceRouter.get('/active', deviceController.getActiveDevices);

/**
 * @swagger
 * /devices/{deviceId}:
 *   get:
 *     summary: Get device by ID
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 device:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
deviceRouter.get('/:deviceId', verifyToken, deviceController.getDevice);

/**
 * @swagger
 * /devices/{deviceId}:
 *   put:
 *     summary: Update device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [EEG, ECG, EMG]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *     responses:
 *       200:
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 device:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
deviceRouter.put('/:deviceId', verifyToken, deviceController.updateDevice);

deviceRouter.delete('/:deviceId', deviceController.deleteDevice);

/**
 * @swagger
 * /devices/{deviceId}/status:
 *   get:
 *     summary: Get device status
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   enum: [active, inactive, maintenance]
 *                   example: active
 *                 lastUpdate:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
deviceRouter.get('/:deviceId/status', verifyToken, deviceController.getDeviceStatus);

/**
 * @swagger
 * /devices/{deviceId}/assign:
 *   post:
 *     summary: Assign device to user
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Device assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Device assigned successfully
 *       404:
 *         description: Device or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
deviceRouter.post('/:deviceId/assign', verifyToken, deviceController.assignDevice);

export default deviceRouter; 