import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js'; // DB 연결 함수

// 라우터 Import
import businessRouter from './src/business/route.js';
import hotelRouter from './src/hotel/route.js';
import authRouter from './src/auth/route.js';
import roomRouter from './src/room/route.js';
import noticeRouter from './src/notice/route.js';
import inquiryRouter from './src/inquiry/route.js';
import couponRouter from './src/coupon/route.js';
import reportRouter from './src/report/route.js';
import statsRouter from './src/stats/route.js';
import bookingRouter from './src/booking/route.js';
import paymentRouter from './src/payment/route.js';
import userManageRouter from './src/user-manage/route.js';
import reviewRouter from './src/review/route.js';

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
app.use('/api/rooms', roomRouter);
app.use('/api/notices', noticeRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/reports', reportRouter);
app.use('/api/stats', statsRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/users', userManageRouter);
app.use('/api/reviews', reviewRouter);

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ message: err.message || 'Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});