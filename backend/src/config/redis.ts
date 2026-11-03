import Redis from 'ioredis';
import { logger } from '../utils/logger';

/**
 * Creates and exports a shared ioredis client.
 * Connection errors are logged but do not crash the process,
 * allowing the app to degrade gracefully when Redis is unavailable.
 */
export const createRedisClient = (url: string): Redis => {
  const client = new Redis(url, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: true,
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error('Redis max retries reached — giving up');
        return null;
      }
      return Math.min(times * 200, 5000);
    },
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('error', (err) => {
    logger.error('Redis client error', { error: err.message });
  });

  client.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return client;
};

/** Lazily-initialised singleton — call after env is loaded. */
let redisClient: Redis | null = null;

export const getRedisClient = (url?: string): Redis => {
  if (!redisClient) {
    if (!url) throw new Error('Redis URL required for first initialisation');
    redisClient = createRedisClient(url);
  }
  return redisClient;
};
