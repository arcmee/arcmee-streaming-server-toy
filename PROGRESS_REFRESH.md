# Refresh Token 작업 진행 현황

## 상태 요약
- 브랜치: feat/auth-refresh-flow
- 목표: 리프레시 토큰 추가로 만료된 액세스 토큰 재발급 플로우 지원

## 체크리스트
- [x] 데이터 모델 결정 (옵션 A: User 필드 / 옵션 B: RefreshToken 테이블) — 별도 RefreshToken 테이블로 다중 세션 관리
- [x] Prisma 스키마 작성(RefreshToken 모델 추가, onDelete cascade) — 마이그레이션 생성은 보류
- [x] 환경변수/설정 추가 (리프레시 만료, 시크릿 등)
- [x] 리프레시 토큰 발급/검증 유틸 구현
- [x] 로그인 시 액세스+리프레시 동시 발급
- [x] `/api/auth/refresh` 엔드포인트 구현 (롤링)
- [x] `/api/auth/logout` 엔드포인트 구현 (리프레시 폐기)
- [x] 기존 `/users/login` 흐름 정리/연동
- [x] 단위 테스트 (유스케이스/유틸)
- [x] e2e 테스트 (로그인→리프레시 기본 플로우)
- [x] 문서 업데이트 (`API.md`, `ENDPOINTS_AND_USAGE.md`)

## 진행 메모
- 서버에는 리프레시 토큰 해시+만료(및 선택적 기기 메타) 저장, 롤링 시 이전 해시 폐기
- Prisma 마이그레이션 파일은 DB 연결 필요해 생성하지 않음(스키마 변경 후 `npx prisma migrate dev --name add-refresh-token` 등 필요)
