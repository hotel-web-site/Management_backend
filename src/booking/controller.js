import * as bookingService from './service.js';

export const getList = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { status } = req.query;
        const list = await bookingService.getBusinessBookings(businessId, status);
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

export const updateStatus = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { bookingId } = req.params; // 여기 바뀜
        const { status } = req.body;

        if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
            // 유저 모델 enum에 rejected가 없어서 cancelled로 처리하거나 협의 필요.
            // 일단 있는 걸로 함.
            // return res.status(400).json({ message: '잘못된 상태 값' });
        }

        const result = await bookingService.updateBookingStatus(bookingId, businessId, status);
        res.status(200).json({ message: `예약이 ${status} 되었습니다.`, data: result });
    } catch (error) {
        if (error.message.includes('권한')) return res.status(403).json({ message: error.message });
        next(error);
    }
};

// [관리자] 전체 예약 조회
export const getAdminList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // 필터링 쿼리 받기
        const { startDate, endDate, status } = req.query;

        const result = await bookingService.getAdminAllBookings(page, limit, startDate, endDate, status);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// [관리자] 강제 취소
export const cancelByAdmin = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const result = await bookingService.cancelBookingByAdmin(bookingId);
        res.status(200).json({
            message: '관리자 권한으로 예약이 취소되었습니다.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};