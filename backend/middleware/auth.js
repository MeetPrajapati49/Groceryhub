import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'groceryhub-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Extract token from Authorization header
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// Required authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    // Try JWT first
    if (token) {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      return next();
    }
    
    // Fallback to session (for backward compatibility during transition)
    if (req.session?.userId) {
      req.userId = req.session.userId;
      return next();
    }
    
    return res.status(401).json({ 
      error: 'AUTH_REQUIRED',
      message: 'Please login to continue'
    });
  } catch (error) {
    // Token expired or invalid
    return res.status(401).json({ 
      error: 'INVALID_TOKEN',
      message: 'Session expired. Please login again.'
    });
  }
};

// Optional authentication (for routes that work with or without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    } else if (req.session?.userId) {
      req.userId = req.session.userId;
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }
  next();
};

// Admin authentication middleware
export const adminAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    // Try JWT first
    if (token) {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    } else if (req.session?.userId) {
      // Fallback to session
      req.userId = req.session.userId;
    } else {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authMiddleware;
