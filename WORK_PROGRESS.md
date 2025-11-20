# 작업 진행 상황

## 브랜치
- 현재 브랜치: `chore/improvements-progress` (마스터에서 분기)

## 최근 조치
- `node_modules` Git 추적 제거 후 커밋(`chore: stop tracking node_modules`)
- 개선 포인트 식별: JWT 설정 하드코딩, VOD 큐/워커 스키마 불일치, 채팅 메시지 ID 처리, `findAllLive` 바인딩, 입력 검증·인증 부재, 환경 샘플/BASE_URL 불일치

## 다음 작업 예정
- JWT 설정 모듈화 및 env 기반 공통 설정 적용
- VOD 큐 DTO·Redis 설정 일원화, `recordedFilePath` 전달 경로 정리
- 채팅 메시지 ID 생성/저장 로직 수정
- `PostgresStreamRepository.findAllLive` 바인딩 수정
- 주요 엔드포인트/소켓에 요청 검증·인증 추가
- `.env.example` 작성 및 BASE_URL/포트 정합성 맞추기
