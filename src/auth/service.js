import User from './model.js';
import jwt from 'jsonwebtoken';

// 토큰 생성 함수 (내부용)
const makeToken = (user) => {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// 회원가입 로직
export const registerUser = async (data) => {
    const { name, email, password, phoneNumber, address, dateOfBirth, role } = data;

    if (!email || !password || !name) {
        throw new Error("이름/이메일/비밀번호는 필수입니다.");
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
        throw new Error("이미 가입된 이메일입니다.");
    }

    const validRoles = ["user", "admin", "business"];
    const safeRole = validRoles.includes(role) ? role : "user";

    const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash: password, // 모델 pre-save에서 해싱됨
        phoneNumber,
        address,
        dateOfBirth,
        role: safeRole
    });

    return user;
};

// 로그인 로직
export const loginUser = async (email, password) => {
    const user = await User.findOne({
        email: email?.toLowerCase().trim(),
        isActive: true
    });

    if (!user) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");

    const ok = await user.comparePassword(password);
    if (!ok) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");

    // 로그인 상태 업데이트
    user.lastLogin = new Date();
    await user.save();

    // 토큰 생성
    const token = makeToken(user);

    return { user, token };
};