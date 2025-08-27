# API 및 환경변수 관리 체크리스트

## ✅ 구현 단계별 To-Do 리스트
- [ ] **[.env]** `.env` 파일 생성 및 기본 구조 정의
- [ ] **[Variable]** 필요한 환경변수 목록 정의
  - `NARA_API_KEY` (나라장터 API 키)
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_DATABASE`
  - `HF_API_KEY` (HuggingFace API 키)
  - `PORT` (백엔드 서버 포트)
- [ ] **[.gitignore]** `.gitignore` 파일에 `.env` 파일 추가하여 Git에 커밋되지 않도록 설정
- [ ] **[Example]** `.env.example` 파일 생성하여 필요한 환경변수 목록 공유
- [ ] **[Backend]** Node.js에서 `dotenv` 라이브러리를 이용해 환경변수 로드하는 로직 구현
- [ ] **[Docker]** Docker Compose에서 `.env` 파일을 참조하여 컨테이너에 환경변수 주입 설정

---

## 🔄 진행 상태
*진행 상황, 발생한 이슈, 의사결정 사항 등을 자유롭게 기록합니다.*

- `.env` 파일이 이미 존재하므로, 필요한 변수들을 추가 정의할 예정.

---

## 💡 추가 분석/개선사항
*구현 완료 후 또는 중간에 발견된 개선점을 기록합니다.*

- Secret 관리 솔루션 도입 검토 (e.g., HashiCorp Vault, AWS Secrets Manager, Doppler)
- 개발(development), 테스트(test), 운영(production) 환경별 `.env` 파일 분리 관리 전략 수립
