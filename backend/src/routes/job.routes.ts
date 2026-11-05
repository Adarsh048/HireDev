import { Router } from 'express';
import {
  getLatest,
  getRecommended,
  getByPlatform,
  getById,
  saveJob,
  getSavedJobs,
} from '../controllers/job.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { jobPaginationSchema, platformParamSchema } from '../validators/job.validator';

const router = Router();

// Public endpoint for latest genuine developer openings on Landing Page
router.get('/latest', getLatest);

// Protected endpoints requiring candidate authentication
router.use(authenticate);

router.get('/recommended', validate(jobPaginationSchema, 'query'), getRecommended);
router.get('/recommended/platform/:platform', validate(platformParamSchema, 'params'), getByPlatform);
router.get('/saved', validate(jobPaginationSchema, 'query'), getSavedJobs);
router.get('/platform/:platform', validate(platformParamSchema, 'params'), getByPlatform);
router.get('/:id', getById);
router.post('/:id/save', saveJob);

export default router;

