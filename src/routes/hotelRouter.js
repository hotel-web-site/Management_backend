import { Router } from 'express';
import { Hotel } from '../models/hotel.js'; // 호텔 모델
import { Business } from '../models/business.js'; // 사업자 모델
import { s3Uploader } from '../utils/s3Uploader.js'; // S3 업로더
// import { authMiddleware } from '../middlewares/auth.middleware.js'; // (user-backend에서 만들 로그인 미들웨어)

const router = Router();

// ------------------------------------
// 🚨 (핵심) '승인된 사업자'인지 검증하는 미들웨어
// ------------------------------------
// (원래 authMiddleware 뒤에 붙어야 함)
const businessAuthMiddleware = async (req, res, next) => {
    try {
        // 1. (임시) 로그인 유저 ID (원래 authMiddleware가 req.user에 넣어줌)
        // const userId = req.user._id;
        const userId = '60d5f1b2b3b3f1b3f1b3f1b3'; // (임시 하드코딩)

        // 2. 'User' ID로 'Business' 문서를 찾음
        const business = await Business.findOne({ user: userId });

        // 3. 사업자 신청 내역이 없거나, 'approved' 상태가 아니면 컷
        if (!business) {
            return res.status(403).json({ message: '사업자 등록이 필요합니다.' });
        }
        if (business.status !== 'approved') {
            return res.status(403).json({ message: '승인된 사업자만 접근 가능합니다.' });
        }

        // 4. (성공) req 객체에 'business' 정보(ID 등)를 실어서 다음 라우터로 보냄
        req.business = business; // (이게 중요)
        next();
    } catch (error) {
        next(error);
    }
};

// ------------------------------------
// 1. 호텔 등록하기 (From: 사업자 프론트)
// ------------------------------------
router.post(
    '/',
    // authMiddleware, // (나중에 주석 해제)
    businessAuthMiddleware, // '승인된 사업자'인지 여기서 검증
    async (req, res, next) => {
        try {
            const { name, address, description, star_rating, amenities_list } =
                req.body;
            
            // 2. businessAuthMiddleware가 넣어준 req.business._id를 사용
            const businessId = req.business._id; 

            const newHotel = await Hotel.create({
                business: businessId, // '어떤 사업자'의 호텔인지 명시
                name,
                address,
                description,
                star_rating,
                amenities_list,
            });

            res.status(201).json(newHotel);
        } catch (error) {
            next(error);
        }
    }
);

// ------------------------------------
// 2. 내 호텔 목록 조회 (From: 사업자 프론트)
// ------------------------------------
router.get(
    '/my-hotels',
    // authMiddleware,
    businessAuthMiddleware, // '승인된 사업자'인지 검증
    async (req, res, next) => {
        try {
            const businessId = req.business._id;
            const myHotels = await Hotel.find({ business: businessId });
            res.status(200).json(myHotels);
        } catch (error) {
            next(error);
        }
    }
);


// ------------------------------------
// 3. 호텔 이미지 업로드 (From: 사업자 프론트)
// (S3 업로더 사용)
// ------------------------------------
router.post(
    '/:hotelId/images',
    // authMiddleware,
    businessAuthMiddleware, // 1. 사업자 검증
    s3Uploader.array('hotelImages', 10), // 2. S3 업로드 (최대 10개, <input name="hotelImages">)
    async (req, res, next) => {
        try {
            const { hotelId } = req.params;
            const businessId = req.business._id;

            // 3. S3에서 URL 목록 가져오기
            const imageUrls = req.files.map((file) => file.location);
            if (imageUrls.length === 0) {
                throw new Error('업로드할 이미지가 없습니다.');
            }

            // 4. 호텔 찾기
            const hotel = await Hotel.findById(hotelId);
            if (!hotel) {
                throw new Error('호텔 정보가 없습니다.');
            }

            // 5. (좆나 중요) 이 호텔이 '내' 소유(Business)가 맞는지 검증
            if (hotel.business.toString() !== businessId.toString()) {
                return res.status(403).json({ message: '내 호텔이 아닙니다. (권한 없음)' });
            }

            // 6. 검증 통과 -> 이미지 URL 배열에 추가
            hotel.images.push(...imageUrls);
            await hotel.save();

            res.status(200).json(hotel);
        } catch (error) {
            next(error);
        }
    }
);

export default router;