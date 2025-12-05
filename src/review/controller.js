import * as reviewService from './service.js';

// 목록 조회
export const getList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await reviewService.getAdminReviews(page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// 상세 조회
export const getOne = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const result = await reviewService.getReviewById(reviewId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// 삭제
export const remove = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        await reviewService.deleteReview(reviewId);
        res.status(200).json({ message: '리뷰가 삭제되었습니다.' });
    } catch (error) {
        next(error);
    }
};

// 상태 변경
export const updateStatus = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { status } = req.body;
        await reviewService.updateReviewStatus(reviewId, status);
        res.status(200).json({ message: '리뷰 상태가 변경되었습니다.' });
    } catch (error) {
        next(error);
    }
};