import Payment from '../payment/model.js';
import Reservation from '../booking/model.js'
import Hotel from '../hotel/model.js';

// 1. [사업자용] 내 호텔 통계 (매출 + 예약 상태)
export const getBusinessStats = async (businessId) => {
    // 1. 내 호텔 ID들 찾기
    const myHotels = await Hotel.find({ business: businessId }).select('_id');
    const hotelIds = myHotels.map(h => h._id);

    // 2. 💰 [매출] 월별 매출 집계 (기존 코드)
    const monthlySales = await Payment.aggregate([
        {
            $match: {
                hotel: { $in: hotelIds },
                status: 'paid',
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                totalSales: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    // 3. 📅 [추가됨!] 예약 상태별 건수 (확정, 취소, 완료 등)
    // 이게 있어야 도넛 차트(PieChart) 그릴 수 있음!
    const bookingStats = await Reservation.aggregate([
        {
            $match: {
                hotel: { $in: hotelIds } // 내 호텔 예약만
            }
        },
        {
            $group: {
                _id: "$status", // 상태별로 묶어 (confirmed, cancelled...)
                count: { $sum: 1 } // 개수 세기
            }
        }
    ]);

    // 4. 프론트가 쓰기 편하게 포장해서 리턴
    return {
        totalHotels: hotelIds.length, // 내 호텔 개수
        monthlySales,  // 막대 그래프용 (매출)
        bookingStats   // 도넛 차트용 (예약 현황)
    };
};

// 2. [관리자용] 전체 통계
export const getAdminStats = async () => {
    // 총 매출
    const totalRevenue = await Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 총 예약 건수
    const totalReservations = await Reservation.countDocuments();

    // 총 호텔 수
    const totalHotels = await Hotel.countDocuments();

    // 총 회원 수 (이것도 있으면 좋음)
    // const totalUsers = await User.countDocuments({ role: 'user' }); 

    return {
        revenue: totalRevenue[0]?.total || 0,
        reservations: totalReservations,
        hotels: totalHotels
    };
};