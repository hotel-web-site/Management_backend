
import * as roomService from './service.js';

// 객실 등록
export const create = async (req, res, next) => {
    try {
        const businessId = req.business._id; // 미들웨어에서 줌
        const result = await roomService.createRoom(businessId, req.body);
        res.status(201).json(result);
    } catch (error) {
        if (error.message.includes('권한 없음')) return res.status(403).json({ message: error.message });
        next(error);
    }
};

// 호텔별 객실 목록 조회 (누구나 볼 수 있음 -> 로그인 안 해도 됨)
export const getList = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const list = await roomService.getRoomsByHotel(hotelId);
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

// 객실 수정
export const update = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const businessId = req.business._id;
        const result = await roomService.updateRoom(roomId, businessId, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// 객실 삭제
export const remove = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const businessId = req.business._id;
        await roomService.deleteRoom(roomId, businessId);
        res.status(200).json({ message: '객실 삭제 완료' });
    } catch (error) {
        next(error);
    }
};

// 이미지 업로드
export const uploadImages = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const businessId = req.business._id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '업로드할 이미지가 없습니다.' });
        }

        const result = await roomService.addRoomImages(roomId, businessId, req.files);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('권한 없음')) return res.status(403).json({ message: error.message });
        next(error);
    }
};

// 👇 [추가] 객실 상태 변경 (청소중, 공실, 투숙중 등)
export const updateStatus = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const businessId = req.business._id; // 내 호텔 객실인지 확인용
        const { status } = req.body; // 프론트에서 { status: 'cleaning' } 이렇게 보낼 거임

        // 서비스한테 "야, 이 방 상태만 바꿔" 라고 시킴
        const result = await roomService.updateRoomStatus(roomId, businessId, status);
        
        res.status(200).json({ message: '객실 상태 변경 완료', data: result });
    } catch (error) {
        next(error);
    }
};