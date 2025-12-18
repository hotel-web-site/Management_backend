import * as hotelService from './service.js';
import Hotel from './model.js'; // 👈 이거 꼭 있어야 함!

// 1. 호텔 생성
export const create = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const result = await hotelService.createHotel(businessId, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// 2. [핵심 수정] 호텔 목록 조회 (이름을 getHotels로 통일!)
// 관리자랑 사업자 둘 다 이거 씀
export const getHotels = async (req, res, next) => {
    try {
        // 안전장치: 로그인 정보 없으면 컷
        if (!req.user) {
            return res.status(401).json({ message: '로그인 정보가 없습니다.' });
        }

        const { role, _id } = req.user;
        let query = {};

        // 🚨 사업자(Business)라면? -> '내 호텔'만 검색
        if (role === 'business') {
            query = { business: _id };
        }

        // DB 조회 (페이지네이션 없이 일단 싹 다 줌 - 관리자 페이지용)
        const hotels = await Hotel.find(query)
            .populate('business', 'name email') // 사업자 정보 살짝 보여주기
            .sort({ createdAt: -1 }); // 최신순

        res.status(200).json(hotels);
    } catch (error) {
        console.error("호텔 조회 에러:", error);
        next(error);
    }
};

// 3. 호텔 상세 조회 (사업자용)
export const getOne = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        // 주의: 만약 관리자가 접속하면 req.business가 없을 수 있음.
        // 일단 사업자 로직 유지 (관리자 상세 조회는 별도로 필요할 수 있음)
        const businessId = req.business?._id || req.user?._id;

        const hotel = await hotelService.getHotelById(hotelId, businessId);
        res.status(200).json(hotel);
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

// 4. 업데이트
export const update = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;
        const updated = await hotelService.updateHotel(hotelId, businessId, req.body);
        res.status(200).json(updated);
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

// 5. 이미지 업로드
export const uploadImages = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '업로드할 이미지가 없습니다.' });
        }

        const result = await hotelService.addImages(hotelId, businessId, req.files);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

// 6. 삭제
export const remove = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;
        await hotelService.deleteHotel(hotelId, businessId);
        res.status(200).json({ message: '호텔과 이미지가 삭제되었습니다.' });
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

// [관리자] 강제 삭제
export const forceDelete = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        await hotelService.forceDeleteHotel(hotelId);
        res.status(200).json({ message: '관리자 권한으로 호텔이 삭제되었습니다.' });
    } catch (error) {
        next(error);
    }
};

// [관리자] 추천 토글
export const toggleRecommend = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const result = await hotelService.toggleRecommendation(hotelId);

        const msg = result.isRecommended ? '추천 호텔로 등록되었습니다.' : '추천이 해제되었습니다.';
        res.status(200).json({ message: msg, hotel: result });
    } catch (error) {
        next(error);
    }
};

// [관리자] 추천 토글
export const toggleRecommend = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const result = await hotelService.toggleRecommendation(hotelId);
        
        const msg = result.isRecommended ? '추천 호텔로 등록되었습니다.' : '추천이 해제되었습니다.';
        res.status(200).json({ message: msg, hotel: result });
    } catch (error) {
        next(error);
    }
};