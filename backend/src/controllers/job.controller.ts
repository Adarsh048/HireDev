import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { JobService } from '../services/job.service';

export const getLatest = asyncHandler(async (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'all';
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string, 10) || 6));

  const jobs = await JobService.getLatestJobs(category, limit);

  res.status(200).json({
    success: true,
    data: {
      jobs,
      category,
      total: jobs.length,
    },
  });
});

export const getRecommended = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const { recommendations, total } = await JobService.getRecommendedJobs(userId, page, limit);

  res.status(200).json({
    success: true,
    data: { recommendations },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getByPlatform = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { platform } = req.params;

  const recommendations = await JobService.getRecommendedByPlatform(userId, platform);

  res.status(200).json({
    success: true,
    data: { recommendations, platform },
  });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  const result = await JobService.getJobById(id, userId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const saveJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { notes } = req.body;

  const result = await JobService.toggleSaveJob(userId, id, notes);

  res.status(200).json({
    success: true,
    message: result.saved ? 'Job saved' : 'Job removed from saved list',
    data: result,
  });
});

export const getSavedJobs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const { savedJobs, total } = await JobService.getSavedJobs(userId, page, limit);

  res.status(200).json({
    success: true,
    data: { savedJobs },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

