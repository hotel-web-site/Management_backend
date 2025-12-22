import Room from './model.js';
import Hotel from '../hotel/model.js'; // 호텔 모델 필요함 (소유권 확인용)

// (내부용) 내 호텔 맞는지 확인하는 함수
const checkOwnership = async (hotelId, businessId) => {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) throw new Error('존재하지 않는 호텔입니다.');
    if (hotel.business.toString() !== businessId.toString()) {
        throw new Error('권한 없음: 당신의 호텔이 아닙니다.');
    }
    return hotel;
};

// 1. 객실 생성
export const createRoom = async (businessId, data) => {
    // 내 호텔 맞는지 확인
    await checkOwnership(data.hotelId, businessId);

    const newRoom = await Room.create({
        hotel: data.hotelId,
        name: data.name,
        price: data.price,
        capacity: data.capacity,
        stock: data.stock,
        description: data.description,
    });
    return newRoom;
};

// 2. 특정 호텔의 객실 목록 조회
export const getRoomsByHotel = async (hotelId) => {
    return await Room.find({ hotel: hotelId });
};

// 3. 객실 수정 (가격, 재고 등)
export const updateRoom = async (roomId, businessId, data) => {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('객실이 없습니다.');

    // 이 방이 소속된 호텔이 내 건지 확인
    await checkOwnership(room.hotel, businessId);

    if (data.name) room.name = data.name;
    if (data.price) room.price = data.price;
    if (data.capacity) room.capacity = data.capacity;
    if (data.stock) room.stock = data.stock;
    if (data.description) room.description = data.description;

    await room.save();
    return room;
};

// 4. 객실 삭제
export const deleteRoom = async (roomId, businessId) => {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('객실이 없습니다.');

    // 소유권 확인
    await checkOwnership(room.hotel, businessId);

    await Room.findByIdAndDelete(roomId);
    return true;
};

// 객실 이미지 추가
export const addRoomImages = async (roomId, businessId, files) => {
    const room = await Room.findById(roomId).populate('hotel'); // 호텔 정보 필요해서 populate
    if (!room) throw new Error('객실이 없습니다.');

    // 소유권 확인 (room.hotel은 이제 객체임)
    // populate 했으니까 room.hotel.business 로 접근 가능
    // 근데 모델에 따라 다를 수 있으니 안전하게 Hotel 모델 다시 조회 추천 (아까 만든 checkOwnership 쓰자)
    await checkOwnership(room.hotel._id || room.hotel, businessId);

    const imageUrls = files.map((file) => file.location);
    room.images.push(...imageUrls);
    await room.save();

    return room;
};

// 객실 상태만 변경
export const updateRoomStatus = async (roomId, businessId, status) => {
    // 1. 방 찾기
    const room = await Room.findById(roomId);
    if (!room) throw new Error('객실을 찾을 수 없습니다.');

    // 🔥 2. [추가] 내 호텔 맞는지 검증 (보안 강화!)
    // checkOwnership은 hotelId를 받으니까 room.hotel을 넘겨야 함
    await checkOwnership(room.hotel, businessId);

    // 3. 상태 변경
    room.status = status;
    await room.save();
    return room;
};