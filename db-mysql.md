# DB (MySQL) 설계 및 구축 체크리스트

## ✅ 구현 단계별 To-Do 리스트
- [ ] **[Design]** 테이블 스키마 설계
  - `announcements` (공고 정보)
  - `files` (첨부파일 정보)
  - `analysis_results` (분석 결과)
  - `proposal_drafts` (제안서 초안)
- [ ] **[Setup]** MySQL 서버 설치 또는 클라우드 DB 인스턴스 생성
- [ ] **[Setup]** 프로젝트용 데이터베이스 및 사용자 계정 생성
- [ ] **[Connection]** Backend와 DB 연동 설정 (Connection Pool 포함)
- [ ] **[ORM]** ORM(e.g., Sequelize, TypeORM) 또는 쿼리 빌더(e.g., Knex.js) 설정
- [ ] **[Migration]** 스키마 변경 관리를 위한 마이그레이션 시스템 구축
- [ ] **[CRUD]** 각 테이블에 대한 데이터 저장, 조회, 수정, 삭제 로직(Repository/DAO) 구현

---

## 🔄 진행 상태
*진행 상황, 발생한 이슈, 의사결정 사항 등을 자유롭게 기록합니다.*

-

---

## 💡 추가 분석/개선사항
*구현 완료 후 또는 중간에 발견된 개선점을 기록합니다.*

- 주요 조회 쿼리에 대한 인덱싱 전략 수립 및 적용 (성능 최적화)
- 데이터베이스 백업 및 복구 전략 수립
- DB 접근 권한 세분화 및 보안 강화
- 대용량 데이터 저장 시 파티셔닝(Partitioning) 도입 검토
