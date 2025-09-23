# 트위치 클론 백엔드 개발 계획 (클린 아키텍처)

## 1. 개요

이 문서는 **클린 아키텍처(Clean Architecture)** 원칙에 기반한 트위치 클론 프로젝트 백엔드의 개발 계획을 기술합니다. 이 프로젝트의 핵심 목표는 프레임워크, 데이터베이스 및 기타 외부 요인으로부터 독립적인 시스템을 만들어 높은 수준의 테스트 용이성, 유지보수성, 확장성을 확보하는 것입니다.

---

## 2. 핵심 원칙

모든 코드는 **의존성 규칙(The Dependency Rule)**을 따릅니다. 소스 코드의 의존성은 오직 안쪽을 향해야 하며, 안쪽 원의 코드는 바깥쪽 원의 코드에 대해 어떤 것도 알 수 없습니다.

```
        +---------------------------------------------------+
        |            프레임워크 & 드라이버 (Frameworks & Drivers)         |  <-- DB, Express, ORM, 미디어 서버
        |   +-------------------------------------------+   |
        |   |        인터페이스 어댑터 (Interface Adapters)       |   |  <-- 컨트롤러, 리포지토리 구현체
        |   |   +-----------------------------------+   |   |
        |   |   |   애플리케이션 (Application / Use Cases)  |   |   |
        |   |   |   +---------------------------+   |   |   |
        |   |   |   |     도메인 (Domain / Entities)    |   |   |   |
        |   |   |   +---------------------------+   |   |   |
        |   |   +-----------------------------------+   |   |
        |   +-------------------------------------------+   |
        +---------------------------------------------------+
        <-------------------- 의존성 방향 -------------------->
```

- **도메인(Domain):** 전사적인 비즈니스 로직과 규칙을 포함합니다. `엔티티(Entities)`와 `리포지토리 인터페이스(Repository Interfaces)`로 구성되며, 외부 의존성이 전혀 없습니다.
- **애플리케이션(Application):** 애플리케이션에 특화된 비즈니스 로직을 포함합니다. 도메인 계층의 데이터를 조율하는 `유스케이스(Use Cases)`로 구성되며, 오직 도메인 계층에만 의존합니다.
- **인프라스트럭처(Infrastructure):** 가장 바깥쪽 계층입니다. 프레임워크, 드라이버, 도구들이 위치합니다. Express, PostgreSQL 클라이언트 등이 여기에 해당하며, 안쪽 계층에 의존하고 그들의 인터페이스를 구현합니다.

---

## 3. 기술 스택

- **컨테이너화:** Docker, Docker Compose
- **언어:** TypeScript
- **웹 프레임워크:** Express.js
- **실시간 채팅:** Socket.IO
- **미디어 서버:** Node-Media-Server
- **메인 데이터베이스:** PostgreSQL
- **캐시 & 작업 큐:** Redis
- **ORM/DB 클라이언트:** TypeORM 또는 Prisma (추후 결정)

---

## 4. 디렉토리 구조

```
/src
├── domain/                     # 도메인 계층
│   ├── entities/               # 엔티티
│   │   ├── user.entity.ts
│   │   └── stream.entity.ts
│   └── repositories/           # 리포지토리 인터페이스
│       ├── IUserRepository.ts
│       └── IStreamRepository.ts
│
├── application/                # 애플리케이션 계층
│   ├── use-cases/              # 유스케이스
│   │   ├── user/
│   │   │   ├── CreateUser.usecase.ts
│   │   │   └── LoginUser.usecase.ts
│   │   └── stream/
│   │       ├── GetLiveStreams.usecase.ts
│   │       └── UpdateStreamStatus.usecase.ts
│   └── dtos/                     # 계층 간 데이터 전송 객체
│
├── infrastructure/             # 인프라스트럭처 계층
│   ├── web/
│   │   ├── express/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── middlewares/
│   │   └── websocket/
│   │       └── Chat.handler.ts
│   ├── persistence/
│   │   ├── postgres/
│   │   │   ├── repositories/     # 인터페이스의 구체적인 구현체
│   │   │   │   ├── PostgresUserRepository.ts
│   │   │   │   └── PostgresStreamRepository.ts
│   │   │   └── models/           # ORM에 특화된 모델
│   │   └── redis/
│   │       └── RedisClient.ts
│   ├── media/
│   │   └── NmsAdapter.ts         # Node-Media-Server 웹훅 어댑터
│   └── config/
│       └── index.ts
│
└── main.ts                       # Composition Root: 의존성 주입 설정
```

---

## 5. 개발 단계

### 1단계: 프로젝트 및 아키텍처 기반 구축
1.  **Docker 설정:** `app`, `db`, `redis`, `media-server` 서비스를 포함하는 `Dockerfile` 및 `docker-compose.yml` 생성.
2.  **프로젝트 초기화:** `tsconfig.json`, `npm` 패키지 및 위에서 정의된 전체 디렉토리 구조 설정.
3.  **핵심 도메인 정의:** `domain` 계층에 초기 `User` 엔티티와 `IUserRepository` 인터페이스 생성.
4.  **첫 유스케이스 구현:** `application` 계층에 간단한 `GetUser` 유스케이스 생성.
5.  **인프라스트럭처 설정:**
    - `infrastructure/persistence`에 `PostgresUserRepository`의 임시 구현체 생성.
    - `infrastructure/web`에 `UserController`와 테스트용 라우트(`GET /api/users/:id`) 생성.
6.  **Composition Root 작성:** `main.ts` 파일에서 모든 의존성을 수동으로 생성하고 주입.
7.  **목표:** `docker-compose up`을 실행하고 테스트 API 엔드포인트를 통해 모의(mock) 사용자를 성공적으로 조회.

### 2단계: 사용자 및 채널 시스템
1.  **도메인 구체화:** `User`와 `Stream` 엔티티에 필요한 모든 필드(비밀번호 해시, 스트림 키 등) 정의.
2.  **리포지토리 구현:** `PostgresUserRepository`와 `PostgresStreamRepository`를 완전하게 구현.
3.  **유스케이스 구현:** `CreateUser`, `LoginUser`, `GetChannelInfo` 유스케이스 생성 및 구현.
4.  **인증 구현:** `infrastructure/web/express/middlewares`에 JWT 기반 인증 미들웨어 생성.
5.  **컨트롤러 연결:** 컨트롤러와 라우트를 새로운 유스케이스에 연결.

### 3단계: 실시간 방송 및 상태 관리
1.  **미디어 어댑터 생성:** `Node-Media-Server`로부터 웹훅을 수신하고 파싱하는 `NmsAdapter` 구현.
2.  **유스케이스 구현:** `NmsAdapter`에 의해 트리거될 `UpdateStreamStatus` 유스케이스 생성.
3.  **방송 목록 구현:** `GetLiveStreams` 유스케이스와 해당 컨트롤러/라우트 구현.
4.  **흐름 테스트:** OBS로 방송 시작 → `media-server` → `NmsAdapter` → `UpdateStreamStatus` 유스케이스 → `PostgresStreamRepository` → DB 업데이트. 클라이언트는 API를 호출하여 실시간 방송 목록 확인.

### 4단계: 실시간 채팅
1.  **채팅 도메인 정의:** `ChatMessage` 엔티티와 `IChatRepository` 인터페이스 생성.
2.  **채팅 핸들러 구현:** `infrastructure/web/websocket`에 `socket.io` 연결을 관리하는 `ChatHandler` 생성.
3.  **유스케이스 구현:** `JoinRoom`, `LeaveRoom`, `SendMessage` 유스케이스 생성.
4.  **핸들러와 유스케이스 연결:** `ChatHandler`가 유스케이스를 호출. 예를 들어, "sendMessage" 이벤트를 받으면 `SendMessage` 유스케이스를 호출하고, 이는 `IChatRepository`를 사용해 메시지를 저장.

### 5단계: VOD (방송 다시보기) 시스템
1.  **VOD 도메인 정의:** `VOD` 엔티티, `IVodRepository` 인터페이스, `IVodProcessingQueue` 인터페이스 정의.
2.  **스트림 유스케이스 수정:** 방송 종료 시 `UpdateStreamStatus` 유스케이스가 `IVodProcessingQueue.add(job)`를 호출하도록 수정.
3.  **큐 구현:** `infrastructure` 계층에 BullMQ를 사용하여 `IVodProcessingQueue` 인터페이스의 구현체인 `RedisVodProcessingQueue` 생성.
4.  **VOD 워커 생성:** 큐를 리스닝하는 별도의 프로세스(또는 백그라운드 스레드) 생성.
5.  **VOD 유스케이스 구현:** `ffmpeg` 어댑터를 사용해 비디오를 변환하고 `IVodRepository`로 메타데이터를 저장하는 `ProcessVOD` 유스케이스 구현. 워커는 이 유스케이스를 실행.

### 6단계: 자동화된 테스트 구축
1.  **테스트 프레임워크 설정:**
    - `Jest` 테스트 프레임워크와 관련 라이브러리(`ts-jest`, `@types/jest`, `supertest`) 설치.
    - `jest.config.js` 파일을 생성하고 타입스크립트 및 경로 별칭을 지원하도록 설정.
    - `package.json`에 `test` 스크립트 추가.
2.  **유스케이스 유닛 테스트 작성:**
    - `in-memory` 가짜(fake) 리포지토리를 구현하여 외부 의존성을 제거하고, `application` 계층 유스케이스의 순수 비즈니스 로직을 테스트.
3.  **API 엔드포인트 E2E 테스트 작성:**
    - `supertest`를 사용하여 실제 API 엔드포인트를 호출하고, 전체 요청-응답 흐름을 검증.
