# 작업 진행 상황

## 브랜치
- 현재 브랜치: `chore/improvements-progress` (master에서 분기)

## 최근 조치
- `node_modules` Git 추적 제거 및 커밋 (`chore: stop tracking node_modules`)
- 진행 메모 추가 및 커밋 (`docs: add work progress notes`)
- JWT 설정을 환경 변수 기반 모듈로 교체하고 토큰 발급 시 issuer/algorithm을 반영
- VOD 큐/워커 작업 페이로드를 `streamId`+`recordedFilePath`로 통일하고 Redis 연결 설정을 `REDIS_URL` 우선으로 통합
- 채팅 메시지 생성 시 cuid로 ID를 생성하도록 수정, 라이브 스트림 조회의 this 바인딩 버그 수정
- 인증 미들웨어가 환경 기반 JWT 설정을 사용하도록 수정, NMS 웹훅 입력 검증 추가, `.env.example` 작성
- E2E/단위 테스트 실행: 단위 테스트 통과, E2E는 `DATABASE_URL` 미설정으로 Prisma 초기화 실패 (DB 필요)

## 다음 작업 예정
- 요청 검증·인증 추가(채팅/업로드 등 추가 검증), BASE_URL/포트 정리 필요 시 점검
- 각 단계 후 진행 내용 갱신 및 커밋
