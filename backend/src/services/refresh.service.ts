import { RefreshSchedule } from '../models/refreshSchedule.model';
import { RecommendationBatch } from '../models/recommendationBatch.model';
import { MatchingService } from './matching.service';
import { logger } from '../utils/logger';

export class RefreshService {
  /**
   * Retrieves current refresh status and next countdown for candidate
   */
  public static async getRefreshStatus(userId: string) {
    let schedule = await RefreshSchedule.findOne({ user: userId });

    if (!schedule) {
      const nextRefreshAt = new Date();
      nextRefreshAt.setHours(nextRefreshAt.getHours() + 24);

      schedule = await RefreshSchedule.create({
        user: userId,
        nextRefreshAt,
        isActive: true,
      });
    }

    const latestBatch = await RecommendationBatch.findOne({ user: userId }).sort({ generatedAt: -1 });

    return {
      lastRefreshAt: schedule.lastRefreshAt || latestBatch?.generatedAt,
      nextRefreshAt: schedule.nextRefreshAt,
      status: latestBatch?.status || 'idle',
      consecutiveFailures: schedule.consecutiveFailures,
      lastError: schedule.lastError,
    };
  }

  /**
   * Triggers a manual or scheduled refresh cycle for a user
   */
  public static async triggerUserRefresh(userId: string): Promise<void> {
    try {
      await MatchingService.matchCandidate(userId);

      const nextRefreshAt = new Date();
      nextRefreshAt.setHours(nextRefreshAt.getHours() + 24);

      await RefreshSchedule.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            lastRefreshAt: new Date(),
            nextRefreshAt,
            consecutiveFailures: 0,
            lastError: undefined,
          },
        },
        { upsert: true },
      );
    } catch (err: any) {
      logger.error(`Refresh failed for user ${userId}:`, err.message);
      await RefreshSchedule.findOneAndUpdate(
        { user: userId },
        {
          $inc: { consecutiveFailures: 1 },
          $set: { lastError: err.message },
        },
        { upsert: true },
      );
      throw err;
    }
  }
}

