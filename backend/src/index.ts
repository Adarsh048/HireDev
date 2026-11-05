import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import { getRedisClient } from './config/redis';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';
import { logger } from './utils/logger';
import './jobs/connectors';
import { startWorkers } from './jobs/scheduler/workers';

const app = express();

// Security and utility middleware
app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN.includes(',')
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : env.CORS_ORIGIN;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (Array.isArray(allowedOrigins)) {
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
      } else if (allowedOrigins === '*' || allowedOrigins === origin) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all standard API routes
app.use('/api', apiLimiter);

// Health check endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'DevLaunch Backend API' });
});
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'DevLaunch Backend API' });
});

// Mount application API routes (both /api and root / for flexible reverse-proxy routing)
app.use('/api', routes);
app.use('/', routes);

// Global Error Handler
app.use(errorHandler);

const bootstrap = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB(env.MONGODB_URI);

    // 2. Initialize Redis & background workers (optional/non-blocking if Redis not ready)
    try {
      getRedisClient(env.REDIS_URL);
      startWorkers();
    } catch (redisErr: any) {
      logger.warn(`Redis initialization notice: ${redisErr.message}`);
    }

    // 3. Start Express server
    const server = app.listen(env.PORT, () => {
      logger.info(`DevLaunch API server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err: any) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

bootstrap();

export default app;
