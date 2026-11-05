import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

/**
 * Environment variable validation schema.
 * Uses Zod to parse and validate all required env vars at startup.
 */
const envSchema = z.object({
  PORT: z.coerce.number().positive().default(5000),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  MONGODB_URI: z.string().default('mongodb://localhost:27017/devlaunch'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z
    .string()
    .default('devlaunch_default_access_secret_change_in_production_min_32'),

  JWT_REFRESH_SECRET: z
    .string()
    .default('devlaunch_default_refresh_secret_change_in_production_min_32'),

  JWT_ACCESS_EXPIRY: z.string().default('15m'),

  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  AI_SERVICE_URL: z.string().default('http://localhost:8000'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validated environment configuration.
 * Throws a descriptive error at startup if any variable is missing or invalid.
 */
export const env: EnvConfig = envSchema.parse(process.env);
