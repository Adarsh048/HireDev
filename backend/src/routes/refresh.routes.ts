import { Router } from 'express';
import { getRefreshStatus, triggerRefresh } from '../controllers/refresh.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/status', getRefreshStatus);
router.post('/trigger', triggerRefresh);

export default router;

