import * as userManageService from './service.js';
import * as auditService from '../audit/service.js'; // 👈 이거 import 꼭 있어야 됨!

// 목록 조회
export const getList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await userManageService.getUserList(page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// 👇 [수정] 차단/해제 + 감사 로그 (이거 하나만 있으면 됨)
export const toggleStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // 1. 서비스 실행 (이름 주의: userManageService)
        const result = await userManageService.toggleUserStatus(userId);

        // 2. 감사 로그 기록 (성공했을 때만)
        const actionText = result.isActive ? "유저 차단 해제" : "유저 차단";

        // (비동기로 던져서 사용자 응답 속도 안 느리게 함)
        auditService.createLog({
            adminId: req.user._id,
            action: actionText,
            target: `User: ${result.email} (${userId})`,
            ip: req.ip,
            details: `활성 상태 변경: ${!result.isActive} -> ${result.isActive}`
        });

        // 3. 응답
        res.status(200).json({
            message: `회원이 ${result.isActive ? '활성화' : '차단'} 되었습니다.`,
            user: result
        });
    } catch (error) {
        next(error);
    }
};