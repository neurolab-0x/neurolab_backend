import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import crypto from 'crypto';
import { EmailService } from '../service/EmailService.js';

// Initialize email service
const emailService = new EmailService();

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET || 'secret321',
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET || 'secret123',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d' }
  );

  return { accessToken, refreshToken };
};

export const signup = async (req, res, next) => {
  try {
    const { fullName, username, email, password, avatar, role } = req.body;

    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Input validation
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['fullName', 'username', 'email', 'password']
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role || 'USER',
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`,
      verificationToken,
      emailVerified: false
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user);
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // Continue with user creation even if email fails
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update user with refresh token
    await User.findByIdAndUpdate(user._id, {
      refreshToken: refreshToken
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    // if (!user.emailVerified) {
    //   return res.status(401).json({ 
    //     message: 'Please verify your email before logging in',
    //     verificationRequired: true
    //   });
    // }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          lastLogin: new Date(),
          refreshToken: refreshToken
        }
      },
      { new: true, runValidators: true }
    );

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
      const { token } = req.params;
      
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
          return res.status(400).json({
              status: 'error',
              message: 'Invalid verification token'
          });
      }

      user.emailVerified = true;
      user.verificationToken = undefined;
      await user.save();

      res.status(200).json({
          status: 'success',
          message: 'Email verified successfully'
      });
    } catch (error) {
      res.status(400).json({
          status: 'error',
          message: error.message
      });
  }
}

export const requestPasswordReset = async (req, res) => {
  try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({
              status: 'error',
              message: 'User not found'
          });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      await this.emailService.sendPasswordResetEmail(user);

      res.status(200).json({
        status: 'success',
        message: 'Password reset email sent'
    });
} catch (error) {
    res.status(400).json({
        status: 'error',
        message: error.message
    });
}
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password has been reset',
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};