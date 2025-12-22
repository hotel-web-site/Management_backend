import jwt from 'jsonwebtoken'
import User from '../auth/model.js';
import Business from "../business/model.js"

export const authMiddleware = async (req, res, next) => {
    try {
        const h = req.headers.authorization || ''
        const token = h.startsWith('Bearer') ? h.slice(7) : null
        if (!token) return res.status(401).json({ message: "인증 필요" })
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if (!user) return res.status(401).json({ message: "유효하지 않은 사용자" })
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ message: "토큰 무효", error: error.message })
    }
}

// 2. 권한 검사 함수
const requireRole = (roles = []) => {
    if (!Array.isArray(roles)) roles = [roles]
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "로그인 필요" })
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "권한 없음" })
        }
        next()
    }
}

// 3. '관리자' 전용 문지기 
export const adminAuthMiddleware = requireRole('admin')

// 4. '승인된 사업자' 전용 문지기
export const businessAuthMiddleware = (req, res, next) => {
    try {
        // 1. 로그인한 유저가 있고, 역할이 'business'인지 확인
        if (req.user && req.user.role === 'business') {

            // ⭐ [핵심] 컨트롤러가 req.business를 찾을 때 에러 안 나게
            // 현재 유저 정보를 req.business에도 넣어줌 (일단 통과시켜!)
            req.business = req.user;

            next();
        } else {
            // 사업자가 아니면 컷
            return res.status(403).json({ message: '사업자 권한이 필요합니다.' });
        }
    } catch (error) {
        next(error);
    }
}; 