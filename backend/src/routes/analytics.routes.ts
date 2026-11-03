import { Router } from 'express';
import { getSkillAnalytics, getApplicationAnalytics } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/skills', getSkillAnalytics);
router.get('/applications', getApplicationAnalytics);

export default router;

