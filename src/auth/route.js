import { Router } from 'express';
import * as authController from './controller.js';
import { authMiddleware } from '../common/authMiddleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;