import express from 'express';
import { deviceController } from '../controllers/device.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Device management routes
router.post('/', deviceController.createDevice);
router.get('/', deviceController.getUserDevices);
router.get('/active', deviceController.getActiveDevices);
router.get('/:deviceId', deviceController.getDevice);
router.put('/:deviceId', deviceController.updateDevice);
router.delete('/:deviceId', deviceController.deleteDevice);

// Device status and assignment routes
router.get('/:deviceId/status', deviceController.getDeviceStatus);
router.post('/:deviceId/assign', deviceController.assignDevice);

export default router; 