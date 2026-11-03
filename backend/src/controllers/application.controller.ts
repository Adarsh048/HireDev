import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApplicationService } from '../services/application.service';

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const applications = await ApplicationService.getApplications(userId);

  res.status(200).json({
    success: true,
    data: { applications },
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const application = await ApplicationService.createApplication(userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Application tracked successfully',
    data: { application },
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const application = await ApplicationService.updateApplication(userId, id, req.body);

  res.status(200).json({
    success: true,
    message: 'Application updated successfully',
    data: { application },
  });
});

