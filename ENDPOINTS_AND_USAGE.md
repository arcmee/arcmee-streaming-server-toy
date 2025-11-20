# 엔드포인트 요약 및 사용법

## 환경 변수
- `DATABASE_URL` (필수): Postgres 연결 문자열 (예: `postgres://user:password@localhost:5432/mydatabase`)
- `REDIS_URL` (필수): Redis 연결 문자열 (예: `redis://localhost:6379`)
- `JWT_SECRET` (필수), `JWT_EXPIRES_IN`(`1h` 기본), `JWT_ISSUER`(`streaming-server` 기본), `JWT_ALG`(`HS256` 기본)
- `PORT`(API 포트, 기본 3000), `BASE_URL`(워커가 퍼블릭 URL 생성 시 사용)

## 실행 방법
1) 의존 서비스 기동: `docker-compose up -d db redis`
2) Prisma 준비: `npx prisma generate` (+ 필요 시 `npx prisma migrate deploy`)
3) 로컬 실행: `npm run dev` (API), `npm run dev:worker` (워커)
4) 테스트: 환경 변수를 설정한 상태에서 `npm test`

## HTTP API
### 인증
- 헤더: `Authorization: Bearer <JWT>`

### Users & Channels
- `POST /api/users/register` — 회원가입(+스트림 생성), 응답: `{ user, token }`
- `POST /api/users/login` — 로그인, 응답: `{ token }`
- `GET /api/users/:id` — 공개 사용자 정보
- `GET /api/users/:id/channel` — 공개 채널 정보(스트림 상태 포함)
- `GET /api/users/me/channel` — 내 채널 정보(streamKey 포함, 인증 필요)

### Streams
- `GET /api/streams` — 라이브 스트림 목록
- `POST /api/streams/webhooks` — 미디어 서버 웹훅(event=`post_publish`|`done_publish`, `streamKey`)

### VODs
- `GET /api/vods/channel/:channelId` — 채널별 VOD 목록
- `GET /api/vods/:vodId` — VOD 단건 조회
- `POST /api/vods/upload` — VOD 업로드(멀티파트 `video`, 필드 `title`, `description`), 인증 필요

## WebSocket (Chat)
- 네임스페이스: 기본 socket.io
- 이벤트:
  - 클라이언트→서버 `joinRoom`(`streamId`), `leaveRoom`(`streamId`)
  - 클라이언트→서버 `sendMessage`({ streamId, text, userId })
  - 서버→클라이언트 `newMessage`(저장된 메시지)

## 기타
- VOD 처리 큐: BullMQ `vod-processing` 큐, 작업 페이로드 `{ streamId, recordedFilePath }`
- 워커: `npm run worker` (dist) 또는 `npm run dev:worker` (ts-node-dev)
