import { Router } from 'express';
import * as inquiryController from './controller.js';
import { authMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js';

const router = Router();

// 1. 문의 등록
router.post('/', authMiddleware, inquiryController.create);

// 2. 목록 조회
router.get('/', authMiddleware, inquiryController.getList);

// 3. 상세 조회
router.get('/:inquiryId', authMiddleware, inquiryController.getOne);

// 🚨 [수정] POST -> PATCH 로 변경!!! (프론트랑 맞춰야 함)
router.patch('/:inquiryId/reply',
    authMiddleware,
    adminAuthMiddleware,
    inquiryController.reply
);

// 5. 삭제
router.delete('/:inquiryId', authMiddleware, inquiryController.remove);

export default router;