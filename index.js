import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js'; // DB 연결 함수

// 라우터 Import (경로 바뀐 거 확인!)
import businessRouter from './src/business/route.js';
import hotelRouter from './src/hotel/route.js';
import authRouter from './src/auth/route.js';

const { PORT, FRONT_ORIGIN } = process.env;

// DB 연결 실행
connectDB();

const app = express();
app.use(morgan('dev'));
app.use(cors({ origin: FRONT_ORIGIN }));
app.use(express.json());

app.get('/api', (req, res) => { res.status(200).send('API Alive') });

// 라우터 연결
app.use('/api/business', businessRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/auth', authRouter);

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ message: err.message || 'Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});