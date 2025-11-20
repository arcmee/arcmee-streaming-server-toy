# 작업 진행 상황

## 브랜치
- 현재 브랜치: `chore/improvements-progress` (master에서 분기)

## 최근 조치
- `node_modules` Git 추적 제거 및 커밋 (`chore: stop tracking node_modules`)
- 진행 메모 추가 및 커밋 (`docs: add work progress notes`)
- JWT 설정을 환경 변수 기반 모듈로 교체하고 토큰 발급 시 issuer/algorithm을 반영
- VOD 큐/워커 작업 페이로드를 `streamId`+`recordedFilePath`로 통일하고 Redis 연결 설정을 `REDIS_URL` 우선으로 통합

## 다음 작업 예정
- 채팅 메시지 ID 처리 수정, 라이브 스트림 `findAllLive` 바인딩 버그 수정
- 요청 검증·인증 추가(웹훅/채팅/업로드), `.env.example` 작성 및 BASE_URL/포트 정리
- 각 단계 후 진행 내용 갱신 및 커밋
