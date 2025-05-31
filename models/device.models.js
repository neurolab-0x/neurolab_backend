import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['EEG', 'EEG_PLUS', 'RESEARCH']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
    default: 'ACTIVE'
  },
  metadata: {
    firmwareVersion: String,
    hardwareVersion: String,
    sampleRate: Number,
    channels: [String],
    lastCalibration: Date
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  connectionInfo: {
    lastConnected: Date,
    ipAddress: String,
    connectionType: {
      type: String,
      enum: ['wifi', 'bluetooth', 'usb'],
      default: 'wifi'
    }
  },
  settings: {
    bufferSize: {
      type: Number,
      default: 1000
    },
    dataFormat: {
      type: String,
      enum: ['raw', 'processed'],
      default: 'raw'
    },
    compression: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
deviceSchema.index({ owner: 1, status: 1 });
deviceSchema.index({ assignedTo: 1 });
deviceSchema.index({ 'connectionInfo.lastConnected': -1 });

// Methods
deviceSchema.methods.updateConnectionInfo = function (ipAddress) {
  this.connectionInfo.lastConnected = new Date();
  this.connectionInfo.ipAddress = ipAddress;
  return this.save();
};

deviceSchema.methods.assignToUser = function (userId) {
  this.assignedTo = userId;
  return this.save();
};

// Static methods
deviceSchema.statics.findActiveDevices = function () {
  return this.find({ status: 'ACTIVE' });
};

deviceSchema.statics.findUserDevices = function (userId) {
  return this.find({ owner: userId });
};

deviceSchema.statics.findAssignedDevices = function (userId) {
  return this.find({ assignedTo: userId });
};

export const Device = mongoose.model('Device', deviceSchema); 