// 사업자 모델
import { Schema, model } from 'mongoose';

const businessSchema = new Schema(
    {
        // 1. 'User' 모델과 연결 (누가 신청했는지)
        // (user-backend와 'User' 모델 이름 'ref' 맞추기)
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User', // 
            required: true,
            unique: true, // 한 명의 유저는 하나의 사업자만 가짐
        },
        // 2. 사업자 정보
        business_name: {
            type: String,
            required: true,
            trim: true,
        },
        business_number: {
            type: String, // 사업자등록번호 (숫자지만 String이 편함)
            required: true,
            unique: true,
        },
        // 3. '승인 시스템' 핵심
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'rejected', 'suspended'],
            default: 'pending',
        },
        // 4. 'S3 업로드' 핵심
        license_image_url: {
            type: String, // S3에 올린 사업자등록증 URL
            required: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt 자동 생성
    }
);

export const Business = model('Business', businessSchema);