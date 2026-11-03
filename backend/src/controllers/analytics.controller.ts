import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AnalyticsService } from '../services/analytics.service';

export const getSkillAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const data = await AnalyticsService.getSkillDemandAnalytics(userId);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getApplicationAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const data = await AnalyticsService.getApplicationAnalytics(userId);

  res.status(200).json({
    success: true,
    data,
  });
});

