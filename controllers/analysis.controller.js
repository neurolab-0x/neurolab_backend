import { Analysis } from '../models/analysis.models.js';
import { Session } from '../models/session.models.js';
import { dataProcessor } from '../config/data-processor/config.js';

export const analysisController = {
  // Create a new analysis
  async createAnalysis(req, res) {
    try {
      const { sessionId, results, metadata } = req.body;

      // Check if session exists and belongs to user
      const session = await Session.findOne({
        _id: sessionId,
        userId: req.user._id
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const analysis = new Analysis({
        sessionId,
        deviceId: session.deviceId,
        userId: req.user._id,
        results,
        metadata
      });
      await analysis.save();

      res.status(201).json(analysis);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all analyses for a session
  async getSessionAnalyses(req, res) {
    try {
      const analyses = await Analysis.findSessionAnalyses(req.params.sessionId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a specific analysis
  async getAnalysis(req, res) {
    try {
      const analysis = await Analysis.findOne({
        _id: req.params.analysisId,
        userId: req.user._id
      });

      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update analysis status
  async updateAnalysisStatus(req, res) {
    try {
      const { status, error } = req.body;
      const analysis = await Analysis.findOne({
        _id: req.params.analysisId,
        userId: req.user._id
      });

      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }

      if (status === 'completed') {
        await analysis.markAsCompleted();
      } else if (status === 'failed') {
        await analysis.markAsFailed(error);
      }

      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get user's analyses
  async getUserAnalyses(req, res) {
    try {
      const analyses = await Analysis.findUserAnalyses(req.user._id);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get device's analyses
  async getDeviceAnalyses(req, res) {
    try {
      const analyses = await Analysis.findDeviceAnalyses(req.params.deviceId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get buffer status for a device
  async getBufferStatus(req, res) {
    try {
      const status = dataProcessor.getBufferStatus(req.params.deviceId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}; 