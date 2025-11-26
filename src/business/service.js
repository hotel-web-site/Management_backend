import Business from './model.js';
import User from '../auth/model.js';
import { s3 } from '../common/s3Uploader.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// 사업자 생성 로직
export const createBusiness = async (userId, data, s3Url) => {
    const newRegistration = await Business.create({
        user: userId,
        business_name: data.business_name,
        business_number: data.business_number,
        license_image_url: s3Url,
        status: 'pending',
    });
    return newRegistration;
};

// 대기 목록 조회 로직
export const getPendingList = async () => {
    return await Business.find({ status: 'pending' }).populate('user', 'name email');
};

// 사업자 승인 로직 (Status 변경 + User Role 변경)
export const approveBusiness = async (businessId) => {
    // 1. Business 승인 처리
    const approvedBusiness = await Business.findByIdAndUpdate(
        businessId,
        { status: 'approved' },
        { new: true }
    );

    if (!approvedBusiness) {
        throw new Error('신청 내역이 없습니다.');
    }

    // 2. User Role 변경 ('business'로 승급)
    const updatedUser = await User.findByIdAndUpdate(
        approvedBusiness.user,
        { role: 'business' },
        { new: true }
    );

    return { business: approvedBusiness, user: updatedUser };
};

// 사업자 거부 로직 (S3 삭제 + Status 변경)
export const rejectBusiness = async (businessId) => {
    // 1. 정보 조회 (이미지 URL 필요)
    const business = await Business.findById(businessId);
    if (!business) {
        throw new Error('신청 내역이 없습니다.');
    }

    // 2. S3 라이센스 이미지 삭제
    if (business.license_image_url) {
        try {
            const urlParts = new URL(business.license_image_url);
            // 한글 파일명 깨짐 방지
            const key = decodeURIComponent(urlParts.pathname.substring(1));

            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: key,
            });

            await s3.send(deleteCommand);
            console.log('🗑️ Service: S3 라이센스 이미지 삭제 성공:', key);
        } catch (error) {
            console.error('⚠️ Service: S3 삭제 실패 (DB는 진행):', error);
        }
    }

    // 3. Status 거부 처리
    const rejectedBusiness = await Business.findByIdAndUpdate(
        businessId,
        { status: 'rejected' },
        { new: true }
    );

    return rejectedBusiness;
};