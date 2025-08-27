# Backend (Node.js / TypeScript) 개발 체크리스트

## ✅ 구현 단계별 To-Do 리스트
- [x] 프로젝트 초기화 (`npm init`, TypeScript 설정)
- [x] `tsconfig.json` 설정 (paths, outDir 등)
- [x] `ESLint` 및 `Prettier` 설정
- [x] `dotenv` 라이브러리 설치 및 설정
- [x] **[API]** 나라장터 API 연동 모듈 개발 (axios 또는 node-fetch 사용)
- [ ] **[File]** 첨부파일 다운로드 및 지정된 경로에 저장 로직 구현
- [ ] **[AI]** HuggingFace 모델 연동 모듈 개발 (API 요청 및 응답 처리)
- [ ] **[Logic]** 다운로드된 문서 분석 요청 및 결과 수신 로직
- [ ] **[Data]** 분석 결과를 기반으로 제안서 초안 데이터 구조화
- [ ] **[HWP]** 한글 파일(.hwp) 생성 라이브러리 연동 및 구현
- [ ] **[Scheduler]** `node-cron` 또는 유사 라이브러리를 이용한 스케줄러 구현 (매일 특정 시간 실행)
- [ ] **[API Server]** Frontend 연동을 위한 API 엔드포인트 설계 및 구현 (Express.js 또는 Fastify)
- [ ] **[Error]** 에러 핸들링 및 로깅 시스템 구축

---

## 🔄 진행 상태
*진행 상황, 발생한 이슈, 의사결정 사항 등을 자유롭게 기록합니다.*

### 2025-08-27
- ✅ **1-4단계 완료**: 프로젝트 기본 설정 완료
  - npm 프로젝트 초기화 및 TypeScript 설정 완료
  - tsconfig.json 설정 (경로 매핑, outDir 등 포함)
  - ESLint 및 Prettier 설정 완료 (.eslintrc.js, .prettierrc, ignore 파일들)
  - dotenv 라이브러리 설치 및 환경변수 설정 완료
  - 코드 포맷팅 및 린팅 규칙 적용 (64개 경고만 남음, 에러 0개)
  - 기존 데이터베이스 연동 및 API 서버 구축 완료 (포트 8002)
- ✅ **5단계 완료**: 나라장터 API 연동 모듈 개발
  - axios 라이브러리를 사용한 HTTP 클라이언트 구성
  - 나라장터 정부 API (BidPublicInfoService04) 연동 서비스 클래스 구현
  - API 응답 파싱 및 데이터베이스 저장 로직 구현
  - RESTful API 엔드포인트 구성 (/api/narajangter/*)
  - 환경변수를 통한 API 키 및 설정 관리
  - 입찰공고 수집, 저장, 조회 기능 완성
  - 연결 테스트 및 상태 확인 기능 구현

---

## 💡 추가 분석/개선사항
*구현 완료 후 또는 중간에 발견된 개선점을 기록합니다.*

- API 요청 실패 시 재시도 로직 강화
- 대용량 첨부파일 처리 시 스트리밍 방식 도입 검토
- 여러 공고 동시 처리 시 비동기/병렬 처리 최적화
- 실행 로그 및 에러 로그 기록 시스템 고도화 (e.g., Winston, Sentry)
