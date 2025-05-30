import mongoose from 'mongoose';

const fileUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['eeg', 'csv', 'edf', 'bdf']
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading'
  },
  analysisResults: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    fileSize: Number,
    channels: [String],
    sampleRate: Number,
    duration: Number,
    cloudinaryId: String,
    cloudinaryUrl: String,
    cloudinaryVersion: String,
    cloudinaryFormat: String,
    cloudinaryResourceType: String
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
fileUploadSchema.index({ userId: 1, status: 1 });
fileUploadSchema.index({ createdAt: -1 });
fileUploadSchema.index({ 'metadata.cloudinaryId': 1 });

// Methods
fileUploadSchema.methods.markAsProcessing = function () {
  this.status = 'processing';
  return this.save();
};

fileUploadSchema.methods.markAsCompleted = function (results) {
  this.status = 'completed';
  this.analysisResults = results;
  return this.save();
};

fileUploadSchema.methods.markAsFailed = function (error) {
  this.status = 'failed';
  this.error = error;
  return this.save();
};

// Static methods
fileUploadSchema.statics.findUserUploads = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

export const FileUpload = mongoose.model('FileUpload', fileUploadSchema); 