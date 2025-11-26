import * as businessService from './service.js';

export const register = async (req, res, next) => {
    try {
        const s3Url = req.file.location;
        const userId = req.user._id;
        
        // 서비스 호출
        const result = await businessService.createBusiness(userId, req.body, s3Url);
        
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// 대기 목록 조회 처리
export const getPending = async (req, res, next) => {
    try {
        const list = await businessService.getPendingList();
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

// 승인 처리
export const approve = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        
        // Service(요리사)한테 "야, 얘 승인 시켜"라고 명령
        const result = await businessService.approveBusiness(businessId);
        
        res.status(200).json({
            message: '승인 완료',
            business: result.business,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
};

// 거부 처리
export const reject = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        
        // Service(요리사)한테 "야, 얘 쳐내(거부)"라고 명령
        const result = await businessService.rejectBusiness(businessId);
        
        res.status(200).json({
            message: '거부 완료',
            business: result,
        });
    } catch (error) {
        next(error);
    }
};