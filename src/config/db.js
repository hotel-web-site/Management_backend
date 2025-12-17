import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        console.log("🔥 현재 연결 시도 중인 DB 주소:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB 연결 성공');
    } catch (err) {
        console.error('❌ MongoDB 연결 실패:', err);
        process.exit(1);
    }
};