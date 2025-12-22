import { Schema, model } from 'mongoose';

const inquirySchema = new Schema(
    {
        // 질문자 (유저)
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        // 관리자 답변 (초기엔 null)
        reply: {
            type: String,
            default: null,
        },
        // 답변 달렸는지 여부
        isAnswered: {
            type: Boolean,
            default: false,
        },
        // 답변한 관리자 (선택)
        answeredBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        answeredAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

export default model('Inquiry', inquirySchema);