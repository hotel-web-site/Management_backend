import User from '../auth/model.js';

// 1. 전체 회원 목록 조회 (관리자용)
export const getUserList = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // 일반 유저만 조회 (관리자는 제외)
    const query = { role: 'user' };

    const users = await User.find(query)
        .select('-passwordHash') // 🚨 비번은 절대 내보내면 안 됨
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(query);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
};

// 2. 회원 차단/해제 토글 (isActive: true <-> false)
export const toggleUserStatus = async (userId) => {
    // 1. 유저 찾기
    const user = await User.findById(userId);
    if (!user) throw new Error("사용자를 찾을 수 없습니다.");

    // 2. 상태 뒤집기 (true <-> false)
    const newStatus = !user.isActive;

    // 3. 🚨 save() 대신 updateOne() 사용 (이게 핵심!)
    // 비밀번호 필드가 없어도 강제로 상태만 업데이트함
    await User.updateOne({ _id: userId }, { isActive: newStatus });

    // 4. 결과 리턴 (프론트 반영용)
    return { ...user.toObject(), isActive: newStatus };
};