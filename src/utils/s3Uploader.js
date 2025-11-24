import { S3Client } from '@aws-sdk/client-s3'
import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'

// 1. .env 파일에서 S3 정보 로드
const { AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, } = process.env

// 2. S3 클라이언트 설정 (AWS SDK v3)
export const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
})

// 3. Multer-S3 스토리지 엔진 설정
const storage = multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        // S3에 저장될 파일 이름 설정
        // 1. 프론트에서 쿼리 파라미터로 폴더명을 받음
        //    (예: POST /api/upload?folder=licenses)
        //    없으면 'etc' 폴더로 감
        const folder = req.query.folder || 'etc'
        // 2. 파일명 중복 방지를 위해 현재 시간을 앞에 붙임
        const fileName = `${Date.now()}_${path.basename(
            file.originalname
        )}`
        // 3. 최종 S3 키 (경로 + 파일명)
        const s3Key = `${folder}/${fileName}`
        cb(null, s3Key)
    },
})

// 4. Multer 업로더 export
export const s3Uploader = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 파일 사이즈 제한
})