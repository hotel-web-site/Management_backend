import * as hotelService from './service.js';
import Hotel from './model.js'; // 👈 이거 꼭 있어야 함!
import * as auditService from '../audit/service.js';

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
        // 👇 [수정] req.user가 없을 경우를 대비해서 req.business도 확인!
        // (미들웨어 종류에 따라 어디에 담길지 모르니까 둘 다 체크하는 센스)
        const user = req.user || req.business;

        if (!user) {
            return res.status(401).json({ message: '로그인 정보가 없습니다.' });
        }

        const role = user.role; // role 꺼내기
        const userId = user._id; // id 꺼내기

        let query = {};

        // 🚨 사업자(Business)라면? -> '내 호텔'만 검색
        // (가끔 role이 없을 수도 있으니 안전하게 처리)
        if (role === 'business') {
            query = { business: userId };
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

// 3. 호텔 상세 조회
export const getOne = async (req, res, next) => {
    try {
        const { hotelId } = req.params;

        // 🕵️‍♂️ [수정] 관리자면 businessId를 null로 설정해서 감시 피하기
        // req.user(관리자) 또는 req.business(사장님) 확인
        const user = req.user || req.business;
        const businessId = user.role === 'admin' ? null : user._id;

        const hotel = await hotelService.getHotelById(hotelId, businessId);
        res.status(200).json(hotel);
    } catch (error) {
        // ... 에러 처리 그대로 ...
        next(error);
    }
};

// 4. 업데이트
export const update = async (req, res, next) => {
    try {
        const { hotelId } = req.params;

        // 🕵️‍♂️ [수정] 여기도 관리자면 businessId 없이 통과!
        const user = req.user || req.business;
        const businessId = user.role === 'admin' ? null : user._id;

        const updated = await hotelService.updateHotel(hotelId, businessId, req.body);
        res.status(200).json(updated);
    } catch (error) {
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

// 6. 삭제 (로그 추가 - 사장님이 지운 것도 남기면 좋음)
export const remove = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;

        // 삭제 전에 호텔 이름 잠깐 조회 (로그에 남기려고)
        const hotel = await Hotel.findById(hotelId);

        await hotelService.deleteHotel(hotelId, businessId);

        // 🕵️‍♂️ [로그] 사장님이 직접 삭제
        if (hotel) {
            auditService.createLog({
                adminId: businessId, // 수행자 (사장님)
                action: "호텔 삭제 (사업자)",
                target: `Hotel: ${hotel.name} (${hotelId})`,
                ip: req.ip,
                details: "사업자가 직접 호텔 삭제함"
            });
        }

        res.status(200).json({ message: '호텔과 이미지가 삭제되었습니다.' });
    } catch (error) {
        // ... 에러 처리 ...
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

// [관리자] 강제 삭제 (로그 추가)
export const forceDelete = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        // 삭제 전 조회
        const hotel = await Hotel.findById(hotelId);

        await hotelService.forceDeleteHotel(hotelId);

        // 🕵️‍♂️ [로그] 관리자 강제 삭제
        auditService.createLog({
            adminId: req.user._id,
            action: "호텔 강제 삭제 (관리자)",
            target: `Hotel: ${hotel ? hotel.name : 'Unknown'} (${hotelId})`,
            ip: req.ip,
            details: "관리자 권한으로 영구 삭제"
        });

        res.status(200).json({ message: '관리자 권한으로 호텔이 삭제되었습니다.' });
    } catch (error) { next(error); }
};

// [관리자] 추천 토글 (로그 추가)
export const toggleRecommend = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const result = await hotelService.toggleRecommendation(hotelId);

        const msg = result.isRecommended ? '추천 호텔로 등록되었습니다.' : '추천이 해제되었습니다.';

        // 🕵️‍♂️ [로그] 추천 변경
        auditService.createLog({
            adminId: req.user._id,
            action: "추천 호텔 변경",
            target: `Hotel: ${result.name} (${hotelId})`,
            ip: req.ip,
            details: `추천 상태: ${result.isRecommended}`
        });

        res.status(200).json({ message: msg, hotel: result });
    } catch (error) { next(error); }
};

// [관리자] 호텔 승인 상태 변경 (승인/거부)
export const updateStatus = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const { approvalStatus } = req.body;

        // 1. 기능 실행
        const hotel = await Hotel.findByIdAndUpdate(
            hotelId,
            { approvalStatus },
            { new: true }
        );

        if (!hotel) return res.status(404).json({ message: '호텔을 찾을 수 없습니다.' });

        // 2. 🕵️‍♂️ [로그] 안전하게 기록 (여기서 터져도 기능은 멈추지 않게!)
        try {
            if (req.user) { // 관리자 정보 있을 때만 기록
                await auditService.createLog({
                    adminId: req.user._id,
                    action: "호텔 승인 상태 변경",
                    target: `Hotel: ${hotel.name} (${hotelId})`,
                    ip: req.ip,
                    details: `상태 변경: ${approvalStatus}`
                });
            }
        } catch (logError) {
            console.error("감사 로그 기록 실패 (기능은 성공함):", logError);
        }

        // 3. 응답
        res.status(200).json({
            message: `호텔이 ${approvalStatus === 'approved' ? '승인' : '거부'} 되었습니다.`,
            hotel
        });
    } catch (error) {
        next(error);
    }
};