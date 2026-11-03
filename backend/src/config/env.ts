import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

/**
 * Environment variable validation schema.
 * Uses Zod to parse and validate all required env vars at startup.
 */
const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),

  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),

  JWT_ACCESS_EXPIRY: z.string().default('15m'),

  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  MAX_FILE_SIZE_MB: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validated environment configuration.
 * Throws a descriptive error at startup if any variable is missing or invalid.
 */
export const env: EnvConfig = envSchema.parse(process.env);
