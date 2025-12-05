import Booking from './model.js'; // Booking 모델 임포트
import Hotel from '../hotel/model.js';

// 1. [사업자] 내 예약 목록 조회
export const getBusinessBookings = async (businessId, status) => {
    const myHotels = await Hotel.find({ business: businessId }).select('_id');
    const hotelIds = myHotels.map(h => h._id);

    const query = { hotel: { $in: hotelIds } };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
        .populate('user', 'name email phoneNumber')
        .populate('hotel', 'name')
        .populate('room', 'name')
        .sort({ createdAt: -1 });

    return bookings;
};

// 2. [사업자] 예약 승인 / 거절
export const updateBookingStatus = async (bookingId, businessId, status) => {
    const booking = await Booking.findById(bookingId).populate('hotel');

    if (!booking) throw new Error('예약 정보를 찾을 수 없습니다.');

    if (booking.hotel.business.toString() !== businessId.toString()) {
        throw new Error('권한이 없습니다. (내 호텔의 예약이 아님)');
    }

    booking.status = status;
    await booking.save();

    return booking;
};

// [관리자] 전체 예약 목록 조회 (날짜/상태 필터링)
export const getAdminAllBookings = async (page, limit, startDate, endDate, status) => {
    const skip = (page - 1) * limit;
    const query = {};

    // 1. 상태 필터 (예: ?status=confirmed)
    if (status) query.status = status;

    // 2. 날짜 필터 (체크인 기준)
    if (startDate || endDate) {
        query.checkIn = {};
        if (startDate) query.checkIn.$gte = new Date(startDate); // ~부터
        if (endDate) query.checkIn.$lte = new Date(endDate);     // ~까지
    }

    const bookings = await Booking.find(query)
        .populate('user', 'name email')
        .populate('hotel', 'name')
        .populate('room', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Booking.countDocuments(query);

    return { bookings, total, page, totalPages: Math.ceil(total / limit) };
};

// [관리자] 예약 강제 취소
export const cancelBookingByAdmin = async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('예약 정보를 찾을 수 없습니다.');

    // 이미 취소된 거면 패스
    if (booking.status === 'cancelled') {
        throw new Error('이미 취소된 예약입니다.');
    }

    booking.status = 'cancelled';
    await booking.save();

    return booking;
};