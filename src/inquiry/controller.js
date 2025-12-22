import * as inquiryService from './service.js';

// 등록
export const create = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const result = await inquiryService.createInquiry(userId, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// 목록 조회 (스마트함: 내꺼 or 전체)
export const getList = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await inquiryService.getInquiryList(userId, role, page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// 상세 조회
export const getOne = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const { inquiryId } = req.params;

        const result = await inquiryService.getInquiryById(inquiryId, userId, role);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('권한')) return res.status(403).json({ message: error.message });
        next(error);
    }
};

// 답변 등록 (관리자)
export const reply = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const { inquiryId } = req.params;

        // 🚨 [수정] 프론트에서 'reply'로 보내니까 여기서도 'reply'로 받아야 함!
        const { reply } = req.body;

        // 서비스로 넘길 때도 reply로 넘김
        const result = await inquiryService.replyInquiry(inquiryId, adminId, reply);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// 삭제
export const remove = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const { inquiryId } = req.params;

        await inquiryService.deleteInquiry(inquiryId, userId, role);
        res.status(200).json({ message: '문의가 삭제되었습니다.' });
    } catch (error) {
        if (error.message.includes('권한')) return res.status(403).json({ message: error.message });
        next(error);
    }
};