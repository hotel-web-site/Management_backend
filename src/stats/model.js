import { Schema, model } from 'mongoose';

// 1. 결제 모델 (매출 통계용) - User 백엔드에서 가져올 것
const paymentSchema = new Schema({
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel' }, // 어느 호텔 결제인지
    amount: { type: Number, required: true }, // 얼마인지
    status: { type: String }, // 'paid', 'cancelled' 등
    createdAt: { type: Date }, // 언제 결제했는지
});

// 2. 예약 모델 (예약 통계용) - User 백엔드에서 가져올 것
const reservationSchema = new Schema({
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel' },
    status: { type: String }, // 'booked', 'cancelled', 'completed'
    createdAt: { type: Date },
});

export const Payment = model('Payment', paymentSchema);
export const Reservation = model('Reservation', reservationSchema);