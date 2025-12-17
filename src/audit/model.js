import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema({
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 실행한 관리자
    action: { type: String, required: true }, // 행동 (예: "호텔 삭제", "유저 차단")
    target: { type: String, required: true }, // 대상 (예: "롯데호텔", "user@test.com")
    details: { type: String }, // 추가 설명 (옵션)
    ip: { type: String } // 접속 IP
}, { timestamps: true }); // 언제 했는지 자동 기록

export default model('AuditLog', auditLogSchema);