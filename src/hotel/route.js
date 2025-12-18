import { Router } from 'express';
import * as hotelController from './controller.js';
import { s3Uploader } from '../common/s3Uploader.js';
import { authMiddleware, businessAuthMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js';

const router = Router();

// 👇 프리패스 문지기
const allowAdminOrBusiness = (req, res, next) => {
    const role = req.user.role;
    if (role === 'admin' || role === 'business') {
        next();
    } else {
        res.status(403).json({ message: '권한이 없습니다.' });
    }
};

// 1. 호텔 등록
router.post('/', authMiddleware, businessAuthMiddleware, hotelController.create);

// 🚨 2. [수정] 여기가 범인! getList -> getHotels 로 변경!
router.get('/my-hotels', authMiddleware, businessAuthMiddleware, hotelController.getHotels);

// 3. 단일 호텔 조회
router.get('/:hotelId', authMiddleware, businessAuthMiddleware, hotelController.getOne);

// 4. 호텔 수정
router.patch('/:hotelId', authMiddleware, businessAuthMiddleware, hotelController.update);

// 5. 호텔 삭제
router.delete('/:hotelId', authMiddleware, businessAuthMiddleware, hotelController.remove);

// 6. 이미지 업로드
router.post('/:hotelId/images', authMiddleware, businessAuthMiddleware, s3Uploader.array('hotelImages', 10), hotelController.uploadImages);

// 7. 관리자/사업자 전체 조회
router.get('/admin/all',
    authMiddleware,
    allowAdminOrBusiness,
    hotelController.getHotels // 여기는 잘 썼네!
);

// 관리자 전용 기능들
router.delete('/admin/:hotelId', authMiddleware, adminAuthMiddleware, hotelController.forceDelete);
router.patch('/admin/:hotelId/recommend', authMiddleware, adminAuthMiddleware, hotelController.toggleRecommend);

// 👇 [추가] 관리자가 "이거 메인에 띄워!" 하고 명령하는 버튼
// PATCH /api/hotels/admin/:hotelId/recommend
router.patch('/admin/:hotelId/recommend',
    authMiddleware,
    adminAuthMiddleware, // 관리자만 가능
    hotelController.toggleRecommend
);

export default router;