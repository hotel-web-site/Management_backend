import { Router } from 'express';
import * as hotelController from './controller.js';
import { s3Uploader } from '../common/s3Uploader.js';
import { authMiddleware, businessAuthMiddleware } from '../common/authMiddleware.js';

const router = Router();

// 1. 호텔 등록
router.post('/',
    authMiddleware,
    businessAuthMiddleware,
    hotelController.create
);

// 2. 내 호텔 목록
router.get('/my-hotels',
    authMiddleware,
    businessAuthMiddleware,
    hotelController.getList
);

// 3. 단일 호텔 조회
router.get('/:hotelId',
    authMiddleware,
    businessAuthMiddleware,
    hotelController.getOne
);

// 4. 호텔 수정
router.patch('/:hotelId',
    authMiddleware,
    businessAuthMiddleware,
    hotelController.update
);

// 5. 호텔 삭제
router.delete('/:hotelId',
    authMiddleware,
    businessAuthMiddleware,
    hotelController.remove
);

// 6. 이미지 업로드
router.post('/:hotelId/images',
    authMiddleware,
    businessAuthMiddleware,
    s3Uploader.array('hotelImages', 10),
    hotelController.uploadImages
);

export default router;