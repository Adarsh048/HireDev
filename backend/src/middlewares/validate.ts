import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Generic Zod validation middleware factory.
 * Validates `req[target]` against the provided Zod schema.
 */
export const validate = (
  schema: AnyZodObject | ZodEffects<AnyZodObject>,
  target: ValidationTarget = 'body',
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        throw new ApiError(
          400,
          `Validation failed: ${details.map((d) => d.message).join(', ')}`,
        );
      }
      next(error);
    }
  };
};
