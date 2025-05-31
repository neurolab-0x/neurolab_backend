import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: [2, 'Full name must be at least 2 characters long'] },
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: [3, 'Username must be at least 3 characters long'], match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, validate: [validator.isEmail, 'Please provide a valid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [8, 'Password must be at least 8 characters long'], select: false },
  avatar: { type: String, default: 'default-avatar.png' },
  role: { type: String, enum: ['USER', 'ADMIN', 'DOCTOR'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  phone: { type: String, validate: [validator.isMobilePhone, 'Please provide a valid phone number'] },
  address: { street: String, city: String, state: String, country: String, zipCode: String },
  refreshToken: { type: String, select: false }
}, { timestamps: true });

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.methods.getRoleProfile = async function () {
  switch (this.role) {
    case 'ADMIN':
      return await mongoose.model('ADMIN').findOne({ user: this._id });
    case 'DOCTOR':
      return await mongoose.model('DOCTOR').findOne({ user: this._id });
    case 'USER':
      return await mongoose.model('USER').findOne({ user: this._id });
    default:
      return null;
  }
};

const User = mongoose.model("User", userSchema);

export default User;