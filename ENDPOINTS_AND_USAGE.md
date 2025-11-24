# 엔드포인트 & 실행 요약

## 환경 변수
- `DATABASE_URL` (필수): Postgres 연결 문자열 (예: `postgres://user:password@localhost:5432/mydatabase`)
- `REDIS_URL` (필수): Redis 연결 문자열 (예: `redis://localhost:6379`)
- `JWT_SECRET`, `JWT_EXPIRES_IN`(기본 `1h`), `JWT_ISSUER`(기본 `streaming-server`), `JWT_ALG`(기본 `HS256`)
- `REFRESH_TOKEN_EXPIRES_IN`(기본 `30d`), `REFRESH_TOKEN_LENGTH`(기본 `64`), `REFRESH_TOKEN_BCRYPT_ROUNDS`(기본 `10`)
- `PORT`(기본 3000), `BASE_URL`(퍼블릭 URL 구성 시 사용)

## 실행 방법
1. 로컬 의존 서비스 기동: `docker-compose up -d db redis`
2. Prisma 클라이언트 생성: `npx prisma generate` (+ 필요 시 `npx prisma migrate deploy`)
3. 서버 실행: `npm run dev` (API), `npm run dev:worker` (워커)
4. 테스트: 환경 변수 세팅 후 `npm test`

## HTTP API
### 인증
- 헤더: `Authorization: Bearer <JWT>`

### Users & Channels
- `POST /api/users/register` — 회원가입(+스트림 생성), 응답: `{ user, token, refreshToken }`
- `POST /api/users/login` — 로그인, 응답: `{ token, refreshToken }`
- `GET /api/users/:id` — 특정 사용자 공개 정보
- `GET /api/users/:id/channel` — 특정 사용자의 채널 공개 정보
- `GET /api/users/me/channel` — 내 채널 정보(스트림 키 포함, 인증 필요)

### Auth
- `POST /api/auth/login` — 로그인(동일 응답 `{ token, refreshToken }`)
- `POST /api/auth/refresh` — 리프레시 토큰으로 액세스/리프레시 재발급(롤링)
- `POST /api/auth/logout` — 리프레시 토큰 폐기

### Streams
- `GET /api/streams` — 라이브 스트림 목록
- `POST /api/streams/webhooks` — 미디어 서버 웹훅(event=`post_publish`|`done_publish`, `streamKey`)

### VODs
- `GET /api/vods/channel/:channelId` — 채널별 VOD 목록
- `GET /api/vods/:vodId` — VOD 단건 조회
- `POST /api/vods/upload` — VOD 업로드(`video` 파일, `title`, `description`), 인증 필요

## WebSocket (채팅)
- 프로토콜: socket.io
- 이벤트
  - 클라이언트→서버: `joinRoom`(`streamId`), `leaveRoom`(`streamId`), `sendMessage`({ streamId, text, userId })
  - 서버→클라이언트: `newMessage`(수신 메시지)

## 기타
- VOD 처리는 BullMQ `vod-processing` 큐에 job `{ streamId, recordedFilePath }` 로 enqueue
- 워커 실행: `npm run worker`(dist) 또는 `npm run dev:worker`(ts-node-dev)
