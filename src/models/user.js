// 임시 모델

import { Schema, model } from 'mongoose';

// 🚨 (임시) 🚨
// businessRouter.js에서 import 에러 안 나게 하려는 '가짜' 모델임.
// 
const fakeUserSchema = new Schema({
    name: {
        type: String,
        default: '임시유저',
    },
    email: {
        type: String,
        default: 'temp@temp.com',
    },
    role: {
        type: String,
        enum: ['user', 'business', 'admin'], // (이 ENUM은 user-backend랑 맞춰야 함)
        default: 'user',
    },
});

export const User = model('User', fakeUserSchema);
