import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { Business } from "../models/business.js"

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
export const businessAuthMiddleware = async (req, res, next) => {
    try {
        const userId = req.user._id
        const business = await Business.findOne({ user: userId })
        if (!business) {
            return res.status(403).json({ message: '사업자 등록이 필요합니다.' })
        }
        if (business.status !== 'approved') {
            return res.status(403).json({ message: '승인된 사업자만 접근 가능합니다.' })
        }
        req.business = business
        next()
    } catch (error) {
        next(error)
    }
}