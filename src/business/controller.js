import * as businessService from './service.js';
import * as auditService from '../audit/service.js';

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

// 승인 처리 (로그 추가)
export const approve = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const result = await businessService.approveBusiness(businessId);

        // 🕵️‍♂️ [로그] 사업자 승인
        auditService.createLog({
            adminId: req.user._id,
            action: "사업자 승인",
            target: `Business: ${result.business.businessName} (${businessId})`,
            ip: req.ip,
            details: "일반 유저 -> 사업자 등급 변경 완료"
        });

        res.status(200).json({ message: '승인 완료', business: result.business, user: result.user });
    } catch (error) { next(error); }
};

// 거부 처리 (로그 추가)
export const reject = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const result = await businessService.rejectBusiness(businessId);

        // 🕵️‍♂️ [로그] 사업자 거부
        auditService.createLog({
            adminId: req.user._id,
            action: "사업자 신청 거부",
            target: `Business ID: ${businessId}`,
            ip: req.ip,
            details: "신청 반려 및 S3 라이센스 이미지 삭제 처리"
        });

        res.status(200).json({ message: '거부 완료', business: result });
    } catch (error) { next(error); }
};

// 관리자용 전체 목록 조회
export const getList = async (req, res, next) => {
    try {
        const { status } = req.query; // ?status=approved 처럼 받음
        const list = await businessService.getAllBusinesses(status);
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

// 상세 조회
export const getDetail = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const business = await businessService.getBusinessDetail(businessId);
        res.status(200).json(business);
    } catch (error) {
        next(error);
    }
};

// 강제 정지 (로그 추가)
export const suspend = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const result = await businessService.suspendBusiness(businessId);

        // 🕵️‍♂️ [로그] 강제 정지
        auditService.createLog({
            adminId: req.user._id,
            action: "사업자 강제 정지",
            target: `Business: ${result.businessName} (${businessId})`,
            ip: req.ip,
            details: "관리자 권한으로 영업 정지 처분"
        });

        res.status(200).json({ message: '사업자가 정지되었습니다.', business: result });
    } catch (error) { next(error); }
};