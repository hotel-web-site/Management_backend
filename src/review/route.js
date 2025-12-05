import { Router } from 'express';
import * as reviewController from './controller.js';
import { authMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js';

const router = Router();

// 1. 전체 목록 조회
router.get('/admin/list', 
    authMiddleware, 
    adminAuthMiddleware, 
    reviewController.getList
);

// 2. 상세 조회
router.get('/admin/:reviewId', 
    authMiddleware, 
    adminAuthMiddleware, 
    reviewController.getOne
);

// 3. 강제 삭제
router.delete('/admin/:reviewId', 
    authMiddleware, 
    adminAuthMiddleware, 
    reviewController.remove
);

// 4. 상태 변경
router.put('/admin/:reviewId/status', 
    authMiddleware, 
    adminAuthMiddleware, 
    reviewController.updateStatus
);

export default router;