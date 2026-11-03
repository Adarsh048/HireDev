import { Router } from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);

export default router;

