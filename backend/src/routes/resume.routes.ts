import { Router } from 'express';
import { upload, getProfile, updateProfile } from '../controllers/resume.controller';
import { authenticate } from '../middlewares/auth';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { resumeUpload } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { updateProfileSchema } from '../validators/resume.validator';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadLimiter, resumeUpload, upload);
router.get('/', getProfile);
router.patch('/', validate(updateProfileSchema), updateProfile);
router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);

export default router;
