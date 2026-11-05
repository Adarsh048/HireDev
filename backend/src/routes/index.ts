import { Router } from 'express';
import authRoutes from './auth.routes';
import resumeRoutes from './resume.routes';
import jobRoutes from './job.routes';
import refreshRoutes from './refresh.routes';
import applicationRoutes from './application.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/profile', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/refresh', refreshRoutes);
router.use('/applications', applicationRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

