import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

/**
 * Global Express error handler.
 * Distinguishes between operational ApiErrors and unexpected errors.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Default to 500
  let statusCode = 500;
  let message = 'Internal server error';
  let details: Record<string, unknown> | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if ((err as any).code === 11000) {
    // MongoDB duplicate key
    statusCode = 409;
    message = 'Duplicate resource';
    details = { keyPattern: (err as any).keyPattern };
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, { stack: err.stack });
  } else {
    logger.warn(`[${statusCode}] ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
