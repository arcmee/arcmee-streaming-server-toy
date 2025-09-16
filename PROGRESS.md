# 개발 진행 상황

## 1단계: 프로젝트 및 아키텍처 기반 구축

- [x] Docker 환경 설정 (`docker-compose.yml`, `Dockerfile`)
- [x] Node.js 프로젝트 초기화 (`package.json`, `tsconfig.json`)
- [x] 클린 아키텍처 디렉토리 구조 생성
- [x] **(완료)** "사용자 조회" 기능 전체 계층에 걸쳐 구현
- [x] **(완료)** `docker-compose up --build`로 서버 실행 및 API 테스트하여 1단계 완료 검증

## 2단계: 사용자 및 채널 시스템

- [x] **(완료)** 도메인 구체화: `User` 엔티티의 `password`와 `streamKey` 필드를 필수로 변경
- [x] **(완료)** Prisma 설정 및 초기 마이그레이션 완료
- [x] **(완료)** `PostgresUserRepository`를 Prisma를 사용하도록 구현
- [x] **(완료)** `PostgresStreamRepository`를 Prisma를 사용하도록 구현
- [x] **(완료)** `CreateUser`, `LoginUser`, `GetChannelInfo` 유스케이스 생성 및 구현
- [x] **(완료)** JWT 기반 인증 미들웨어 생성
- [x] **(완료)** 컨트롤러와 라우트를 새로운 유스케이스에 연결

## 3단계: 실시간 방송 및 상태 관리

- [x] **(완료)** NmsAdapter(웹훅) 및 `UpdateStreamStatus` 유스케이스 구현
- [x] **(완료)** `GetLiveStreams` 유스케이스 및 관련 API 구현

## 4단계: 실시간 채팅

- [ ] 미완료

## 5단계: VOD (방송 다시보기) 시스템

- [ ] 미완료