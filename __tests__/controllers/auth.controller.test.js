import {
  signup,
  login,
  refresh,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout,
} from '../../controllers/auth.controller';
import User from '../../models/user.models';
import Doctor from '../../models/doctor.models';
import { EmailService } from '../../service/EmailService';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Mock dependencies
jest.mock('../../models/user.models.js');
jest.mock('../../models/doctor.models.js');
jest.mock('../../service/EmailService.js');
jest.mock('jsonwebtoken');
jest.mock('crypto');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return tokens on successful signup', async () => {
      req.body = {
        fullName: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
        avatar: 'some-avatar-url',
      };

      const mockUser = {
        _id: 'userId',
        role: 'USER',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('sometoken');
      crypto.randomBytes.mockReturnValue({
        toString: () => 'verificationToken',
      });
      EmailService.prototype.sendVerificationEmail.mockResolvedValue();

      await signup(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'test@example.com' }, { username: 'testuser' }],
      });
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
        })
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message:
            'Registration successful. Please check your email to verify your account.',
          accessToken: 'sometoken',
          refreshToken: 'sometoken',
        })
      );
    });

    it('should call next with an error if required fields are missing', async () => {
      req.body = {
        fullName: 'Test User',
        avatar: 'some-avatar-url',
        role: 'USER',
      };

      await signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with an error if user already exists', async () => {
      req.body = {
        fullName: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
        avatar: 'some-avatar-url',
      };

      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      await signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'userId',
        emailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      jwt.sign.mockReturnValue('sometoken');

      await login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          accessToken: 'sometoken',
          refreshToken: 'sometoken',
        })
      );
    });

    it('should return 400 if email or password are not provided', async () => {
      req.body = {
        email: 'test@example.com',
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email and password are required',
      });
    });

    it('should return 401 for invalid credentials if user is not found', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 401 if email is not verified', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        emailVerified: false,
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Please verify your email before logging in',
        verificationRequired: true,
      });
    });

    it('should return 401 for invalid credentials if password does not match', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'userId',
        emailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
});
