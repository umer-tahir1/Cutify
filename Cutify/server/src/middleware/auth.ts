import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import config from '../config';

// Verify JWT and attach user to request
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.id).select('email role isActive');
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Token is invalid or user no longer exists.',
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token has expired. Please login again.',
      });
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
      return;
    }
    next(error);
  }
};

// Optional authentication - sets user if token present, continues if not
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.id).select('email role isActive');
    if (user && user.isActive) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch {
    // Token invalid, but that's okay for optional auth
    next();
  }
};

// Admin-only middleware
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required.',
    });
    return;
  }

  next();
};

// Superadmin-only middleware
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: 'Super admin access required.',
    });
    return;
  }

  next();
};
