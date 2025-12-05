import Review from './model.js';

// 1. [관리자] 전체 리뷰 목록 조회
export const getAdminReviews = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
        .populate('user', 'name email') // 작성자 정보
        .populate('hotel', 'name')      // 호텔 정보
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Review.countDocuments();

    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};

// 2. [관리자] 리뷰 상세 조회
export const getReviewById = async (reviewId) => {
    const review = await Review.findById(reviewId)
        .populate('user', 'name email')
        .populate('hotel', 'name');

    if (!review) throw new Error('리뷰를 찾을 수 없습니다.');
    return review;
};

// 3. [관리자] 리뷰 강제 삭제
export const deleteReview = async (reviewId) => {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) throw new Error('리뷰를 찾을 수 없습니다.');
    return true;
};

// 4. [관리자] 리뷰 상태 변경 (숨김 처리 등 - 일단 껍데기만)
export const updateReviewStatus = async (reviewId, status) => {
    // Review 모델에 status 필드가 없어서 일단 패스하거나, 나중에 추가
    // 지금은 그냥 성공 리턴
    return true;
};