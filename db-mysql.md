# DB (MySQL) 설계 및 구축 체크리스트

## ✅ 구현 단계별 To-Do 리스트
- [x] **[Design]** 테이블 스키마 설계
  - `announcements` (공고 정보)
  - `files` (첨부파일 정보)
  - `analysis_results` (분석 결과)
  - `proposal_drafts` (제안서 초안)
  - `users` (사용자 정보)
  - `user_activity_logs` (사용자 활동 로그)
- [x] **[Setup]** MySQL 서버 설치 또는 클라우드 DB 인스턴스 생성
- [x] **[Setup]** 프로젝트용 데이터베이스 및 사용자 계정 생성
- [x] **[Connection]** Backend와 DB 연동 설정 (Connection Pool 포함)  
- [x] **[ORM]** ORM(e.g., Sequelize, TypeORM) 또는 쿼리 빌더(e.g., Knex.js) 설정
- [x] **[Migration]** 스키마 변경 관리를 위한 마이그레이션 시스템 구축
- [ ] **[CRUD]** 각 테이블에 대한 데이터 저장, 조회, 수정, 삭제 로직(Repository/DAO) 구현

---

## 🔄 진행 상태
*진행 상황, 발생한 이슈, 의사결정 사항 등을 자유롭게 기록합니다.*

### 2025-08-27
- ✅ **1단계 완료**: 테이블 스키마 설계
  - 나라장터 공고 분석 시스템에 맞는 테이블 구조 설계
  - 공고 정보, 첨부파일, 분석 결과, 제안서 초안 등 핵심 테이블 포함
  - `db/schema.sql` 파일로 저장
- ✅ **2단계 완료**: MySQL 서버 설치 및 설정
  - MySQL 8.0.35 설치 완료
  - 기존 데이터 디렉토리 확인 (이미 초기화됨)
  - 설정 파일 `my.cnf` 업데이트
- ✅ **3단계 완료**: 프로젝트용 데이터베이스 및 사용자 계정 생성
  - `narajangter` 데이터베이스 사용 (기존 MySQL 5 서버, 포트 3306)
  - 애플리케이션 전용 사용자 `narajangter_app@localhost` 생성
  - 모든 권한 부여 완료
  - 기본 테이블 구조 생성 (announcements, users, roles 등)
- ✅ **4단계 완료**: Backend와 DB 연동 설정 (Connection Pool 포함)
  - MySQL2 라이브러리를 사용한 Connection Pool 설정
  - 환경변수를 통한 DB 연결 설정 관리 (.env 파일)
  - Database 싱글톤 클래스로 쿼리 실행 추상화
  - 트랜잭션, 헬스체크 등 기본 유틸리티 메소드 구현
  - 백엔드 서버(포트 8002)와 DB 연결 테스트 완료
- ✅ **5단계 완료**: ORM 설정 (TypeORM)
  - TypeORM 라이브러리 설치 및 설정 완료
  - 모든 주요 엔티티 생성 (User, Announcement, AnnouncementFile, AnalysisResult, ProposalDraft, UserActivityLog)
  - Repository 패턴으로 데이터 액세스 계층 구현
  - 공고 관리 REST API 완성 (/api/announcements/*)
  - 기존 MySQL2 연결과 TypeORM 병행 사용 설정
- ✅ **6단계 완료**: 마이그레이션 시스템 구축
  - TypeORM CLI 도구 설치 및 설정
  - 마이그레이션 스크립트 (migration:generate, migration:run, migration:revert 등) 구성
  - 새로운 테이블 생성 마이그레이션 (CreateNewTables) 작성 및 실행 완료
  - 샘플 데이터 시더 스크립트 작성 및 실행 완료
  - API 테스트로 전체 데이터 플로우 검증 완료

---

## 💡 추가 분석/개선사항
*구현 완료 후 또는 중간에 발견된 개선점을 기록합니다.*

- 주요 조회 쿼리에 대한 인덱싱 전략 수립 및 적용 (성능 최적화)
- 데이터베이스 백업 및 복구 전략 수립
- DB 접근 권한 세분화 및 보안 강화
- 대용량 데이터 저장 시 파티셔닝(Partitioning) 도입 검토
