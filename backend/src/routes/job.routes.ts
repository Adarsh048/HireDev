import { Router } from 'express';
import {
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

router.use(authenticate);

router.get('/recommended', validate(jobPaginationSchema, 'query'), getRecommended);
router.get('/saved', validate(jobPaginationSchema, 'query'), getSavedJobs);
router.get('/platform/:platform', validate(platformParamSchema, 'params'), getByPlatform);
router.get('/:id', getById);
router.post('/:id/save', saveJob);

export default router;

