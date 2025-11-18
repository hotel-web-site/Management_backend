module.exports = function requireRole(roles = []) {
    if (!Array.isArray(roles)) roles = [roles]; // roles 배열로 변환

    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "로그인 필요" }); // 인증 확인

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "권한 없음" }); // 권한 체크
        }

        next(); // 권한 확인 완료
    };
};