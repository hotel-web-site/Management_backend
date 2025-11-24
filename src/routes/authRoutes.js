const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/user.js")

// 🔐 JWT 토큰 생성 함수
function makeToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )
}

// 🟦 회원가입 (Register)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phoneNumber, address, dateOfBirth, role } = req.body
        if (!email || !password || !name) {
            return res.status(400).json({ message: "이름/이메일/비밀번호는 필수입니다." })
        }
        const exists = await User.findOne({ email: email.toLowerCase().trim() })
        if (exists) return res.status(400).json({ message: "이미 가입된 이메일입니다." })
        // role 검증
        const validRoles = ["user", "admin", "business"]
        const safeRole = validRoles.includes(role) ? role : "user"
        // 유저 생성 (pre-save 훅에서 password 해싱)
        const user = await User.create({
            name,
            email: email.toLowerCase().trim(),
            passwordHash: password, // ⚡ pre-save 훅에서 자동 해싱
            phoneNumber,
            address,
            dateOfBirth,
            role: safeRole
        })
        res.status(201).json({ message: "회원가입 성공", user: user.toSafeJSON() })
    } catch (error) {
        res.status(500).json({ message: "회원가입 실패", error: error.message })
    }
})

// 🟦 로그인 (Login)
router.post("/login", async (req, res) => {
    try {
        const { email = "", password = "" } = req.body
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            isActive: true
        })
        if (!user) return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." })
        const ok = await user.comparePassword(password)
        if (!ok) return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." })
        // 로그인 상태 업데이트
        user.isLoggined = true
        user.lastLogin = new Date()
        await user.save()
        // JWT 생성
        const token = makeToken(user)
        // 쿠키 설정
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ message: "로그인 성공", user: user.toSafeJSON(), token })
    } catch (error) {
        res.status(500).json({ message: "로그인 실패", error: error.message })
    }
})

module.exports = router