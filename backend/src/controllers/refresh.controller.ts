import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { RefreshService } from '../services/refresh.service';

export const getRefreshStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const status = await RefreshService.getRefreshStatus(userId);

  res.status(200).json({
    success: true,
    data: status,
  });
});

export const triggerRefresh = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await RefreshService.triggerUserRefresh(userId);

  res.status(200).json({
    success: true,
    message: 'Job discovery refresh triggered successfully',
  });
});

