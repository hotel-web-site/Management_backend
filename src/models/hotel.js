// 호텔 모델
import { Schema, model } from 'mongoose';

const hotelSchema = new Schema(
    {
        // 1. 'Business' 모델과 연결 (어떤 사업자 소유인지)
        business: {
            type: Schema.Types.ObjectId,
            ref: 'Business', // 
            required: true,
        },
        // 2. 호텔 기본 정보 (스샷 참고)
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        star_rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        // 3. 'S3 업로드' 핵심 (호텔 사진들)
        images: [
            {
                type: String, // S3에 올린 호텔 이미지 URL들
            },
        ],
        // 4. (참고) 편의시설 (Amenity)
        // 만약 나중에 편의시설 모델(Amenity) 만들면
        // amenities: [{ type: Schema.Types.ObjectId, ref: 'Amenity' }]

        // (편의시설 쨌으니까 걍 하드코딩 배열로 박아도 됨)
        amenities_list: [
            {
                type: String, // "수영장", "주차장" 등
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Hotel = model('Hotel', hotelSchema);