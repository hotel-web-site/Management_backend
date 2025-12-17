import { Router } from 'express';
import * as userManageController from './controller.js';
import { authMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js';

const router = Router();

// 1. 전체 회원 조회
// GET /api/users/admin/all
router.get('/admin/all', 
    authMiddleware, 
    adminAuthMiddleware, 
    userManageController.getList
);

// 2. 회원 차단/해제
// PATCH /api/users/admin/:userId/status
router.patch('/admin/:userId/status', 
    authMiddleware, 
    adminAuthMiddleware, 
    userManageController.toggleStatus
);

export default router;