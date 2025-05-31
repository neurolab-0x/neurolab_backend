import { Device } from '../models/device.models.js';
import { mqttService } from '../config/mqtt/config.js';

export const deviceController = {
  async createDevice(req, res) {
    try {
      const device = new Device({
        ...req.body,
        owner: req.user._id
      });
      await device.save();
      res.status(201).json(device);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getUserDevices(req, res) {
    try {
      const devices = await Device.findUserDevices(req.user._id);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getDevice(req, res) {
    try {
      const device = await Device.findOne({
        deviceId: req.params.deviceId,
        owner: req.user._id
      });

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      res.json(device);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateDevice(req, res) {
    try {
      const device = await Device.findOne({
        deviceId: req.params.deviceId,
        owner: req.user._id
      });

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      Object.assign(device, req.body);
      await device.save();

      res.json(device);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async assignDevice(req, res) {
    try {
      const device = await Device.findOne({
        deviceId: req.params.deviceId,
        owner: req.user._id
      });

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      await device.assignToUser(req.body.userId);
      res.json(device);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getDeviceStatus(req, res) {
    try {
      const device = await Device.findOne({
        deviceId: req.params.deviceId,
        owner: req.user._id
      });

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      const mqttStatus = mqttService.getDeviceStatus(req.params.deviceId);
      res.json({
        ...device.toJSON(),
        connectionStatus: mqttStatus
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getActiveDevices(req, res) {
    try {
      const devices = await Device.findActiveDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteDevice(req, res) {
    try {
      const device = await Device.findOneAndDelete({
        deviceId: req.params.deviceId,
        owner: req.user._id
      });

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      res.json({ message: 'Device deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}; 