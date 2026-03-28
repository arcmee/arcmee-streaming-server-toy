# 프로젝트 구조

## 애플리케이션 코드
- `src/` — TypeScript 소스 (별칭 `@src/*`)
  - `app.ts` — Express 앱 조립(레포지토리, 컨트롤러, 라우트, 미들웨어)
  - `main.ts` — HTTP 서버 + Socket.IO 채팅 핸들러 부트스트랩
  - `worker.ts` — BullMQ VOD 워커
  - `domain/` — 엔티티(`user`, `stream`, `chat` 등), 레포지토리 인터페이스
  - `application/` — 유스케이스, DTO, 서비스(auth, stream, chat, VOD)
  - `infrastructure/`
    - `web/express` — 컨트롤러, 라우트, 미들웨어
    - `web/websocket` — `Chat.handler.ts`
    - `persistence/postgres` — Prisma 기반 레포지토리
    - `persistence/redis` — Redis 클라이언트/큐
    - `media/` — FFmpeg 비디오 프로세서
  - `tests/` — 페이크; `application` 유닛 테스트는 `__tests__` 아래
  - `e2e/` — 통합 테스트

## 미디어 서버
- `media-server/nginx.conf` — nginx-rtmp 설정(RTMP ingest → `/live/<streamKey>.m3u8` HLS)
- `Dockerfile.media-server` — `alfg/nginx-rtmp` 기반 미디어 서버 이미지 빌드
- `media-live/` — HLS 출력 볼륨(Git ignore, `.gitkeep`만 추적)

## 컨테이너 & 인프라
- `docker-compose.yml` — 서비스(app, db(Postgres), redis, media-server, tracker)
- `Dockerfile` — 앱 컨테이너 빌드
- `prisma/` — Prisma 스키마 및 마이그레이션

## 설정 & 문서
- `.env`, `.env.example` — 환경변수
- API/문서: `API.md`, `ENDPOINTS_AND_USAGE.md`, `AGENTS.md`, `NEXT_STEPS.md`, `PLAN.md`(계획 노트)

## 테스트 & 도구
- `jest.config.js` — Jest 설정
- `tsconfig.json` — TypeScript 컴파일 설정
