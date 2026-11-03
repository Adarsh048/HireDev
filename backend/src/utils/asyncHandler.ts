import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler so that rejected promises
 * are automatically forwarded to the global error handler via `next(err)`.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
