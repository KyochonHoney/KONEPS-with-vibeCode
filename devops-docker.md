# DevOps (Docker) 환경 구축 체크리스트

## ✅ 구현 단계별 To-Do 리스트
- [ ] **[Dockerfile]** Backend (Node.js/TypeScript)용 Dockerfile 작성
  - Multi-stage build를 활용하여 이미지 최적화
- [ ] **[Dockerfile]** Frontend (React)용 Dockerfile 작성
  - Nginx 또는 서빙용 웹서버 기반 이미지 사용
- [ ] **[Dockerfile]** MySQL용 Dockerfile 작성 또는 공식 이미지 사용 방안 결정
- [ ] **[Compose]** `docker-compose.yml` 파일 작성
  - Backend, Frontend, DB 서비스 정의
  - 각 서비스 간 네트워크 설정
  - 환경변수 주입 설정 (`.env` 파일 활용)
- [ ] **[Volume]** 데이터 영속성을 위한 볼륨 설정
  - MySQL 데이터 저장용 볼륨
  - 다운로드된 첨부파일 및 생성된 HWP 파일 저장용 볼륨
- [ ] **[Script]** Docker 이미지 빌드 및 컨테이너 실행/종료 스크립트 작성 (`package.json` scripts)

---

## 🔄 진행 상태
*진행 상황, 발생한 이슈, 의사결정 사항 등을 자유롭게 기록합니다.*

-

---

## 💡 추가 분석/개선사항
*구현 완료 후 또는 중간에 발견된 개선점을 기록합니다.*

- CI/CD 파이프라인 구축 검토 (e.g., GitHub Actions, Jenkins)
  - Git push 시 자동 빌드 및 배포
- 컨테이너 모니터링 시스템 도입 검토 (e.g., Prometheus, Grafana)
- Docker 이미지 보안 취약점 스캔 도입
