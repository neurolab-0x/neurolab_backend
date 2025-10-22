import jwt from 'jsonwebtoken';
import { logger } from '../config/logger/config.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // ✅ Fetch the full user to get role
    const user = await User.findById(decoded.userId).select('+role');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user; // ✅ now req.user.role exists
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Middleware to check if user is authenticated and has required role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

const allowedRoles = roles.map(r => r.toLowerCase());
const userRole = req.user.role.toLowerCase();

if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
  return res.status(403).json({
    success: false,
    message: 'Insufficient permissions'
  });
}

    next();
  };
};

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { userId: decoded.id || decoded.userId, ...decoded };
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
``
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const newRoles = roles.map(role => role.toLowerCase())

    if (!newRoles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};


