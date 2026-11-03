import { Worker, Job } from 'bullmq';
import { env } from '../../config/env';
import { getRedisClient } from '../../config/redis';
import { logger } from '../../utils/logger';
import { RefreshService } from '../../services/refresh.service';

export const startWorkers = () => {
  try {
    const redis = getRedisClient(env.REDIS_URL);

    // Source Sync Worker
    const sourceSyncWorker = new Worker(
      'source-sync',
      async (job: Job) => {
        logger.info(`[SourceSyncWorker] Processing sync job ${job.id} for source: ${job.data?.source}`);
      },
      { connection: redis },
    );

    // User 24h Refresh Worker
    const userRefreshWorker = new Worker(
      'user-refresh',
      async (job: Job) => {
        const { userId } = job.data;
        logger.info(`[UserRefreshWorker] Starting 24h recommendation cycle for user: ${userId}`);
        await RefreshService.triggerUserRefresh(userId);
      },
      { connection: redis },
    );

    sourceSyncWorker.on('failed', (job, err) => {
      logger.error(`Source sync job ${job?.id} failed:`, err);
    });

    userRefreshWorker.on('failed', (job, err) => {
      logger.error(`User refresh job ${job?.id} failed:`, err);
    });

    logger.info('BullMQ workers initialized.');
  } catch (err: any) {
    logger.warn('Redis or BullMQ worker setup skipped/deferred:', err.message);
  }
};

