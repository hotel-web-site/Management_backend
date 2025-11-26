import Hotel from './model.js';
import { s3 } from '../common/s3Uploader.js'; // 경로 확인!
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';

// 호텔 생성
export const createHotel = async (businessId, data) => {
    const newHotel = await Hotel.create({
        business: businessId,
        ...data
    });
    return newHotel;
};

// 내 호텔 목록 조회
export const getMyHotels = async (businessId) => {
    return await Hotel.find({ business: businessId });
};

// 단일 호텔 조회
export const getHotelById = async (hotelId, businessId) => {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) throw new Error('호텔이 없습니다.');

    if (hotel.business.toString() !== businessId.toString()) {
        throw new Error('권한 없음'); // Controller에서 403 처리할 거임
    }
    return hotel;
};

// 호텔 수정
export const updateHotel = async (hotelId, businessId, data) => {
    // 소유권 확인 (getHotelById 재사용)
    const hotel = await getHotelById(hotelId, businessId);

    // 데이터 업데이트
    if (data.name) hotel.name = data.name;
    if (data.address) hotel.address = data.address;
    if (data.description) hotel.description = data.description;
    if (data.star_rating) hotel.star_rating = data.star_rating;
    if (data.amenities_list) hotel.amenities_list = data.amenities_list;

    await hotel.save();
    return hotel;
};

// 이미지 추가
export const addImages = async (hotelId, businessId, files) => {
    const hotel = await getHotelById(hotelId, businessId);

    const imageUrls = files.map((file) => file.location);
    hotel.images.push(...imageUrls);
    await hotel.save();

    return hotel;
};

// 호텔 삭제 (S3 포함)
export const deleteHotel = async (hotelId, businessId) => {
    const hotel = await getHotelById(hotelId, businessId);

    // S3 이미지 삭제
    if (hotel.images && hotel.images.length > 0) {
        try {
            const keys = hotel.images.map((imageUrl) => {
                const urlParts = new URL(imageUrl);
                const decodedKey = decodeURIComponent(urlParts.pathname.substring(1));
                return { Key: decodedKey };
            });

            const deleteCommand = new DeleteObjectsCommand({
                Bucket: process.env.S3_BUCKET,
                Delete: { Objects: keys },
            });

            await s3.send(deleteCommand);
            console.log('🗑️ Service: S3 이미지 삭제 성공');
        } catch (err) {
            console.error('⚠️ Service: S3 삭제 실패 (DB는 지움):', err);
        }
    }

    // DB 삭제
    await Hotel.findByIdAndDelete(hotelId);
    return true;
};