import { Router } from 'express';
import * as bookingController from './controller.js';
import { authMiddleware, businessAuthMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js';

const router = Router();

// 1. 목록 조회
router.get('/business',
    authMiddleware,
    businessAuthMiddleware,
    bookingController.getList
);

// 2. 상태 변경
router.patch('/:bookingId/status',
    authMiddleware,
    businessAuthMiddleware,
    bookingController.updateStatus
);

// [관리자] 전체 예약 목록 조회 (/admin/all)
router.get('/admin/all',
    authMiddleware,
    adminAuthMiddleware,
    bookingController.getAdminList
);

// PATCH /api/bookings/admin/:bookingId/cancel
router.patch('/admin/:bookingId/cancel',
    authMiddleware,
    adminAuthMiddleware, // 관리자만!
    bookingController.cancelByAdmin
);

export default router;