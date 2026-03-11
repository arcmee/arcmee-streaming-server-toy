# 스트리밍 서버

Express, Prisma, Redis, BullMQ, Socket.IO 기반의 스트리밍 백엔드입니다. 사용자/채널 관리, 라이브 상태 반영, 채팅, VOD 업로드 및 후처리, 라이브 썸네일 캡처 기능을 제공합니다.

## 주요 기능

- 회원가입, 로그인, JWT 액세스 토큰 및 리프레시 토큰 발급/회전
- 사용자별 채널 생성 및 채널 정보 조회
- 라이브 방송 상태 업데이트 및 현재 라이브 목록 조회
- Socket.IO 기반 실시간 채팅
- VOD 업로드, BullMQ 워커 기반 비디오 후처리
- FFmpeg 기반 라이브 썸네일 캡처
- Postgres 영속화, Redis 큐 처리

## 기술 스택

- Node.js + TypeScript
- Express
- Prisma + PostgreSQL
- Redis + BullMQ
- Socket.IO
- FFmpeg
- Jest

## 프로젝트 구조

```text
src/
  app.ts                    애플리케이션 조립
  main.ts                   HTTP API + Socket.IO 서버 실행
  worker.ts                 BullMQ 워커 실행
  domain/                   엔티티, 에러, 저장소 인터페이스
  application/              유스케이스, 서비스, DTO
  infrastructure/           DB/Redis/스토리지/웹 어댑터
  e2e/                      통합 테스트
prisma/                     Prisma 스키마 및 마이그레이션
media-live/                 HLS/라이브 미디어 파일 경로
public/                     정적 파일 저장 경로
tracker/                    별도 추적 서버
```

## 실행 전 준비

### 필수 요구사항

- Node.js 20 이상 권장
- npm
- PostgreSQL
- Redis
- FFmpeg

### 환경 변수

`.env` 파일을 만들고 아래 값을 설정합니다.

```env
DATABASE_URL=postgres://user:password@localhost:5432/mydatabase
REDIS_URL=redis://localhost:6379

PORT=3000
BASE_URL=http://localhost:3000
CLIENT_ORIGIN=http://localhost:4000
LIVE_HLS_ROOT=./media-live/live

JWT_SECRET=change-me
JWT_EXPIRES_IN=1h
JWT_ISSUER=streaming-server
JWT_ALG=HS256

REFRESH_TOKEN_EXPIRES_IN=30d
REFRESH_TOKEN_LENGTH=64
REFRESH_TOKEN_BCRYPT_ROUNDS=10
```

설명:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `REDIS_URL`: Redis 연결 문자열
- `BASE_URL`: 정적 파일 URL 생성에 사용되는 서버 공개 주소
- `CLIENT_ORIGIN`: Socket.IO CORS 허용 origin
- `LIVE_HLS_ROOT`: 라이브 HLS 파일을 읽는 루트 경로
- `JWT_SECRET`: 필수값

## 로컬 개발 실행

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

워커는 별도 터미널에서 실행합니다.

```bash
npm run dev:worker
```

빌드 및 프로덕션 실행:

```bash
npm run build
npm start
npm run worker
```

테스트 실행:

```bash
npm test
```

## Docker Compose 실행

저장소의 `docker-compose.yml`을 사용하면 앱, 워커, Postgres, Redis, 미디어 서버, tracker를 함께 띄울 수 있습니다.

```bash
docker-compose up --build
```

기본 포트:

- API 앱: `4000 -> 3000`
- PostgreSQL: `5432`
- Redis: `6379`
- 미디어 서버: `1935`, `8000`
- tracker: `9000`

## 주요 스크립트

- `npm run dev`: API 서버 개발 모드
- `npm run dev:worker`: 워커 개발 모드
- `npm run build`: TypeScript 빌드
- `npm start`: 빌드된 API 서버 실행
- `npm run worker`: 빌드된 워커 실행
- `npm test`: Jest 테스트 실행

## API 요약

### 인증 / 사용자

- `POST /api/users/register`: 회원가입
- `POST /api/users/login`: 로그인
- `POST /api/auth/login`: 로그인
- `POST /api/auth/refresh`: 액세스 토큰 재발급
- `POST /api/auth/logout`: 로그아웃
- `GET /api/users/:id`: 공개 사용자 정보 조회
- `GET /api/users/:id/channel`: 공개 채널 정보 조회
- `GET /api/users/me/channel`: 내 채널 정보 조회, 인증 필요

### 스트림

- `GET /api/streams`: 현재 라이브 목록 조회
- `POST /api/streams/webhooks`: 미디어 서버 웹훅 수신
- `POST /api/streams/:streamId/thumbnail/refresh`: 라이브 썸네일 강제 갱신

### VOD

- `POST /api/vods/upload`: VOD 업로드, 인증 필요, `multipart/form-data`
- `GET /api/vods/channel/:channelId`: 채널별 VOD 목록 조회
- `GET /api/vods/:vodId`: 단일 VOD 조회

상세 요청/응답 예시는 저장소의 `API.md` 문서를 참고하면 됩니다.

## WebSocket 채팅

Socket.IO를 사용합니다.

- 서버 실행 시 HTTP 서버와 함께 Socket.IO가 시작됩니다.
- 인증 토큰은 `socket.handshake.auth.token` 또는 `Authorization` 헤더로 전달할 수 있습니다.

주요 이벤트:

- `joinRoom`: 스트림 방 입장
- `leaveRoom`: 스트림 방 퇴장
- `sendMessage`: 메시지 전송
- `newMessage`: 서버가 방에 새 메시지 브로드캐스트

예시:

```ts
socket.emit('joinRoom', streamId);
socket.emit('sendMessage', {
  streamId,
  text: 'hello',
});
```

## 파일 업로드 / 미디어 처리

- 업로드 엔드포인트는 `video` 필드명을 사용합니다.
- 허용 MIME 타입: `mp4`, `mkv`, `webm`, `mov`
- 최대 업로드 크기: 500MB
- 업로드 파일은 `uploads/`에 저장됩니다.
- 워커는 `vod-processing`, `live-thumbnail` 큐를 구독합니다.
- 정적 파일은 `/static` 경로로 서빙됩니다.

## 헬스 체크

```http
GET /health
```

응답:

```json
{ "status": "ok" }
```

## 참고 문서

- `API.md`: API 상세 문서
- `PROJECT_STRUCTURE.md`: 구조 메모
- `ENDPOINTS_AND_USAGE.md`: 엔드포인트 및 사용 요약
- `PLAN*.md`, `PROGRESS*.md`: 작업 기록 문서
