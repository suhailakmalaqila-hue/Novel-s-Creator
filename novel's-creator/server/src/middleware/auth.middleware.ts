import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const token = authHeader.substring(7);

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
    };

    const result = await pool.query(
      `
      SELECT id, email, role
      FROM users
      WHERE id = $1
      `,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'User account not found'
      });
    }

    const user = result.rows[0];

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired authentication token'
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden'
      });
    }

    next();
  };
};