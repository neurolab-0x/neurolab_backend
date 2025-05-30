import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  medicalDegree: {
    degree: String,
    institution: String,
    year: Number,
    country: String
  },
  certifications: [{
    name: String,
    issuingBody: String,
    dateIssued: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'pending'],
      default: 'active'
    }
  }],
  practiceAreas: [{
    type: String,
    required: true
  }],
  patients: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'transferred'],
      default: 'active'
    }
  }],
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  consultationFee: {
    type: Number,
    required: true
  },
  hospitalAffiliations: [{
    name: String,
    address: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: true
    }
  }],
  researchInterests: [{
    area: String,
    description: String
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
doctorSchema.index({ user: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'patients.patientId': 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor; 