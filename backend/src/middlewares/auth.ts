import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

/**
 * Shape of the JWT payload attached to `req.user` after authentication.
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: 'candidate' | 'admin';
}

// Extend Express Request to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware.
 * Looks for a JWT in the `Authorization: Bearer <token>` header
 * or in an httpOnly cookie named `accessToken`.
 * Attaches the decoded payload to `req.user`.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // 2. Fallback to httpOnly cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication token is missing');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token has expired');
    }
    throw ApiError.unauthorized('Invalid authentication token');
  }
};
