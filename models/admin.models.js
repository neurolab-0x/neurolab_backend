import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  department: {
    type: String,
    required: true
  },
  adminSince: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
adminSchema.index({ user: 1 });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin; 