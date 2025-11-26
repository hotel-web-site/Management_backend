import { Router } from 'express';
import * as businessController from './controller.js';
import { s3Uploader } from '../common/s3Uploader.js'; // 경로 주의
import { authMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js'; // 경로 주의

const router = Router();

router.post('/register',
    authMiddleware,
    s3Uploader.single('license'),
    businessController.register // 컨트롤러 연결
);

router.get('/admin/pending',
    authMiddleware,
    adminAuthMiddleware,
    businessController.getPending // 컨트롤러 연결
);

// 관리자가 '승인' 처리
router.patch('/admin/approved/:businessId',
    authMiddleware,
    adminAuthMiddleware,
    businessController.approve // Controller의 approve 함수 실행
);

// 관리자가 '거부' 처리
router.patch('/admin/rejected/:businessId',
    authMiddleware,
    adminAuthMiddleware,
    businessController.reject // Controller의 reject 함수 실행
);

export default router;