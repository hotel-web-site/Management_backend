# 🏨 HotelHub - Management Backend

![Node.js](https://img.shields.io/badge/Node.js-v18-green?style=flat&logo=node.js)
![Express](https://img.shields.io/badge/Express-v4-blue?style=flat&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=flat&logo=mongodb)
![AWS S3](https://img.shields.io/badge/AWS-S3-orange?style=flat&logo=amazon-aws)
![JWT](https://img.shields.io/badge/Auth-JWT-red?style=flat&logo=json-web-tokens)

**HotelHub**의 관리자(Admin) 및 사업자(Business)를 위한 통합 관리 백엔드 서버입니다.
호텔/객실 등록, 승인 시스템, 매출 통계, 고객 지원 등 운영 전반의 API를 제공합니다.

---

## 🛠️ Architecture & Features

본 프로젝트는 유지보수성과 확장성을 고려하여 **Layered Architecture (MVC Pattern)**를 채택했습니다.

### 🏗️ Software Architecture
- **Route:** API 엔드포인트 정의 및 Controller 연결
- **Controller:** 요청/응답 처리 및 유효성 검증
- **Service:** 비즈니스 로직 수행, DB 트랜잭션 관리
- **Model:** Mongoose Schema 정의 및 데이터 접근

### ✨ Key Features

#### 1. 🏢 사업자 (Business)
- **승인 시스템:** 사업자 신청 → 관리자 승인/거부 프로세스 구현
- **이미지 관리:** 사업자 등록증 및 호텔 이미지 **AWS S3** 업로드
- **S3 최적화:** 사업자 거부/삭제 시 연동된 S3 이미지 **자동 삭제(Garbage Collection)** 로직 구현

#### 2. 🏨 호텔 및 객실 (Hotel & Room)
- **CMS:** 승인된 사업자만 자신의 호텔/객실 생성, 수정, 삭제 가능
- **검증 로직:** 미들웨어를 통한 철저한 **권한(Role)** 및 **소유권(Ownership)** 검증

#### 3. 📊 통계 및 대시보드 (Stats)
- **Aggregation:** MongoDB Aggregation Pipeline(`$match`, `$group`)을 활용한 고성능 집계
- **Data:** 월별 매출 현황, 전체 예약 건수, 서비스 현황 실시간 제공

#### 4. 🛡️ 운영 관리 (Admin Ops)
- **게시판:** 공지사항(Notice) 및 1:1 문의(Inquiry) 관리
- **마케팅:** 쿠폰(Coupon) 생성 및 배포 관리
- **모니터링:** 악성 리뷰 신고(Report) 접수 및 처리, 사업자/호텔 강제 제재 기능

---

## 📂 Project Structure

```bash
src/
├── auth/           # 유저 인증 및 계정 관리 (JWT)
├── business/       # 사업자 신청 및 승인 로직
├── hotel/          # 호텔 CRUD 및 관리
├── room/           # 객실 관리 및 재고 설정
├── coupon/         # 쿠폰 발급 및 관리
├── notice/         # 공지사항 게시판
├── inquiry/        # 1:1 문의 및 답변
├── report/         # 리뷰 신고 처리
├── stats/          # 매출 및 현황 통계 (Aggregation)
├── common/         # 공용 미들웨어(Auth, S3) 및 유틸
└── config/         # DB 연결 등 환경 설정