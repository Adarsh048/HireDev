import { Queue } from 'bullmq';
import { env } from '../../config/env';
import { getRedisClient } from '../../config/redis';

let sourceSyncQueue: Queue | null = null;
let userRefreshQueue: Queue | null = null;

export const getSourceSyncQueue = (): Queue => {
  if (!sourceSyncQueue) {
    sourceSyncQueue = new Queue('source-sync', {
      connection: getRedisClient(env.REDIS_URL),
    });
  }
  return sourceSyncQueue;
};

export const getUserRefreshQueue = (): Queue => {
  if (!userRefreshQueue) {
    userRefreshQueue = new Queue('user-refresh', {
      connection: getRedisClient(env.REDIS_URL),
    });
  }
  return userRefreshQueue;
};

