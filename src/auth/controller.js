import * as authService from './service.js';

export const register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ message: "회원가입 성공", user: user.toSafeJSON() });
    } catch (error) {
        // Service에서 던진 에러 메시지 그대로 사용
        res.status(400).json({ message: "회원가입 실패", error: error.message });
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser(email, password);

        // 쿠키 설정
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "로그인 성공", user: user.toSafeJSON(), token });
    } catch (error) {
        res.status(400).json({ message: "로그인 실패", error: error.message });
    }
};