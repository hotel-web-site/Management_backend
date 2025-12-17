import * as auditService from '../audit/service.js'; // 👈 import 추가

// ... 호텔 삭제 함수 안에서 ...
await hotelService.deleteHotel(hotelId);

// 👇 [추가] 로그 남기기 (비동기라 await 안 기다려도 됨)
auditService.createLog({
    adminId: req.user._id,
    action: "호텔 강제 삭제",
    target: `Hotel ID: ${hotelId}`, // 혹은 호텔 이름 조회해서 넣든가
    ip: req.ip
});

res.status(200).json({ message: "삭제 완료" });