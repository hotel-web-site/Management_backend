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

    // 👇 [핵심 수정] businessId가 있을 때만(사장님일 때만) 내 호텔인지 검사!
    // 관리자는 businessId가 null로 들어오니까 이 if문을 건너뜀 (프리패스)
    if (businessId && hotel.business.toString() !== businessId.toString()) {
        throw new Error('권한 없음');
    }
    return hotel;
};

// 호텔 수정
export const updateHotel = async (hotelId, businessId, data) => {
    // 소유권 확인 (관리자는 businessId가 null이라 통과)
    const hotel = await getHotelById(hotelId, businessId);

    // 기존 데이터 업데이트
    if (data.name) hotel.name = data.name;
    if (data.address) hotel.address = data.address;
    if (data.description) hotel.description = data.description;
    if (data.star_rating) hotel.star_rating = data.star_rating;
    if (data.amenities_list) hotel.amenities_list = data.amenities_list;
    if (data.images) hotel.images = data.images; // 이미지도 혹시 모르니

    // 👇 [핵심 추가] 이거 두 개가 없어서 저장이 안 된 거임!

    // 1. 운영 상태 (활성/비활성) - 이건 누구나 변경 가능
    if (data.status) hotel.status = data.status;

    // 2. 승인 상태 (대기/승인/거부) - 🚨 관리자만 변경 가능하게 보호!
    // businessId가 null이면 관리자라는 뜻 (컨트롤러 로직상)
    if (!businessId && data.approvalStatus) {
        hotel.approvalStatus = data.approvalStatus;
    }

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

// [관리자] 전체 호텔 목록 조회 (검색/필터 추가)
export const getAllHotels = async (page = 1, limit = 10, keyword = '') => {
    const skip = (page - 1) * limit;

    // 검색 조건 (이름 or 주소에 키워드가 포함되면 검색)
    const query = keyword
        ? {
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { address: { $regex: keyword, $options: 'i' } }
            ]
        }
        : {};

    const hotels = await Hotel.find(query)
        .populate('business', 'business_name business_number')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Hotel.countDocuments(query);

    return { hotels, total, page, totalPages: Math.ceil(total / limit) };
};

// 2. [관리자] 호텔 강제 삭제 (소유권 체크 X)
export const forceDeleteHotel = async (hotelId) => {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) throw new Error('호텔이 없습니다.');

    // S3 이미지 삭제 (기존 로직 재사용)
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
            console.log('🗑️ Admin: S3 호텔 이미지 강제 삭제 성공');
        } catch (err) {
            console.error('⚠️ Admin: S3 삭제 실패:', err);
        }
    }

    // DB 삭제
    await Hotel.findByIdAndDelete(hotelId);
    return true;
};

// [관리자] 추천 호텔 설정/해제 (Toggle)
export const toggleRecommendation = async (hotelId) => {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) throw new Error('호텔이 없습니다.');

    // true면 false로, false면 true로 뒤집기
    hotel.isRecommended = !hotel.isRecommended;
    await hotel.save();

    return hotel;
};