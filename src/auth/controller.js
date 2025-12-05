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

// 👇 [추가] 내 정보 조회
export const getMe = async (req, res, next) => {
    try {
        // authMiddleware가 토큰 까서 찾아낸 유저 정보가 이미 req.user에 있음
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: '유저 정보를 찾을 수 없습니다.' });
        }
        // 비밀번호 빼고 안전하게 응답 (toSafeJSON()은 유저 모델에 있는 거)
        res.status(200).json({
            message: '내 정보 조회 성공',
            user: user.toSafeJSON ? user.toSafeJSON() : user
        });
    } catch (error) {
        next(error);
    }
};