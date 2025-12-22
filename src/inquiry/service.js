import Inquiry from './model.js';

// 1. 문의 등록 (유저용)
export const createInquiry = async (userId, data) => {
    const inquiry = await Inquiry.create({
        author: userId,
        title: data.title,
        content: data.content,
    });
    return inquiry;
};

// 2. 문의 목록 조회 (핵심 로직)
export const getInquiryList = async (userId, role, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // 관리자면 전체 조회 ({}), 아니면 내꺼만 조회 ({ author: userId })
    const query = role === 'admin' ? {} : { author: userId };

    const inquiries = await Inquiry.find(query)
        .sort({ createdAt: -1 }) // 최신순
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email'); // 작성자 정보

    const total = await Inquiry.countDocuments(query);

    return { inquiries, total, page, totalPages: Math.ceil(total / limit) };
};

// 3. 문의 상세 조회 (권한 체크 포함)
export const getInquiryById = async (inquiryId, userId, role) => {
    const inquiry = await Inquiry.findById(inquiryId).populate('author', 'name email');
    if (!inquiry) throw new Error('문의 내역이 없습니다.');

    // 관리자가 아니고, 내 글도 아니면 -> 컷
    if (role !== 'admin' && inquiry.author._id.toString() !== userId.toString()) {
        throw new Error('권한이 없습니다. (본인 글만 조회 가능)');
    }

    return inquiry;
};

// 4. 답변 등록 (관리자용)
export const replyInquiry = async (inquiryId, adminId, replyText) => {
    const inquiry = await Inquiry.findByIdAndUpdate(
        inquiryId,
        {
            // 🚨 [수정] DB 필드명도 'reply'로 통일 (프론트에서 inquiry.reply로 보여주니까)
            reply: replyText,
            isAnswered: true,
            answeredBy: adminId,
            answeredAt: new Date()
        },
        { new: true }
    );
    if (!inquiry) throw new Error('문의 내역이 없습니다.');
    return inquiry;
};

// 5. 문의 삭제 (본인 or 관리자)
export const deleteInquiry = async (inquiryId, userId, role) => {
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) throw new Error('문의 내역이 없습니다.');

    // 관리자가 아니고, 내 글도 아니면 -> 컷
    if (role !== 'admin' && inquiry.author.toString() !== userId.toString()) {
        throw new Error('권한이 없습니다.');
    }

    await Inquiry.findByIdAndDelete(inquiryId);
    return true;
};