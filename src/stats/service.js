import Payment from '../payment/model.js';
import Reservation from '../booking/model.js';
import Hotel from '../hotel/model.js';
import User from '../auth/model.js'; // 👈 유저 통계 내려면 이거 필요함! import 추가!

// 📆 [Helper] 오늘 0시 구하기
const getStartOfToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
};

// 📆 [Helper] 어제 0시 구하기
const getStartOfYesterday = () => {
    const now = new Date();
    now.setDate(now.getDate() - 1); // 하루 뺌
    now.setHours(0, 0, 0, 0);
    return now;
};

// 🧮 [Helper] 증감률 계산기 (소수점 1자리 + %)
const calculateChange = (today, yesterday) => {
    if (yesterday === 0) {
        // 어제 0명이었는데 오늘 늘었으면? 
        return today > 0 ? "+100%" : "0%";
    }
    const change = ((today - yesterday) / yesterday) * 100;
    const sign = change > 0 ? "+" : ""; // 양수면 + 붙이기
    return `${sign}${change.toFixed(1)}%`;
};

// 1. [관리자용] 전체 통계 (증감률 포함!)
export const getAdminStats = async () => {
    const today = getStartOfToday();
    const yesterday = getStartOfYesterday();

    // --- 1. 💰 매출 ---
    // 오늘 매출
    const todayRevenueAgg = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    // 어제 매출 (오늘 0시 이전 && 어제 0시 이후)
    const yesterdayRevenueAgg = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: yesterday, $lt: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const yesterdayRevenue = yesterdayRevenueAgg[0]?.total || 0;

    // 전체 누적 매출
    const totalRevenueAgg = await Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;


    // --- 2. 📅 예약 ---
    const todayReservations = await Reservation.countDocuments({ createdAt: { $gte: today } });
    const yesterdayReservations = await Reservation.countDocuments({ createdAt: { $gte: yesterday, $lt: today } });
    const totalReservations = await Reservation.countDocuments();


    // --- 3. 🏨 호텔 (호텔은 보통 하루만에 급증하지 않아서 그냥 0으로 퉁쳐도 되지만, 굳이 하자면) ---
    const todayHotels = await Hotel.countDocuments({ createdAt: { $gte: today } });
    const yesterdayHotels = await Hotel.countDocuments({ createdAt: { $gte: yesterday, $lt: today } });
    const totalHotels = await Hotel.countDocuments();
    const totalHotelsYesterday = await Hotel.countDocuments({ createdAt: { $lt: today } });

    // --- 4. 👥 유저 ---
    const newUsersToday = await User.countDocuments({ role: 'user', createdAt: { $gte: today } });
    const newUsersYesterday = await User.countDocuments({ role: 'user', createdAt: { $gte: yesterday, $lt: today } });
    const totalUsers = await User.countDocuments({ role: 'user' });


    // --- 5. 결과 리턴 (계산기 돌려서 보냄) ---
    return {
        // 값
        revenue: totalRevenue,
        reservations: totalReservations,
        todayReservations, // 오늘 예약 수
        hotels: totalHotels,
        newUsers: newUsersToday,

        // 🔥 [핵심] 증감률 (프론트가 기다리는 그 이름!)
        revenueChange: calculateChange(todayRevenue, yesterdayRevenue),
        bookingChange: calculateChange(todayReservations, yesterdayReservations),
        hotelChange: calculateChange(totalHotels, totalHotelsYesterday),
        userChange: calculateChange(newUsersToday, newUsersYesterday),

        // 차트용 (빈 데이터)
        chartData: { labels: [], revenue: [], bookings: [] }
    };
};

// 1. [사업자용] 내 호텔 통계
export const getBusinessStats = async (businessId) => {
    const today = getStartOfToday();

    // 1. 내 호텔 ID들 찾기
    const myHotels = await Hotel.find({ business: businessId }).select('_id');
    const hotelIds = myHotels.map(h => h._id);

    // 2. [기존] 월별 매출 (차트용)
    const monthlySales = await Payment.aggregate([
        {
            $match: {
                hotel: { $in: hotelIds },
                status: 'paid', // 결제된 것만
            }
        },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                totalSales: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } } // 날짜 오름차순
    ]);

    // 3. [추가] 오늘 들어온 예약 수
    const todayReservations = await Reservation.countDocuments({
        hotel: { $in: hotelIds },
        createdAt: { $gte: today } // 오늘 0시 이후
    });

    // 4. [추가] 총 매출 (카드 표시용)
    const totalRevenueAgg = await Payment.aggregate([
        { $match: { hotel: { $in: hotelIds }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // 5. [추가] 내 호텔 개수
    const totalHotels = hotelIds.length;

    return {
        // 프론트랑 이름 맞춤 (adminStatsApi.js 매핑 참고)
        todayReservations,
        revenue: totalRevenue,
        hotels: totalHotels,
        // 차트용
        monthlySales,
        // 기타
        reservations: await Reservation.countDocuments({ hotel: { $in: hotelIds } })
    };
};