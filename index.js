import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// 라우터 (안내데스크) Import
import businessRouter from './src/routes/businessRouter.js';
import hotelRouter from './src/routes/hotelRouter.js';

// 👇 1. (추가) '가라' 로그인에 필요한 놈들
import jwt from 'jsonwebtoken';
import User from './src/models/user.js';
=======
// import userRouter from './routes/user.router.js'; // (user-backend용 만들 거)

// .env 변수 로드
const { PORT, MONGO_URI, FRONT_ORIGIN } = process.env;

if (!MONGO_URI) {
    throw new Error('MONGO_URI가 .env에 없습니다.');
}

// MongoDB 연결
mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB 연결 성공'))
    .catch((err) =>
        console.error('❌ MongoDB 연결 실패:', err)
    );

// Express 앱 생성 및 미들웨어
const app = express();

// 1. CORS 설정 (프론트 서버 주소 허용)
app.use(cors({ origin: FRONT_ORIGIN }));

// 2. Body Parser (JSON 파싱)
app.use(express.json());
// (참고: form 데이터용)
// app.use(express.urlencoded({ extended: false }));

// API 라우터 연결 (안내데스크)
// 헬스 체크용
app.get('/api', (req, res) => {
    res.status(200).send('API 서버 살아있음 (Management)');
});

// 👇 2. (추가) '가라' 로그인 API
app.post('/api/test/login', async (req, res) => {
    try {
        // 1. 니 '가짜' 유저를 찾음 (하드코딩 ID)
        const userId = '691b0c1639f9667d48386d87'; // 
        const user = await User.findById(userId);

        if (!user) throw new Error('테스트 유저가 DB에 없음');

        // 2. 토큰 발급
        const token = jwt.sign(
            { id: user._id, role: user.role }, // 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: '가라 로그인 성공 (토큰 1시간짜리)',
            token: token,
            user: user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// "사업자" 관련 API는 이쪽으로
app.use('/api/business', businessRouter);

// "호텔" 관련 API는 이쪽으로
app.use('/api/hotels', hotelRouter);

// "유저" 관련 API (user-backend꺼. 그 서버가 따로 돌면 이건 필요 없음)
// app.use('/api/users', userRouter);

// ---------------------------------
// (필수) 에러 핸들링 미들웨어
// ---------------------------------
app.use((err, req, res, next) => {
    console.error('❌ 전체 에러 발생:', err.stack);
    res.status(500).json({
        message: err.message || '서버에서 에러가 발생했습니다.',
    });
});

// ---------------------------------
// 서버 실행
// ---------------------------------
app.listen(PORT, () => {
    console.log(`🚀 관리 백엔드 서버가 ${PORT}번 포트에서 달리는 중...`);
});