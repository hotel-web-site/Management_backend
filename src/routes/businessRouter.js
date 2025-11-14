import { Router } from 'express';
import { s3Uploader } from '../utils/s3Uploader.js'; // S3 업로더
import { Business } from '../models/business.js'; // 사업자 모델
import { User } from '../models/user.js'; // user-backend가 만들 'User' (일단 임시)
// import { authMiddleware } from '../middlewares/auth.middleware.js'; // (나중에 만들 로그인 검증)

const router = Router();

// 가입
router.post(
    '/register',
    // authMiddleware, // (나중에 주석 해제)
    s3Uploader.single('license'),
    async (req, res, next) => {
        try {
            // 1. S3 업로드 성공 URL
            const s3Url = req.file.location;
            // 2. 신청한 유저 ID (로그인 미들웨어에서 받아옴)
            // const userId = req.user._id; // (임시)
            const userId = '60d5f1b2b3b3f1b3f1b3f1b3'; // (임시 하드코딩)
            // 3. 프론트에서 보낸 나머지 정보
            const { business_name, business_number } = req.body;
            // 4. DB에 '승인 대기' 문서 생성
            const newRegistration = await Business.create({
                user: userId,
                business_name,
                business_number,
                license_image_url: s3Url,
                status: 'pending', // (기본값이지만 명시)
            });
            console.log(newRegistration)
            res.status(201).json(newRegistration);
        } catch (error) {
            next(error); // 
        }
    }
);

// 관리자가 '승인 대기' 목록 조회 (From: 관리자 프론트)
router.get('/admin/pending', async (req, res, next) => {
    try {
        const pendingList = await Business.find({ status: 'pending' })
            .populate('user', 'name email'); // user 정보도 같이 가져오기 (이름, 이메일만)
            console.log(pendingList)
            res.status(200).json(pendingList);
    } catch (error) {
        next(error);
    }
});

// 관리자가 '승인' 처리 (From: 관리자 프론트)
// (관리자만 써야 함)
router.patch('/admin/approve/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        // 1. Business 문서 상태 'approved'로 변경
        const approvedBusiness = await Business.findByIdAndUpdate(
            businessId,
            { status: 'approved' },
            { new: true }
        );
        if (!approvedBusiness) {
            throw new Error('신청 내역이 없습니다.');
        }
        // 2. 'User' 모델의 role을 'business'로 변경
        // user-backend랑 엮이는 부분
        const updatedUser = await User.findByIdAndUpdate(
            approvedBusiness.user, // 
            { role: 'business' },
            { new: true }
        );
        res.status(200).json({
            message: '승인 완료',
            business: approvedBusiness,
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
});

export default router;