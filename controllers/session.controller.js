import { Session } from '../models/session.models.js';
import { Device } from '../models/device.models.js';
import { sessionManager } from '../config/session-manager/config.js';

export const sessionController = {
  async createSession(req, res) {
    try {
      const { deviceId } = req.body;

      const device = await Device.findOne({
        deviceId,
        owner: req.user._id
      });

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      const session = new Session({
        deviceId,
        userId: req.user._id,
        metadata: {
          deviceType: device.type,
          deviceVersion: device.metadata.firmwareVersion,
          sampleRate: device.metadata.sampleRate,
          channels: device.metadata.channels
        }
      });
      await session.save();

      await sessionManager.createUserSession(req.user._id, deviceId);

      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getUserSessions(req, res) {
    try {
      const sessions = await Session.findUserSessions(req.user._id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getSession(req, res) {
    try {
      const session = await Session.findOne({
        _id: req.params.sessionId,
        userId: req.user._id
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async endSession(req, res) {
    try {
      const session = await Session.findOne({
        _id: req.params.sessionId,
        userId: req.user._id
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      await session.endSession();

      await sessionManager.endUserSession(req.user._id);

      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getActiveSessions(req, res) {
    try {
      const sessions = await Session.findActiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getSessionResults(req, res) {
    try {
      const session = await Session.findOne({
        _id: req.params.sessionId,
        userId: req.user._id
      }).populate('analysisResults');

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      res.json(session.analysisResults);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async addAnalysisResult(req, res) {
    try {
      const session = await Session.findOne({
        _id: req.params.sessionId,
        userId: req.user._id
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      await session.addAnalysisResult(req.body.results);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}; 