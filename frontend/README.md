# 나라장터 프론트엔드

React 기반의 나라장터 입찰 공고 관리 시스템입니다.

## 🚀 기술 스택

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Headless UI
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library + Cypress
- **CI/CD**: GitHub Actions + Vercel

## 📦 설치 및 실행

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 환경 변수 설정

```bash
# .env 파일 생성
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

## 🧪 테스트

### 단위 테스트

```bash
# 테스트 실행
npm run test

# 테스트 (UI 모드)
npm run test:ui

# 커버리지 확인
npm run coverage
```

### E2E 테스트

```bash
# Cypress 실행 (헤드리스)
npm run e2e

# Cypress 실행 (UI 모드)
npm run e2e:open
```

## 🏗️ 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

## 🚀 CI/CD 파이프라인

GitHub Actions를 통한 자동화된 CI/CD 파이프라인이 구성되어 있습니다:

### Pull Request 시
- ESLint 코드 품질 검사
- 단위 테스트 실행
- 테스트 커버리지 생성
- E2E 테스트 실행

### Main Branch Push 시
- 모든 테스트 통과 후 Vercel로 자동 배포
- 프로덕션 환경으로 자동 배포

### 필요한 GitHub Secrets

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
PRODUCTION_API_BASE_URL=https://api.yourdomain.com
STAGING_API_BASE_URL=https://staging-api.yourdomain.com
```

## 📁 프로젝트 구조

```
src/
├── components/          # 공통 컴포넌트
│   ├── __tests__/      # 컴포넌트 테스트
│   ├── ToastProvider.tsx
│   └── ThemeProvider.tsx
├── pages/              # 페이지 컴포넌트
│   ├── Auth/           # 인증 관련 페이지
│   ├── Admin/          # 관리자 페이지
│   └── Bids/           # 공고 관련 페이지
├── hooks/              # 커스텀 훅
├── services/           # API 서비스
├── store/              # 전역 상태 관리
├── types/              # TypeScript 타입 정의
└── layouts/            # 레이아웃 컴포넌트

cypress/
├── e2e/                # E2E 테스트
├── support/            # Cypress 설정
└── fixtures/           # 테스트 데이터
```

## 🔧 개발 가이드

### 코드 스타일
- ESLint + Prettier 적용
- TypeScript strict 모드 사용
- 함수형 컴포넌트 + React Hooks 패턴

### 테스트 작성 가이드
- 컴포넌트별 단위 테스트 작성 필수
- 중요한 사용자 플로우에 대한 E2E 테스트 작성
- 최소 80% 이상의 테스트 커버리지 유지

### API 연동
- React Query를 사용한 서버 상태 관리
- Axios interceptor를 통한 자동 토큰 관리
- 에러 핸들링 및 로딩 상태 관리

## 🔐 인증 시스템

- JWT 기반 인증 (Access Token + Refresh Token)
- Role-based 접근 제어 (user, superadmin)
- 자동 토큰 갱신 및 만료 처리
- 보호된 라우트 및 권한별 메뉴 표시

## 📱 반응형 디자인

- Mobile-first 접근 방식
- Tailwind CSS breakpoint 활용
- Phoenix Admin 템플릿 기반 일관된 UI/UX

## 🌙 다크 모드 지원

- 시스템 테마 자동 감지
- 사용자 설정 저장
- 모든 컴포넌트 다크 모드 호환

## 📞 지원

- 이슈 제보: GitHub Issues
- 문서: [프로젝트 위키](frontend-react.md)
