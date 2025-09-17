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
- [ ] **(진행 중)** `RedisVodProcessingQueue` 구현