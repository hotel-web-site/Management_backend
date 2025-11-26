import * as hotelService from './service.js';

export const create = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const result = await hotelService.createHotel(businessId, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const getList = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const list = await hotelService.getMyHotels(businessId);
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;
        const hotel = await hotelService.getHotelById(hotelId, businessId);
        res.status(200).json(hotel);
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;
        const updated = await hotelService.updateHotel(hotelId, businessId, req.body);
        res.status(200).json(updated);
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

export const uploadImages = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '업로드할 이미지가 없습니다.' });
        }

        const result = await hotelService.addImages(hotelId, businessId, req.files);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const businessId = req.business._id;
        await hotelService.deleteHotel(hotelId, businessId);
        res.status(200).json({ message: '호텔과 이미지가 삭제되었습니다.' });
    } catch (error) {
        if (error.message === '권한 없음') return res.status(403).json({ message: '내 호텔이 아닙니다.' });
        if (error.message === '호텔이 없습니다.') return res.status(404).json({ message: error.message });
        next(error);
    }
};