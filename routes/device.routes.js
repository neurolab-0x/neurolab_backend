import express from 'express';
import { deviceController } from '../controllers/device.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const deviceRouter = express.Router();

// Apply authentication middleware to all routes
deviceRouter.use(authenticate);

// Device management routes
deviceRouter.post('/', deviceController.createDevice);
deviceRouter.get('/', deviceController.getUserDevices);
deviceRouter.get('/active', deviceController.getActiveDevices);
deviceRouter.get('/:deviceId', deviceController.getDevice);
deviceRouter.put('/:deviceId', deviceController.updateDevice);
deviceRouter.delete('/:deviceId', deviceController.deleteDevice);

// Device status and assignment routes
deviceRouter.get('/:deviceId/status', deviceController.getDeviceStatus);
deviceRouter.post('/:deviceId/assign', deviceController.assignDevice);

export default deviceRouter; 