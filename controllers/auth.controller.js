import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import crypto from 'crypto';
import { EmailService } from '../service/EmailService.js';
import Doctor from '../models/doctor.models.js';

// Initialize email service
const emailService = new EmailService();

(async () => {
  try {
    await emailService.init();
    console.log('✅ Email service initialized successfully');
  } catch (error) {
    console.error('⚠️ Failed to initialize email service:', error);
  }
})();

// ✅ Helper: generate access & refresh tokens with role
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET || 'secret321',
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15d' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || 'secret123',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d' }
  );

  return { accessToken, refreshToken };
};

// ✅ Helper: issue new tokens & update user refresh token
const issueTokensAndUpdateUser = async (user) => {
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

// ====================== SIGNUP ======================
export const signup = async (req, res, next) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    const verificationToken = crypto.randomBytes(32).toString('hex');

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['fullName', 'username', 'email', 'password'],
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email.toLowerCase()
            ? 'Email already registered'
            : 'Username already taken',
      });
    }

    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role || 'USER',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`,
      verificationToken,
      emailVerified: false,
    });

    if (role.toLowerCase() === 'doctor') {
      const doctor = await Doctor.create({
          user: user._id,
          specialization: req.body.specialization || 'surgeon',
          licenseNumber: req.body.licenseNumber || 'D123',
          consultationFee: req.body.consultationFee || 1000,
      });
    }


    try {
      await emailService.sendVerificationEmail(user);
    } catch (emailError) {
      console.error('⚠️ Verification email failed:', emailError);
    }

    const { accessToken, refreshToken } = await issueTokensAndUpdateUser(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.emailVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in',
        verificationRequired: true,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = await issueTokensAndUpdateUser(user);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// ====================== REFRESH TOKEN ======================
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = await issueTokensAndUpdateUser(user);
    res.json({ message: 'Token refreshed successfully', ...tokens });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// ====================== VERIFY EMAIL ======================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// ====================== PASSWORD RESET REQUEST ======================
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(user);

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// ====================== RESET PASSWORD ======================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Password reset token is invalid or expired' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const { accessToken, refreshToken } = await issueTokensAndUpdateUser(user);

    res.json({
      status: 'success',
      message: 'Password has been reset',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// ====================== LOGOUT ======================
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};
