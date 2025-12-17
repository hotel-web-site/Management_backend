import AuditLog from './model.js';

// 1. 로그 기록하기 (이걸 다른 컨트롤러에서 갖다 씀)
export const createLog = async ({ adminId, action, target, details, ip }) => {
    try {
        await AuditLog.create({
            admin: adminId,
            action,
            target,
            details,
            ip
        });
    } catch (err) {
        console.error("감사 로그 저장 실패 (기능엔 영향 없음):", err);
    }
};

// 2. 로그 조회하기 (프론트가 달라고 할 때 줌)
export const getLogs = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find()
        .populate('admin', 'name email') // 관리자 이름 가져오기
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await AuditLog.countDocuments();
    return { logs, total, totalPages: Math.ceil(total / limit) };
};