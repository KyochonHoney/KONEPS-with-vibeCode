# 프론트엔드 개발 문서: React 기반 웹 애플리케이션

## 1. 프로젝트 개요

이 문서는 React 기반의 웹 애플리케이션 개발을 위한 상세 가이드라인을 제공합니다. 주요 목표는 사용자 친화적인 인터페이스를 통해 공고 정보를 효율적으로 관리하고, 관리자에게는 사용자 관리 기능을 제공하는 것입니다.

### 1.1. 아키텍처 개요

- **프론트엔드**: React (SPA)
- **UI 템플릿**: Phoenix Admin (라이선스 보유 가정)
- **인증**: 토큰 기반 (Access Token, Refresh Token) 이메일/비밀번호 로그인
- **권한**: RBAC (Role-Based Access Control) - `user`, `superadmin`
- **상태 관리**:
    - **Query 캐시**: React Query (데이터 페칭 및 캐싱)
    - **전역 인증 상태**: React Context API 또는 Zustand (인증 정보 관리)
    - **토큰 주입**: React Query의 `queryFn`에 인터셉터 패턴을 사용하여 토큰 자동 주입
    - **낙관적 업데이트**: 즐겨찾기 토글과 같은 사용자 액션에 즉각적인 UI 반응 제공

### 1.2. 라우팅 구조 (React Router v6 이상)

애플리케이션의 주요 라우팅 경로는 다음과 같습니다:

-   `/auth/login`: 사용자 로그인 페이지
-   `/bids`: 공고 리스트 페이지 (기본 홈)
-   `/bids/:id`: 특정 공고의 상세 정보 페이지 (첨부파일, 메타데이터, 다운로드 버튼, 상태 배지 포함)
-   `/favorites`: 현재 로그인 사용자의 즐겨찾기 공고 목록 페이지
-   `/admin/users`: 슈퍼관리자 전용 사용자 관리 페이지

### 1.3. 상태 관리 전략

-   **React Query**: 서버 상태(공고 목록, 사용자 목록 등) 관리에 사용됩니다. 데이터 페칭, 캐싱, 동기화, 에러 처리 등을 담당합니다.
    -   `queryFn`에 Axios 인터셉터 등을 활용하여 Access Token을 자동으로 주입합니다.
    -   `useMutation`을 사용하여 데이터 변경(예: 즐겨찾기 토글, 사용자 정보 수정)을 처리하고, 필요 시 낙관적 업데이트를 적용합니다.
-   **React Context API / Zustand**: 클라이언트 전역 상태(예: 로그인 사용자 정보, 테마 설정) 관리에 사용됩니다. 특히 인증 정보(`accessToken`, `refreshToken`, `role`)를 전역적으로 관리하여 애플리케이션 전반에서 접근 가능하도록 합니다.
-   **로컬 컴포넌트 상태**: `useState`, `useReducer` 등을 사용하여 컴포넌트 내부의 UI 상태를 관리합니다.

## 2. UI 와이어프레임 수준의 구조 및 컴포넌트 분해

### 2.1. 페이지 (Pages)

-   **LoginPage**: `/auth/login`
    -   이메일, 비밀번호 입력 필드
    -   로그인 버튼
    -   에러 메시지 표시 영역
-   **BidListPage**: `/bids`
    -   검색 바 (키워드 입력)
    -   정렬/필터링 옵션 (드롭다운 또는 탭)
    -   공고 목록 테이블/그리드
        -   각 공고 항목: 제목, 기관, 예산, 마감일, 별표(즐겨찾기) 아이콘, 다운로드 상태 표시
    -   페이지네이션 컨트롤
-   **BidDetailPage**: `/bids/:id`
    -   공고 제목, 본문
    -   첨부파일 목록 (다운로드 링크)
    -   메타 정보 (작성일, 조회수 등)
    -   다운로드 버튼
    -   공고 상태 배지 (예: '진행 중', '마감')
    -   별표(즐겨찾기) 토글 버튼
-   **FavoritesPage**: `/favorites`
    -   즐겨찾기 공고 목록 (BidListPage와 유사한 구조)
    -   검색, 정렬, 필터링 기능
    -   페이지네이션
-   **UserManagementPage**: `/admin/users` (슈퍼관리자 전용)
    -   사용자 목록 테이블
        -   각 사용자 항목: ID, 이메일, 역할, 상태(활성/잠금), 가입일
    -   검색 바 (이메일, 역할 등)
    -   사용자 생성/수정 모달 또는 페이지 링크
    -   권한 변경, 잠금/해제 토글 버튼

### 2.2. 모듈 (Modules)

-   **AuthModule**: 로그인 처리, 토큰 관리, 사용자 세션 유지
-   **BidModule**: 공고 데이터 페칭, 즐겨찾기 토글, 공고 상세 조회
-   **UserModule**: 사용자 목록 조회, 사용자 생성/수정, 권한/상태 변경 (관리자용)

### 2.3. 공용 컴포넌트 (Common Components)

-   **Layout**: Phoenix Admin 템플릿 기반의 전체 페이지 레이아웃 (헤더, 사이드바, 푸터, 콘텐츠 영역)
-   **Navigation**: 사이드바 또는 상단 바 메뉴 (라우팅 링크 포함)
-   **Table/Grid**: 재사용 가능한 데이터 테이블 또는 그리드 컴포넌트 (정렬, 페이지네이션 기능 내장)
-   **Form Elements**: Input, Button, Select, Checkbox, Radio 등
-   **Modal/Dialog**: 사용자 상호작용을 위한 모달 창
-   **LoadingSpinner/Skeleton**: 데이터 로딩 상태 표시
-   **ErrorBoundary**: 에러 경계 컴포넌트
-   **Notification/Toast**: 사용자에게 알림 메시지 표시

## 3. API 계약 명세

모든 API 요청은 `Authorization: Bearer <accessToken>` 헤더를 포함해야 합니다 (로그인 및 토큰 갱신 제외).

### 3.1. 인증 (Auth)

-   **로그인**: `POST /auth/login`
    -   **요청**: `{ email: string, password: string }`
    -   **응답**: `{ accessToken: string, refreshToken: string, role: 'user' | 'superadmin' }`
    -   **에러**: `401 Unauthorized` (잘못된 자격 증명), `400 Bad Request` (유효하지 않은 입력)
-   **토큰 갱신**: `POST /auth/refresh`
    -   **요청**: `{ refreshToken: string }`
    -   **응답**: `{ accessToken: string }`
    -   **에러**: `401 Unauthorized` (유효하지 않거나 만료된 Refresh Token)

### 3.2. 공고 (Bids)

-   **공고 목록 조회**: `GET /bids`
    -   **요청**: `?keyword={string}&page={number}&size={number}&sort={string}`
    -   **응답**: `{ items: Bid[], pageInfo: PageInfo }`
    -   **Bid 타입**: `{ id: string; title: string; org: string; budget: number; deadline: string; starred: boolean; downloaded: boolean }`
    -   **PageInfo 타입**: `{ page: number; size: number; total: number }`
-   **공고 상세 조회**: `GET /bids/:id`
    -   **요청**: (Path Parameter `id`)
    -   **응답**: `{ id: string; title: string; body: string; files: { name: string, url: string, status: string }[]; meta: Record<string, any>; starred: boolean; downloaded: boolean }`
    -   **에러**: `404 Not Found` (공고 없음)
-   **즐겨찾기 토글**: `POST /bids/:id/star`
    -   **요청**: (Path Parameter `id`)
    -   **응답**: `{ starred: boolean }` (토글 후의 즐겨찾기 상태)
    -   **에러**: `404 Not Found` (공고 없음), `401 Unauthorized`

### 3.3. 즐겨찾기 (Favorites)

-   **내 즐겨찾기 목록 조회**: `GET /favorites`
    -   **요청**: `?page={number}&size={number}&sort={string}` (공고 목록과 유사)
    -   **응답**: `{ items: Bid[], pageInfo: PageInfo }`

### 3.4. 사용자 관리 (Admin - Superadmin Only)

-   **사용자 목록 조회**: `GET /admin/users`
    -   **요청**: `?keyword={string}&page={number}&size={number}&sort={string}`
    -   **응답**: `{ items: User[], pageInfo: PageInfo }`
    -   **User 타입**: `{ id: string; email: string; role: 'user' | 'superadmin'; status: 'active' | 'locked'; createdAt: string }`
    -   **에러**: `403 Forbidden` (슈퍼관리자 권한 없음)
-   **사용자 정보 수정**: `PATCH /admin/users/:id`
    -   **요청**: (Path Parameter `id`), `{ role?: 'user' | 'superadmin', status?: 'active' | 'locked' }`
    -   **응답**: `{ id: string; email: string; role: 'user' | 'superadmin'; status: 'active' | 'locked'; createdAt: string }` (업데이트된 사용자 정보)
    -   **에러**: `403 Forbidden`, `404 Not Found`, `400 Bad Request`

### 3.5. 에러 코드 및 토큰 갱신 규칙

-   **에러 처리**: API 응답에서 `4xx` 또는 `5xx` 상태 코드를 받으면 적절한 에러 메시지를 사용자에게 표시합니다.
-   **토큰 만료**: Access Token 만료 시 (예: `401 Unauthorized` 응답), Refresh Token을 사용하여 새 Access Token을 발급받고, 원래 요청을 재시도합니다. Refresh Token도 만료된 경우, 사용자를 로그인 페이지로 리다이렉트합니다.

## 4. Phoenix Admin 템플릿 반영 지침

Phoenix Admin 템플릿을 최대한 활용하여 일관된 UI/UX를 제공합니다.

-   **레이아웃**: 템플릿이 제공하는 기본 레이아웃(사이드바, 헤더, 푸터, 콘텐츠 영역)을 사용합니다.
-   **테마 토큰**: 템플릿의 CSS 변수 또는 테마 설정을 활용하여 색상, 폰트, 간격 등을 일관되게 적용합니다. 커스텀 스타일은 최소화하고 템플릿의 디자인 시스템을 따릅니다.
-   **네비게이션**: 템플릿의 네비게이션 컴포넌트(사이드바 메뉴, 상단 바 메뉴)를 사용하여 라우팅 구조를 반영합니다. 권한에 따라 메뉴 항목을 동적으로 표시/숨김 처리합니다.
-   **다크 모드**: 템플릿이 제공하는 다크 모드 기능을 활성화하고, 애플리케이션의 모든 UI 요소가 다크 모드에서 올바르게 렌더링되는지 확인합니다.

## 5. 접근성/성능/보안 체크 항목

### 5.1. 접근성 (Accessibility)

-   모든 UI 컴포넌트에 의미론적 HTML 태그 사용 (예: `button`, `a`, `form`, `label`).
-   이미지에는 `alt` 속성 제공.
-   폼 요소에 `label`과 `for` 속성 연결.
-   키보드 내비게이션 지원 (Tab, Enter, Spacebar 등).
-   색상 대비 충분히 확보 (WCAG 2.1 AA 기준).
-   스크린 리더 사용자를 위한 ARIA 속성 (`aria-label`, `aria-describedby`, `role` 등) 적절히 사용.

### 5.2. 성능 (Performance)

-   React 컴포넌트 최적화: `React.memo`, `useCallback`, `useMemo` 활용.
-   코드 스플리팅 (Code Splitting) 및 지연 로딩 (Lazy Loading) 적용 (React.lazy, Suspense).
-   이미지 최적화 (압축, WebP 포맷 사용, 반응형 이미지).
-   불필요한 리렌더링 방지.
-   React Query 캐싱 전략 최적화 (staleTime, cacheTime 설정).
-   번들 사이즈 최소화 (Tree Shaking).

### 5.3. 보안 (Security - OWASP Top 10 기반 최소 체크리스트)

-   **A01:2021 – Broken Access Control**:
    -   클라이언트 측에서 권한 없는 페이지/기능 접근 시도 시 서버 측에서 재검증 및 차단.
    -   슈퍼관리자 전용 페이지 (`/admin/users`)는 클라이언트 라우팅 가드와 서버 API 권한 검증을 모두 적용.
-   **A02:2021 – Cryptographic Failures**:
    -   민감 데이터(비밀번호, 토큰)는 항상 HTTPS를 통해 전송.
    -   클라이언트 측에 민감 정보를 평문으로 저장하지 않음 (로컬 스토리지에 토큰 저장 시 XSS 취약점 인지).
-   **A03:2021 – Injection**:
    -   사용자 입력 값은 항상 서버로 전송 전 클라이언트 측에서 기본적인 유효성 검사 및 이스케이프 처리.
-   **A04:2021 – Insecure Design**:
    -   API 계약에 명시된 역할 기반 접근 제어(RBAC)를 프론트엔드에서 올바르게 반영.
-   **A05:2021 – Security Misconfiguration**:
    -   `.env` 파일을 통해 환경 변수 관리 및 빌드 시점에 주입.
    -   프로덕션 빌드 시 개발자 도구 비활성화 또는 최소화.
-   **A06:2021 – Vulnerable and Outdated Components**:
    -   `npm audit` 또는 `yarn audit`를 주기적으로 실행하여 취약한 라이브러리 업데이트.
-   **A07:2021 – Identification and Authentication Failures**:
    -   토큰 기반 인증의 안전한 구현 (Access Token 단기, Refresh Token 장기).
    -   Refresh Token 탈취 시나리오 대비 (재사용 감지 등).
-   **A08:2021 – Software and Data Integrity Failures**:
    -   CDN 사용 시 무결성 검증 (Subresource Integrity).
-   **A09:2021 – Security Logging and Monitoring Failures**:
    -   클라이언트 측 에러 로깅 (Sentry 등) 구현.
-   **A10:2021 – Server-Side Request Forgery (SSRF)**:
    -   프론트엔드에서 직접 외부 URL로 요청을 보내는 경우 주의 (백엔드 프록시 사용 권장).
-   **XSS (Cross-Site Scripting) 방어**:
    -   사용자 입력 값을 DOM에 직접 삽입하지 않고, React의 자동 이스케이프 기능을 활용.
    -   `dangerouslySetInnerHTML` 사용 시 신중하게 검토 및 입력 값 살균 처리.
-   **CSRF (Cross-Site Request Forgery) 방어**:
    -   토큰 기반 인증은 CSRF에 비교적 강하지만, 추가적인 CSRF 토큰 사용 고려 (백엔드와 협의).

## 6. 체크박스 To-Do 리스트 및 Done 기준

### 스프린트 1: 기본 구조 및 인증

-   [ ] 프로젝트 초기 설정 (React, TypeScript, React Router, TailwindCSS/Styled-components 등)
    -   **AC**: `npm start` 또는 `yarn start` 시 개발 서버 정상 구동.
    -   **DoD**: 기본 라우팅 (`/`, `/auth/login`) 설정 및 페이지 렌더링 확인.
-   [ ] Phoenix Admin 템플릿 통합 및 기본 레이아웃 구성
    -   **AC**: 템플릿의 헤더, 사이드바, 푸터가 애플리케이션에 적용됨.
    -   **DoD**: 템플릿의 기본 스타일 및 반응형 디자인이 유지됨.
-   [ ] 로그인 페이지 (`/auth/login`) 구현
    -   **AC**: 이메일, 비밀번호 입력 필드 및 로그인 버튼 UI 구현.
    -   **DoD**: 유효성 검사 (클라이언트 측) 및 에러 메시지 표시 기능 구현.
-   [ ] 인증 Context/Zustand 스토어 설정 및 토큰 관리 로직 구현
    -   **AC**: 로그인 성공 시 `accessToken`, `refreshToken`, `role`이 전역 상태에 저장됨.
    -   **DoD**: 토큰 만료 시 자동 갱신 로직 (React Query 인터셉터) 구현 및 테스트.
-   [ ] 로그인 API 연동 및 성공/실패 처리
    -   **AC**: `POST /auth/login` 호출 및 응답 처리.
    -   **DoD**: 로그인 성공 시 `/bids`로 리다이렉트, 실패 시 에러 메시지 표시.

### 스프린트 2: 공고 목록 및 상세

-   [ ] 공고 리스트 페이지 (`/bids`) 구현
    -   **AC**: `GET /bids` API 연동 및 공고 목록 테이블/그리드 렌더링.
    -   **DoD**: 검색, 정렬, 필터링 UI 및 기능 연동. 페이지네이션 동작 확인.
-   [ ] 공고 상세 페이지 (`/bids/:id`) 구현
    -   **AC**: `GET /bids/:id` API 연동 및 공고 상세 정보 표시.
    -   **DoD**: 첨부파일 목록, 메타 정보, 다운로드 버튼, 상태 배지 UI 구현.
-   [ ] 즐겨찾기 토글 기능 구현 (공고 리스트/상세)
    -   **AC**: `POST /bids/:id/star` API 연동 및 낙관적 업데이트 적용.
    -   **DoD**: UI에서 별표 아이콘 상태가 즉시 변경되고, 서버 응답 후 최종 상태 반영.

### 스프린트 3: 즐겨찾기 및 관리자 기능

-   [ ] 내 즐겨찾기 페이지 (`/favorites`) 구현
    -   **AC**: `GET /favorites` API 연동 및 즐겨찾기 공고 목록 표시.
    -   **DoD**: 로그인 사용자만 접근 가능하며, 공고 리스트와 유사한 검색/정렬/필터링/페이지네이션 기능 제공.
-   [ ] 슈퍼관리자 전용 사용자 관리 페이지 (`/admin/users`) 구현
    -   **AC**: `GET /admin/users` API 연동 및 사용자 목록 테이블 렌더링.
    -   **DoD**: 슈퍼관리자만 접근 가능하며, 일반 사용자는 접근 시 에러 페이지 또는 리다이렉트.
-   [ ] 사용자 생성/수정/권한 변경/잠금 기능 구현 (관리자)
    -   **AC**: `PATCH /admin/users/:id` API 연동 및 모달/폼 UI 구현.
    -   **DoD**: 사용자 정보 수정 및 역할/상태 변경 기능 정상 동작 확인.

### 스프린트 4: 환경 설정 및 배포 준비

-   [ ] 환경 변수 관리 (`.env`) 설정
    -   **AC**: API Base URL 등 민감하지 않은 설정이 `.env` 파일에서 주입됨.
    -   **DoD**: 개발/운영 환경에 따라 올바른 API 엔드포인트가 사용됨.
-   [ ] 접근성, 성능, 보안 체크리스트 검토 및 반영
    -   **AC**: 주요 페이지에 대한 Lighthouse/AXE Core 검사에서 심각한 문제 없음.
    -   **DoD**: 번들 사이즈 최적화 및 불필요한 리렌더링 최소화.
-   [ ] 에러 핸들링 및 로깅 전략 구현
    -   **AC**: API 에러 발생 시 사용자에게 친화적인 메시지 표시.
    -   **DoD**: Sentry 또는 유사한 에러 로깅 서비스 연동 (선택 사항).


### Step 6: 슈퍼관리자 사용자 관리
- [x] 사용자 목록 테이블 (ID, 이메일, 역할, 상태, 가입일) (2025-08-27 12:16 KST)
- [x] 검색 입력 필드 (2025-08-27 12:16 KST)
- [x] 사용자 역할 변경 및 계정 잠금/해제 버튼 (2025-08-27 12:16 KST)
- [x] 낙관적 업데이트 및 롤백 동작 확인 (2025-08-27 12:16 KST)
- [x] 정렬/검색/페이지네이션 URL 쿼리 동기화 (2025-08-27 10:30 KST)
- [x] 성공/실패 토스트 알림 노출 (2025-08-27 10:30 KST)

## 7. 테스트 계획

-   **단위 테스트 (Unit Tests)**:
    -   **도구**: Jest, React Testing Library
    -   **대상**: 개별 React 컴포넌트 (렌더링, 사용자 상호작용), 유틸리티 함수, 커스텀 훅, Redux/Zustand 액션/리듀서.
    -   **목표**: 각 단위의 기능이 예상대로 동작하는지 검증.
-   **통합 테스트 (Integration Tests)**:
    -   **도구**: Jest, React Testing Library
    -   **대상**: 여러 컴포넌트의 조합, API 연동 로직 (Mocking), 라우팅 흐름.
    -   **목표**: 컴포넌트 간의 상호작용 및 모듈 간의 연동이 올바른지 검증.
-   **E2E 테스트 (End-to-End Tests)**:
    -   **도구**: Cypress 또는 Playwright
    -   **대상**: 실제 브라우저 환경에서 사용자 시나리오 전체 흐름 (로그인, 공고 조회, 즐겨찾기 토글, 관리자 기능 등).
    -   **목표**: 실제 사용자 관점에서 애플리케이션의 핵심 기능이 정상적으로 동작하는지 검증.

## 8. 릴리즈 절차

1.  **버전 관리**: Semantic Versioning (SemVer) 따르기 (MAJOR.MINOR.PATCH).
2.  **브랜치 전략**: Git Flow 또는 GitHub Flow 사용. `main` 브랜치는 항상 안정적인 프로덕션 코드 유지.
3.  **코드 리뷰**: 모든 기능 개발 및 버그 수정은 코드 리뷰를 통해 승인 후 `develop` 또는 `main` 브랜지에 병합.
4.  **빌드**: `npm run build` 또는 `yarn build` 명령어를 사용하여 프로덕션 빌드 생성.
5.  **테스트**: 빌드된 결과물에 대해 E2E 테스트 및 수동 QA 수행.
6.  **태깅**: 릴리즈 준비가 완료되면 `main` 브랜치에 버전 태그 (예: `v1.0.0`) 생성.
7.  **체인지로그**: `CHANGELOG.md` 파일에 해당 버전의 주요 변경 사항, 새로운 기능, 버그 수정 등을 기록.
8.  **배포**: 빌드된 정적 파일을 웹 서버 또는 CDN에 배포.

## 9. 후속 작업 백로그 (Nice-to-Have)

-   공고 알림 기능 (새 공고 등록 시 푸시 알림 또는 이메일 알림)
-   사용자 프로필 편집 기능 (일반 사용자용)
-   다국어 지원 (i18n)
-   테마 커스터마이징 기능 (사용자 선택)
-   성능 모니터링 및 최적화 도구 연동 (예: Web Vitals)
-   오프라인 지원 (PWA)
-   첨부파일 미리보기 기능
-   관리자 대시보드 (통계, 현황판)
-   소셜 로그인 연동
-   비밀번호 찾기/재설정 기능