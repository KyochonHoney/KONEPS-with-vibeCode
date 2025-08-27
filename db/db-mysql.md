# 데이터베이스 설계 문서: MySQL 8.0 기반

## 1. 프로젝트 개요

나라장터 입찰 공고 시스템을 위한 MySQL 8.0 데이터베이스 설계 문서입니다. 사용자 인증, 권한 관리, 입찰 공고 관리 등의 기능을 지원하는 데이터베이스 스키마를 제공합니다.

### 1.1. 기술 스택

- **데이터베이스**: MySQL 8.0
- **문자 집합**: utf8mb4 (이모지 및 다국어 지원)
- **스토리지 엔진**: InnoDB (트랜잭션 지원)
- **백업 전략**: mysqldump + binlog 기반 Point-in-Time Recovery

### 1.2. 주요 특징

- JWT 기반 인증을 위한 Refresh Token 관리
- Role-Based Access Control (RBAC) 구현
- 입찰 공고 및 첨부파일 메타데이터 관리
- 사용자 즐겨찾기 시스템
- 인덱스 최적화를 통한 검색 성능 향상

## 2. 데이터베이스 스키마 설계

### 2.1. ERD (Entity Relationship Diagram)

```
Users (사용자)
├── id (PK)
├── email (unique)
├── password_hash
├── role_id (FK → roles.id)
├── status
├── created_at
└── updated_at

Roles (역할)
├── id (PK)
├── name (unique)
├── description
├── created_at
└── updated_at

Refresh_Tokens (리프레시 토큰)
├── id (PK)
├── user_id (FK → users.id)
├── token_hash
├── expires_at
├── created_at
└── is_active

Tender_Notices (공고)
├── id (PK)
├── title
├── content
├── organization
├── budget
├── deadline
├── status
├── attachment_count
├── created_at
└── updated_at

Bids (입찰)
├── id (PK)
├── tender_notice_id (FK → tender_notices.id)
├── user_id (FK → users.id)
├── bid_amount
├── proposal_content
├── status
├── created_at
└── updated_at

User_Favorites (사용자 즐겨찾기)
├── id (PK)
├── user_id (FK → users.id)
├── tender_notice_id (FK → tender_notices.id)
├── created_at
└── UNIQUE(user_id, tender_notice_id)

Tender_Attachments (공고 첨부파일)
├── id (PK)
├── tender_notice_id (FK → tender_notices.id)
├── original_filename
├── stored_filename
├── file_path
├── file_size
├── mime_type
├── download_count
├── created_at
└── updated_at
```

### 2.2. 테이블 상세 설계

#### 2.2.1. users (사용자 테이블)
- **목적**: 시스템 사용자 정보 관리
- **주요 필드**: 
  - `password_hash`: bcrypt로 해시된 비밀번호
  - `status`: active, inactive, locked
  - `role_id`: 기본값 2 (user 역할)

#### 2.2.2. roles (역할 테이블)
- **목적**: 권한 기반 접근 제어
- **기본 데이터**: 
  - id=1: superadmin (전체 권한)
  - id=2: user (일반 사용자)

#### 2.2.3. refresh_tokens (리프레시 토큰 테이블)
- **목적**: JWT 리프레시 토큰 관리
- **주요 필드**:
  - `token_hash`: SHA-256으로 해시된 토큰
  - `expires_at`: 토큰 만료 시간
  - `is_active`: 토큰 활성 상태

#### 2.2.4. tender_notices (공고 테이블)
- **목적**: 입찰 공고 정보 관리
- **주요 필드**:
  - `status`: active, closed, cancelled
  - `budget`: 예산 (DECIMAL 타입)
  - `deadline`: 마감일

#### 2.2.5. user_favorites (즐겨찾기 테이블)
- **목적**: 사용자별 공고 즐겨찾기 관리
- **특징**: 복합 UNIQUE 제약조건으로 중복 방지

## 3. 인덱스 설계

### 3.1. 기본 인덱스

```sql
-- 사용자 검색 최적화
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_id ON users(role_id);

-- 리프레시 토큰 검색 최적화
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_is_active ON refresh_tokens(is_active);

-- 공고 검색 최적화
CREATE INDEX idx_tender_notices_status ON tender_notices(status);
CREATE INDEX idx_tender_notices_deadline ON tender_notices(deadline);
CREATE INDEX idx_tender_notices_created_at ON tender_notices(created_at);
CREATE INDEX idx_tender_notices_organization ON tender_notices(organization);

-- 전문 검색을 위한 FULLTEXT 인덱스
CREATE FULLTEXT INDEX idx_tender_notices_title ON tender_notices(title);
CREATE FULLTEXT INDEX idx_tender_notices_content ON tender_notices(content);

-- 즐겨찾기 조회 최적화
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_tender_notice_id ON user_favorites(tender_notice_id);

-- 입찰 조회 최적화
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_tender_notice_id ON bids(tender_notice_id);
CREATE INDEX idx_bids_status ON bids(status);
```

### 3.2. 복합 인덱스

```sql
-- 공고 상태별 마감일 정렬
CREATE INDEX idx_tender_notices_status_deadline ON tender_notices(status, deadline);

-- 사용자별 활성 리프레시 토큰 조회
CREATE INDEX idx_refresh_tokens_user_active ON refresh_tokens(user_id, is_active, expires_at);

-- 공고별 입찰 현황 조회
CREATE INDEX idx_bids_tender_status ON bids(tender_notice_id, status);
```

## 4. 보안 설계

### 4.1. 비밀번호 보안

- **해시 알고리즘**: bcrypt (cost factor: 12)
- **솔트**: bcrypt 내장 솔트 사용
- **정책**: 최소 8자, 대소문자/숫자/특수문자 포함

### 4.2. 토큰 보안

- **Access Token**: JWT, 15분 만료
- **Refresh Token**: 랜덤 UUID, SHA-256 해시 저장, 7일 만료
- **토큰 순환**: 리프레시 시 새로운 Refresh Token 발급

### 4.3. 데이터베이스 보안

```sql
-- 전용 데이터베이스 사용자 생성
CREATE USER 'narajangter_app'@'localhost' IDENTIFIED BY 'secure_password_2024!';

-- 최소 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON narajangter.* TO 'narajangter_app'@'localhost';
GRANT EXECUTE ON narajangter.* TO 'narajangter_app'@'localhost';

-- root 계정 원격 접속 비활성화
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

## 5. 설치 및 설정 가이드

### 5.1. MySQL 8.0 설치 (Ubuntu/CentOS)

```bash
# Ubuntu
sudo apt update
sudo apt install mysql-server-8.0

# CentOS/RHEL
sudo dnf install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Windows
# MySQL Installer 사용 또는 Chocolatey
choco install mysql

# macOS
brew install mysql@8.0
brew services start mysql@8.0
```

### 5.2. 초기 보안 설정

```bash
sudo mysql_secure_installation
```

설정 권장사항:
- Root 비밀번호 설정: Y
- 익명 사용자 제거: Y
- Root 원격 로그인 비활성화: Y
- 테스트 데이터베이스 제거: Y
- 권한 테이블 다시 로드: Y

### 5.3. 데이터베이스 생성 및 스키마 적용

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE narajangter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 스키마 파일 실행
mysql -u root -p narajangter < schema.sql

# 초기 데이터 삽입
mysql -u root -p narajangter < seed.sql
```

## 6. 성능 최적화

### 6.1. MySQL 설정 최적화 (my.cnf)

```ini
[mysqld]
# 기본 설정
default_storage_engine = InnoDB
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci

# 메모리 설정 (8GB RAM 기준)
innodb_buffer_pool_size = 6G
innodb_log_file_size = 512M
innodb_log_buffer_size = 16M

# 연결 설정
max_connections = 200
max_connect_errors = 999999

# 쿼리 캐시 (MySQL 8.0에서 제거됨)
# query_cache_type = 1
# query_cache_size = 128M

# 느린 쿼리 로깅
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2

# 바이너리 로깅
log_bin = mysql-bin
expire_logs_days = 7
```

### 6.2. 성능 모니터링 쿼리

```sql
-- 느린 쿼리 확인
SELECT 
    sql_text,
    exec_count,
    avg_timer_wait/1000000000 as avg_time_seconds,
    sum_timer_wait/1000000000 as total_time_seconds
FROM performance_schema.events_statements_summary_by_digest 
ORDER BY avg_timer_wait DESC 
LIMIT 10;

-- 인덱스 사용률 확인
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'narajangter'
ORDER BY COUNT_FETCH DESC;

-- 테이블 크기 확인
SELECT 
    table_name AS "Table",
    round(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES 
WHERE table_schema = "narajangter"
ORDER BY (data_length + index_length) DESC;
```

## 7. 백업 및 복구 전략

### 7.1. 정기 백업 스크립트

```bash
#!/bin/bash
# backup_narajangter.sh

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/mysql"
DB_NAME="narajangter"
DB_USER="root"

# 전체 백업
mysqldump -u $DB_USER -p --single-transaction --routines --triggers \
  --databases $DB_NAME > $BACKUP_DIR/narajangter_full_$DATE.sql

# 압축
gzip $BACKUP_DIR/narajangter_full_$DATE.sql

# 7일 이상 된 백업 파일 삭제
find $BACKUP_DIR -name "narajangter_full_*.sql.gz" -mtime +7 -delete

echo "Backup completed: narajangter_full_$DATE.sql.gz"
```

### 7.2. Point-in-Time Recovery

```bash
# 바이너리 로그 기반 복구
mysqlbinlog --start-datetime="2024-01-01 10:00:00" \
  --stop-datetime="2024-01-01 11:00:00" \
  /var/log/mysql/mysql-bin.000001 | mysql -u root -p narajangter
```

## 8. 체크리스트

### Step 1: 환경 설정
- [ ] MySQL 8.0 설치
- [ ] 보안 설정 (`mysql_secure_installation`)
- [ ] my.cnf 최적화 설정
- [ ] 방화벽 설정 (포트 3306)

### Step 2: 데이터베이스 생성
- [ ] narajangter 데이터베이스 생성
- [ ] 문자셋 설정 (utf8mb4)
- [ ] 전용 사용자 계정 생성
- [ ] 권한 설정

### Step 3: 스키마 적용
- [ ] schema.sql 실행
- [ ] 인덱스 생성 확인
- [ ] 제약조건 확인
- [ ] 초기 데이터 삽입 (seed.sql)

### Step 4: 테스트 및 검증
- [ ] 연결 테스트
- [ ] CRUD 작업 테스트
- [ ] 인덱스 성능 테스트
- [ ] 백업/복구 테스트

### Step 5: 모니터링 설정
- [ ] 느린 쿼리 로깅 활성화
- [ ] Performance Schema 설정
- [ ] 정기 백업 스크립트 설정
- [ ] 모니터링 대시보드 구성

## 9. 트러블슈팅

### 9.1. 일반적인 문제들

**문제**: 연결 거부 (Connection refused)
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# 서비스 시작
sudo systemctl start mysql

# 포트 확인
sudo netstat -tlnp | grep 3306
```

**문제**: 비밀번호 정책 오류
```sql
-- 비밀번호 정책 확인
SHOW VARIABLES LIKE 'validate_password%';

-- 정책 변경 (개발 환경에서만)
SET GLOBAL validate_password.policy = LOW;
```

**문제**: 문자셋 관련 오류
```sql
-- 현재 문자셋 확인
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 테이블 문자셋 변경
ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 9.2. 성능 문제 해결

**느린 쿼리 최적화**:
1. `EXPLAIN` 명령어로 실행 계획 확인
2. 누락된 인덱스 추가
3. 쿼리 리팩토링
4. 테이블 파티셔닝 고려

**메모리 사용량 최적화**:
1. `innodb_buffer_pool_size` 조정
2. 불필요한 인덱스 제거
3. 테이블 정규화/비정규화 검토

## 10. 추가 기능 백로그

- [ ] 데이터베이스 샤딩 설계
- [ ] 읽기 전용 복제본 구성
- [ ] Redis 캐시 연동
- [ ] 데이터 암호화 (TDE)
- [ ] 감사 로깅 설정
- [ ] 자동 파티셔닝 구현
- [ ] GraphQL 스키마 연동
- [ ] 실시간 알림을 위한 Change Data Capture