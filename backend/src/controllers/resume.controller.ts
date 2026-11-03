import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ResumeService } from '../services/resume.service';
import { ApiError } from '../utils/ApiError';

export const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload a PDF or DOCX resume file');
  }

  const userId = req.user!.userId;
  const result = await ResumeService.processResumeUpload(userId, req.file);

  res.status(201).json({
    success: true,
    message: 'Resume uploaded and analyzed successfully',
    data: result,
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await ResumeService.getProfile(userId);

  res.status(200).json({
    success: true,
    data: { profile },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await ResumeService.updateProfile(userId, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { profile },
  });
});

