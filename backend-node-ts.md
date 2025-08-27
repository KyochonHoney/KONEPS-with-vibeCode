# Backend (Node.js / TypeScript) 개발 체크리스트

## ✅ 구현 단계별 To-Do 리스트
- [ ] 프로젝트 초기화 (`npm init`, TypeScript 설정)
- [ ] `tsconfig.json` 설정 (paths, outDir 등)
- [ ] `ESLint` 및 `Prettier` 설정
- [ ] `dotenv` 라이브러리 설치 및 설정
- [ ] **[API]** 나라장터 API 연동 모듈 개발 (axios 또는 node-fetch 사용)
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

-

---

## 💡 추가 분석/개선사항
*구현 완료 후 또는 중간에 발견된 개선점을 기록합니다.*

- API 요청 실패 시 재시도 로직 강화
- 대용량 첨부파일 처리 시 스트리밍 방식 도입 검토
- 여러 공고 동시 처리 시 비동기/병렬 처리 최적화
- 실행 로그 및 에러 로그 기록 시스템 고도화 (e.g., Winston, Sentry)
