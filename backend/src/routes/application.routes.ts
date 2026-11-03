import { Router } from 'express';
import { getAll, create, update } from '../controllers/application.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createApplicationSchema, updateApplicationSchema } from '../validators/application.validator';

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.post('/', validate(createApplicationSchema), create);
router.patch('/:id', validate(updateApplicationSchema), update);

export default router;

