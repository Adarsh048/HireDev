import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints.
 * 10 requests per 15-minute window.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many auth attempts. Please try again later.' },
  },
});

/**
 * General API rate limiter.
 * 100 requests per 15-minute window.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests. Please slow down.' },
  },
});

/**
 * Upload rate limiter.
 * 5 requests per hour.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Upload limit reached. Please try again later.' },
  },
});
