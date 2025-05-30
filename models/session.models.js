import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'paused'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  metadata: {
    deviceType: String,
    deviceVersion: String,
    sampleRate: Number,
    channels: [String]
  },
  analysisResults: [{
    timestamp: Date,
    results: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
sessionSchema.index({ deviceId: 1, status: 1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ startedAt: -1 });

// Methods
sessionSchema.methods.endSession = function () {
  this.status = 'ended';
  this.endedAt = new Date();
  return this.save();
};

sessionSchema.methods.addAnalysisResult = function (result) {
  this.analysisResults.push({
    timestamp: new Date(),
    results: result
  });
  return this.save();
};

// Static methods
sessionSchema.statics.findActiveSessions = function () {
  return this.find({ status: 'active' });
};

sessionSchema.statics.findUserSessions = function (userId) {
  return this.find({ userId }).sort({ startedAt: -1 });
};

sessionSchema.statics.findDeviceSessions = function (deviceId) {
  return this.find({ deviceId }).sort({ startedAt: -1 });
};

export const Session = mongoose.model('Session', sessionSchema); 