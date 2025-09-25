# 개발 진행 상황

## 1단계: 프로젝트 및 아키텍처 기반 구축

- [x] **(완료)**

## 2단계: 사용자 및 채널 시스템

- [x] **(완료)**

## 3단계: 실시간 방송 및 상태 관리

- [x] **(완료)**

## 4단계: 실시간 채팅

- [x] **(완료)** 채팅 도메인 정의 (`ChatMessage`, `IChatRepository`)
- [x] **(완료)** Prisma 스키마 업데이트 및 마이그레이션
- [x] **(완료)** `socket.io` 설치 및 서버 연동
- [x] **(완료)** `ChatHandler` 구현
- [x] **(완료)** `SendMessage` 유스케이스 및 리포지토리 구현
- [x] **(완료)** `ChatHandler`와 유스케이스 연동

## 5단계: VOD (방송 다시보기) 시스템

- [x] **(완료)** VOD 도메인 정의 (`VOD` 엔티티, `IVodRepository`, `IVodProcessingQueue`)
- [x] **(완료)** `UpdateStreamStatus` 유스케이스 수정: 방송 종료 시 VOD 처리 작업 추가
- [x] **(완료)** `RedisVodProcessingQueue` 구현
- [x] **(완료)** VOD 처리 워커 생성
- [x] **(완료)** `ProcessVOD` 유스케이스 및 API 구현 (FFmpeg 연동, 스토리지, 빌드 오류 해결)

## 6단계: 자동화된 테스트 구축

- [x] **(완료)** 테스트 프레임워크 설정 (Jest, ts-jest, supertest 설치 및 설정)
- [x] **(완료)** `user` 도메인 유스케이스 유닛 테스트 작성 (`GetUser`, `CreateUser`, `LoginUser`, `GetChannelInfo`)
- [x] **(완료)** `stream` 도메인 유스케이스 유닛 테스트 작성 (`GetLiveStreams`, `UpdateStreamStatus`)
- [x] **(완료)** `chat` 도메인 유스케이스 유닛 테스트 작성 (`SendMessage`)
- [x] **(완료)** `vod` 도메인 유스케이스 유닛 테스트 작성 (`GetVod`, `GetVodsByChannel`, `ProcessVOD`)
- [x] **(완료)** API 엔드포인트 E2E 테스트 작성 (User API - 회원가입, 로그인)
- [x] **(완료)** API 엔드포인트 E2E 테스트 작성 (Stream API - 방송 목록/상태)
- [x] **(완료)** API 엔드포인트 E2E 테스트 작성 (VOD API - VOD 목록/조회)

## 7단계: VOD 직접 업로드 (closes #25)

- [x] **(완료)** API 엔드포인트 및 유스케이스 기본 구조 생성
- [x] **(완료)** `app.ts`에 의존성 주입
- [x] **(완료)** 테스트 코드 작성