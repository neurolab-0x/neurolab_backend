import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
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
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    sampleRate: Number,
    channels: [String],
    duration: Number,
    algorithm: String,
    version: String
  },
  status: {
    type: String,
    enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PROCESSING'
  },
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
analysisSchema.index({ sessionId: 1, timestamp: -1 });
analysisSchema.index({ deviceId: 1, timestamp: -1 });
analysisSchema.index({ userId: 1, timestamp: -1 });

// Methods
analysisSchema.methods.markAsCompleted = function () {
  this.status = 'COMPLETED';
  return this.save();
};

analysisSchema.methods.markAsFailed = function (error) {
  this.status = 'FAILED';
  this.error = error;
  return this.save();
};

// Static methods
analysisSchema.statics.findSessionAnalyses = function (sessionId) {
  return this.find({ sessionId }).sort({ timestamp: -1 });
};

analysisSchema.statics.findUserAnalyses = function (userId) {
  return this.find({ userId }).sort({ timestamp: -1 });
};

analysisSchema.statics.findDeviceAnalyses = function (deviceId) {
  return this.find({ deviceId }).sort({ timestamp: -1 });
};

// Virtual for formatted results
analysisSchema.virtual('formattedResults').get(function () {
  if (this.status !== 'COMPLETED') return null;
  return this.results;
});

export const Analysis = mongoose.model('Analysis', analysisSchema); 