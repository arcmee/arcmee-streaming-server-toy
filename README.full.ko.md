# 스트리밍 플랫폼 통합 안내서

이 문서는 아래 두 저장소를 함께 운영하는 기준으로 작성한 한국어 README입니다.

- 서버: `C:\Users\user\my-projects\streaming_server`
- 클라이언트: `C:\Users\user\my-projects\streaming-app`

서버는 인증, 채널, 라이브 상태, 채팅, VOD 처리, 썸네일 생성 역할을 담당하고, 클라이언트는 웹/모바일 화면과 사용자 상호작용을 담당합니다.

## 전체 구성

### 1. 서버 저장소 `streaming_server`

주요 역할:

- 회원가입, 로그인, 액세스 토큰/리프레시 토큰 처리
- 채널 및 스트림 정보 관리
- 라이브 목록 조회
- Socket.IO 기반 실시간 채팅
- VOD 업로드 및 BullMQ 워커 후처리
- FFmpeg 기반 라이브 썸네일 생성
- PostgreSQL, Redis, 미디어 서버 연동

핵심 진입점:

- `src/main.ts`: HTTP API + Socket.IO 서버 실행
- `src/worker.ts`: VOD/썸네일 워커 실행
- `src/app.ts`: 의존성 조립 및 라우트 등록

### 2. 클라이언트 저장소 `streaming-app`

주요 역할:

- 라이브 스트림 목록 화면
- 로그인/회원가입 화면
- 내 채널 및 스트림 키 확인 화면
- 채널 상세, HLS 재생, 실시간 채팅
- 채널별 VOD 목록 및 단일 VOD 재생
- VOD 업로드 화면

구성 방식:

- Turborepo 기반 모노레포
- `apps/web`: 웹 클라이언트, Next.js, 기본 포트 `3000`
- `apps/mobile`: 별도 Next.js 클라이언트, 기본 포트 `3001`
- `packages/logic`: API 호출, 인증, 채팅 로직 공유
- `packages/ui`: 공통 UI 컴포넌트 공유

## 저장소별 기술 스택

### 서버

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Socket.IO
- FFmpeg
- Jest

### 클라이언트

- Node.js
- TypeScript
- Turborepo
- Next.js 15
- React 19
- Socket.IO Client
- HLS.js
- React Player
- Playwright

## 권장 로컬 포트 구성

- 클라이언트 web: `http://localhost:3000`
- 클라이언트 mobile: `http://localhost:3001`
- 서버 API/Socket.IO: `http://localhost:4000`
- 서버 내부 Express 기본 포트: `3000` 또는 `.env`의 `PORT`
- 미디어 서버(HLS/RTMP): `http://localhost:8000`, `rtmp://localhost:1935`
- PostgreSQL: `5432`
- Redis: `6379`

서버 저장소의 Docker Compose를 사용할 경우 외부에서는 주로 `http://localhost:4000`으로 접근하게 됩니다.

## 빠른 실행 순서

### 1. 서버 실행

`C:\Users\user\my-projects\streaming_server`에서:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

별도 터미널에서 워커 실행:

```bash
npm run dev:worker
```

또는 Docker Compose 사용:

```bash
docker-compose up --build
```

### 2. 클라이언트 실행

`C:\Users\user\my-projects\streaming-app`에서:

```bash
npm install
npm run dev
```

특정 앱만 실행할 수도 있습니다.

```bash
npx turbo run dev --filter=web
npx turbo run dev --filter=mobile
```

## 서버 환경 변수

서버 저장소 `.env` 예시:

```env
DATABASE_URL=postgres://user:password@localhost:5432/mydatabase
REDIS_URL=redis://localhost:6379

PORT=3000
BASE_URL=http://localhost:4000
CLIENT_ORIGIN=http://localhost:3000
LIVE_HLS_ROOT=./media-live/live

JWT_SECRET=change-me
JWT_EXPIRES_IN=1h
JWT_ISSUER=streaming-server
JWT_ALG=HS256

REFRESH_TOKEN_EXPIRES_IN=30d
REFRESH_TOKEN_LENGTH=64
REFRESH_TOKEN_BCRYPT_ROUNDS=10
```

핵심 포인트:

- `JWT_SECRET`은 필수입니다.
- `BASE_URL`은 썸네일/VOD 같은 정적 URL 생성에 사용됩니다.
- `CLIENT_ORIGIN`은 프런트엔드 도메인을 맞춰야 합니다.
- `LIVE_HLS_ROOT`는 라이브 HLS 파일을 읽는 실제 경로입니다.

## 클라이언트 환경 변수

클라이언트 저장소에서는 아래 값이 중요합니다.

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_STREAMING_SERVER_URL=http://localhost:8000
```

의미:

- `NEXT_PUBLIC_API_URL`: 서버 REST API 주소
- `NEXT_PUBLIC_SOCKET_SERVER_URL`: 채팅 Socket.IO 서버 주소
- `NEXT_PUBLIC_STREAMING_SERVER_URL`: HLS 재생 주소 및 스트리밍 서버 주소 계산용

일반적인 연결 조합:

- 클라이언트 웹 `3000`
- 서버 API `4000`
- 미디어 서버 `8000`

## 주요 기능 흐름

### 회원가입 / 로그인

1. 클라이언트가 서버에 회원가입 또는 로그인 요청
2. 서버가 액세스 토큰과 리프레시 토큰 발급
3. 클라이언트 공통 로직(`packages/logic`)이 토큰 저장 및 갱신 처리

### 라이브 시청

1. 클라이언트가 채널 정보 조회
2. 클라이언트가 스트림 상태와 재생 주소 구성
3. HLS.js 또는 브라우저 기본 비디오 재생기로 라이브 재생

### 실시간 채팅

1. 클라이언트가 Socket.IO로 서버 접속
2. 토큰을 handshake auth 또는 `Authorization` 헤더로 전달
3. `joinRoom`, `sendMessage` 이벤트로 스트림 채팅 참여
4. 서버가 `newMessage`를 브로드캐스트

### VOD 업로드 / 처리

1. 클라이언트가 `multipart/form-data`로 VOD 업로드
2. 서버가 업로드 파일 저장 후 BullMQ 작업 큐 등록
3. 워커가 FFmpeg 기반 후처리 수행
4. 처리된 썸네일/비디오 URL을 서버에서 제공

## 서버 주요 API

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users/:id`
- `GET /api/users/:id/channel`
- `GET /api/users/me/channel`
- `GET /api/streams`
- `POST /api/streams/webhooks`
- `POST /api/streams/:streamId/thumbnail/refresh`
- `POST /api/vods/upload`
- `GET /api/vods/channel/:channelId`
- `GET /api/vods/:vodId`
- `GET /health`

## 클라이언트 주요 화면

### `apps/web`

- `/`: 라이브 목록
- `/login`: 로그인
- `/signup`: 회원가입
- `/me`: 내 채널/스트림 정보
- `/channel/[userId]`: 채널 상세, 라이브, 채팅
- `/channel/[userId]/vods`: 채널별 VOD 목록
- `/vod/[vodId]`: VOD 상세
- `/vod/upload`: VOD 업로드

### `apps/mobile`

이름은 `mobile`이지만 현재 구조상 React Native 앱이 아니라 별도 Next.js 앱입니다. 주요 흐름은 `web`과 유사하며 기본 포트만 `3001`입니다.

## 서버 저장소 주요 명령

- `npm run dev`: API 개발 서버
- `npm run dev:worker`: 워커 개발 서버
- `npm run build`: 빌드
- `npm start`: 빌드된 API 실행
- `npm run worker`: 빌드된 워커 실행
- `npm test`: Jest 테스트

## 클라이언트 저장소 주요 명령

- `npm run dev`: 전체 앱 개발 모드
- `npm run build`: 전체 빌드
- `npm run lint`: 전체 lint
- `npm run check-types`: 타입 체크
- `npm run format`: 포맷
- `npm run test:e2e`: Playwright E2E 테스트

## 운영 시 주의할 점

- 서버와 클라이언트의 포트/CORS 설정이 맞아야 합니다.
- 서버는 PostgreSQL, Redis, FFmpeg가 준비되어야 기능이 완전하게 동작합니다.
- 클라이언트의 HLS 재생 주소는 미디어 서버 포트와 정확히 맞아야 합니다.
- 서버 워커를 같이 띄우지 않으면 VOD 처리와 라이브 썸네일 작업이 진행되지 않습니다.
- Docker Compose를 쓰는 경우 `BASE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STREAMING_SERVER_URL` 값을 외부 접근 주소 기준으로 맞춰야 합니다.

## 문서 위치

서버 저장소:

- `README.md`
- `API.md`
- `PROJECT_STRUCTURE.md`

클라이언트 저장소:

- `README.md`
- `README.ko.md`
- `TESTING.md`
- `PROJECT_STRUCTURE.md`
