-- 나라장터 공고 분석 시스템 MySQL 8.0 스키마
-- 문자셋: utf8mb4 (이모지 및 다국어 지원)
-- 스토리지 엔진: InnoDB (트랜잭션 지원)

-- 데이터베이스 생성 (이미 존재할 경우 무시)
CREATE DATABASE IF NOT EXISTS narajangter 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE narajangter;

-- 기존 테이블 삭제 (개발 환경에서만 사용, 운영에서는 주석 처리)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS analysis_results;
DROP TABLE IF EXISTS proposal_drafts;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS user_activity_logs;
DROP TABLE IF EXISTS tender_attachments;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS tender_notices;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. 역할(roles) 테이블
-- =====================================================
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '역할명 (user, superadmin)',
    description TEXT COMMENT '역할 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='사용자 역할 테이블';

-- =====================================================
-- 2. 사용자(users) 테이블  
-- =====================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일 (로그인 ID)',
    password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 해시된 비밀번호',
    role_id INT UNSIGNED NOT NULL DEFAULT 2 COMMENT '역할 ID (기본값: user)',
    status ENUM('active', 'inactive', 'locked') DEFAULT 'active' COMMENT '계정 상태',
    last_login_at TIMESTAMP NULL COMMENT '마지막 로그인 시간',
    failed_login_attempts INT UNSIGNED DEFAULT 0 COMMENT '로그인 실패 횟수',
    locked_until TIMESTAMP NULL COMMENT '계정 잠금 해제 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE,
    INDEX idx_users_email (email),
    INDEX idx_users_status (status),
    INDEX idx_users_role_id (role_id)
) ENGINE=InnoDB COMMENT='사용자 테이블';

-- =====================================================
-- 3. 리프레시 토큰(refresh_tokens) 테이블
-- =====================================================
CREATE TABLE refresh_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL COMMENT '사용자 ID',
    token_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 해시된 리프레시 토큰',
    expires_at TIMESTAMP NOT NULL COMMENT '토큰 만료 시간',
    is_active BOOLEAN DEFAULT TRUE COMMENT '토큰 활성 상태',
    ip_address VARCHAR(45) COMMENT '토큰 생성 시 IP 주소',
    user_agent TEXT COMMENT '토큰 생성 시 User-Agent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_token_hash (token_hash),
    INDEX idx_refresh_tokens_expires_at (expires_at),
    INDEX idx_refresh_tokens_is_active (is_active),
    INDEX idx_refresh_tokens_user_active (user_id, is_active, expires_at)
) ENGINE=InnoDB COMMENT='리프레시 토큰 테이블';

-- =====================================================
-- 4. 공고(announcements) 테이블
-- =====================================================
CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_no VARCHAR(100) NOT NULL UNIQUE COMMENT '공고번호',
    title VARCHAR(500) NOT NULL COMMENT '공고명',
    organization VARCHAR(200) NOT NULL COMMENT '발주기관',
    department VARCHAR(200) COMMENT '담당부서',
    manager_name VARCHAR(100) COMMENT '담당자명',
    manager_contact VARCHAR(100) COMMENT '담당자 연락처',
    budget DECIMAL(15,2) COMMENT '예산금액',
    announcement_date DATETIME NOT NULL COMMENT '공고일시',
    submission_deadline DATETIME NOT NULL COMMENT '제출마감일시',
    opening_date DATETIME COMMENT '개찰일시',
    business_category VARCHAR(100) COMMENT '사업분야',
    business_type VARCHAR(50) COMMENT '사업유형',
    contract_method VARCHAR(50) COMMENT '계약방법',
    qualification VARCHAR(500) COMMENT '참가자격',
    content TEXT COMMENT '공고내용',
    special_conditions TEXT COMMENT '특별조건',
    evaluation_criteria TEXT COMMENT '평가기준',
    url VARCHAR(500) COMMENT '원본 URL',
    status ENUM('ACTIVE', 'CLOSED', 'CANCELLED') DEFAULT 'ACTIVE' COMMENT '공고상태',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_announcement_no (announcement_no),
    INDEX idx_organization (organization),
    INDEX idx_announcement_date (announcement_date),
    INDEX idx_submission_deadline (submission_deadline),
    INDEX idx_business_category (business_category),
    INDEX idx_status (status)
) COMMENT='공고 정보';

-- =====================================================
-- 5. 첨부파일 정보(files) 테이블
-- =====================================================
CREATE TABLE files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL COMMENT '공고 ID',
    file_name VARCHAR(255) NOT NULL COMMENT '파일명',
    original_name VARCHAR(255) NOT NULL COMMENT '원본파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일저장경로',
    file_size BIGINT NOT NULL COMMENT '파일크기(bytes)',
    file_type VARCHAR(50) NOT NULL COMMENT '파일타입',
    mime_type VARCHAR(100) COMMENT 'MIME 타입',
    download_url VARCHAR(500) COMMENT '다운로드 URL',
    is_processed BOOLEAN DEFAULT FALSE COMMENT '처리여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    INDEX idx_announcement_id (announcement_id),
    INDEX idx_file_type (file_type),
    INDEX idx_is_processed (is_processed)
) COMMENT='첨부파일 정보';

-- =====================================================
-- 6. 분석 결과(analysis_results) 테이블
-- =====================================================
CREATE TABLE analysis_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL COMMENT '공고 ID',
    analysis_type ENUM('KEYWORD', 'REQUIREMENT', 'BUDGET', 'TIMELINE', 'COMPETITOR') NOT NULL COMMENT '분석타입',
    result_data JSON NOT NULL COMMENT '분석결과 데이터',
    confidence_score DECIMAL(3,2) COMMENT '신뢰도 점수 (0.00-1.00)',
    key_insights TEXT COMMENT '주요 인사이트',
    recommendations TEXT COMMENT '추천사항',
    analysis_model VARCHAR(100) COMMENT '사용된 분석모델',
    processing_time_ms INT COMMENT '처리시간(밀리초)',
    status ENUM('PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PROCESSING' COMMENT '분석상태',
    error_message TEXT COMMENT '오류메시지',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    INDEX idx_announcement_id (announcement_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_status (status),
    INDEX idx_confidence_score (confidence_score)
) COMMENT='분석 결과';

-- =====================================================
-- 7. 제안서 초안(proposal_drafts) 테이블
-- =====================================================
CREATE TABLE proposal_drafts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL COMMENT '공고 ID',
    title VARCHAR(500) NOT NULL COMMENT '제안서 제목',
    content LONGTEXT NOT NULL COMMENT '제안서 내용',
    sections JSON COMMENT '섹션별 내용 구조',
    template_id VARCHAR(100) COMMENT '사용된 템플릿 ID',
    completion_rate DECIMAL(3,2) DEFAULT 0.00 COMMENT '완성도 (%)',
    word_count INT DEFAULT 0 COMMENT '단어수',
    estimated_budget DECIMAL(15,2) COMMENT '예상견적',
    technical_approach TEXT COMMENT '기술적 접근방법',
    timeline JSON COMMENT '일정계획',
    team_composition JSON COMMENT '팀구성',
    risk_analysis TEXT COMMENT '위험분석',
    quality_assurance TEXT COMMENT '품질보증방안',
    version INT DEFAULT 1 COMMENT '버전',
    is_final BOOLEAN DEFAULT FALSE COMMENT '최종버전 여부',
    status ENUM('DRAFT', 'REVIEW', 'APPROVED', 'SUBMITTED') DEFAULT 'DRAFT' COMMENT '제안서 상태',
    created_by VARCHAR(100) COMMENT '작성자',
    reviewed_by VARCHAR(100) COMMENT '검토자',
    approved_by VARCHAR(100) COMMENT '승인자',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    INDEX idx_announcement_id (announcement_id),
    INDEX idx_status (status),
    INDEX idx_completion_rate (completion_rate),
    INDEX idx_is_final (is_final),
    INDEX idx_created_by (created_by)
) COMMENT='제안서 초안';

-- =====================================================
-- 8. 사용자 활동 로그(user_activity_logs) 테이블
-- =====================================================
CREATE TABLE user_activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL COMMENT '사용자 ID',
    action VARCHAR(100) NOT NULL COMMENT '수행한 액션',
    resource_type VARCHAR(50) COMMENT '리소스 타입',
    resource_id BIGINT COMMENT '리소스 ID',
    ip_address VARCHAR(45) COMMENT 'IP 주소',
    user_agent TEXT COMMENT '사용자 에이전트',
    details JSON COMMENT '상세정보',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) COMMENT='사용자 활동 로그';

-- =====================================================
-- 9. 사용자 즐겨찾기(user_favorites) 테이블
-- =====================================================
CREATE TABLE user_favorites (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL COMMENT '사용자 ID',
    announcement_id BIGINT NOT NULL COMMENT '공고 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (user_id, announcement_id) COMMENT '사용자당 공고별 중복 즐겨찾기 방지',
    INDEX idx_user_favorites_user_id (user_id),
    INDEX idx_user_favorites_announcement_id (announcement_id)
) ENGINE=InnoDB COMMENT='사용자 즐겨찾기 테이블';

-- =====================================================
-- 10. 입찰(bids) 테이블
-- =====================================================
CREATE TABLE bids (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL COMMENT '공고 ID',
    user_id INT UNSIGNED NOT NULL COMMENT '입찰자 ID',
    bid_amount DECIMAL(15,2) NOT NULL COMMENT '입찰 금액',
    proposal_content LONGTEXT COMMENT '제안서 내용',
    status ENUM('submitted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'submitted' COMMENT '입찰 상태',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '입찰 제출 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bids_user_id (user_id),
    INDEX idx_bids_announcement_id (announcement_id),
    INDEX idx_bids_status (status),
    INDEX idx_bids_submitted_at (submitted_at),
    INDEX idx_bids_announcement_status (announcement_id, status),
    UNIQUE KEY unique_user_announcement (user_id, announcement_id) COMMENT '사용자당 공고별 하나의 입찰만 허용'
) ENGINE=InnoDB COMMENT='입찰 테이블';

-- =====================================================
-- 11. 초기 데이터 삽입
-- =====================================================

-- 역할 데이터 삽입
INSERT INTO roles (id, name, description) VALUES
(1, 'superadmin', '시스템 관리자 - 모든 권한'),
(2, 'user', '일반 사용자 - 입찰 참여 및 조회');

-- 관리자 계정 생성 (비밀번호: admin123!, bcrypt hash)
-- bcrypt.hashSync('admin123!', 12)
INSERT INTO users (email, password_hash, role_id, status) VALUES
('admin@narajangter.co.kr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBMY9F/TZX7O.u', 1, 'active');

-- 테스트용 일반 사용자 계정 (비밀번호: user123!)
INSERT INTO users (email, password_hash, role_id, status) VALUES
('user@test.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'active');

-- 샘플 공고 데이터
INSERT INTO announcements (
    announcement_no,
    title, 
    content, 
    organization, 
    budget, 
    announcement_date,
    submission_deadline, 
    status,
    business_category,
    business_type,
    contract_method
) VALUES
(
    '2024-PROCUREMENT-001',
    '나라장터 공고 분석 시스템 개발',
    '나라장터 공고의 자동 분석 및 제안서 초안 작성을 지원하는 시스템 개발 공고입니다.\n\n주요 업무:\n- 공고 데이터 수집 및 분석\n- AI 기반 키워드 추출\n- 자동 제안서 초안 생성\n- 웹 기반 사용자 인터페이스',
    '조달청',
    500000000.00,
    CURRENT_TIMESTAMP,
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY),
    'ACTIVE',
    'IT서비스',
    ' 시스템개발',
    '일반경쟁입찰'
),
(
    '2024-MOIS-002',
    'AI 기반 문서 분류 시스템 구축',
    '공공기관의 업무 효율성 향상을 위한 AI 문서 분류 시스템 구축 프로젝트입니다.',
    '행정안전부',
    1200000000.00,
    CURRENT_TIMESTAMP,
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 45 DAY),
    'ACTIVE',
    'AI/빅데이터',
    '시스템구축',
    '일반경쟁입찰'
),
(
    '2024-MSIT-003',
    '클라우드 기반 데이터 분석 플랫폼 개발',
    '대용량 데이터 처리 및 분석을 위한 클라우드 기반 플랫폼 개발 프로젝트입니다.',
    '과학기술정보통신부',
    800000000.00,
    CURRENT_TIMESTAMP,
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 60 DAY),
    'ACTIVE',
    'IT인프라',
    '플랫폼개발',
    '일반경쟁입찰'
);

-- =====================================================
-- 9. 트리거 생성 (첨부파일 개수 자동 업데이트)
-- =====================================================

DELIMITER //

-- 첨부파일 추가 시 공고의 attachment_count 증가
CREATE TRIGGER tr_tender_attachments_insert
    AFTER INSERT ON tender_attachments
    FOR EACH ROW
BEGIN
    UPDATE tender_notices 
    SET attachment_count = attachment_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.tender_notice_id;
END//

-- 첨부파일 삭제 시 공고의 attachment_count 감소
CREATE TRIGGER tr_tender_attachments_delete
    AFTER DELETE ON tender_attachments
    FOR EACH ROW
BEGIN
    UPDATE tender_notices 
    SET attachment_count = GREATEST(attachment_count - 1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.tender_notice_id;
END//

-- 공고 조회 시 view_count 증가를 위한 프로시저
CREATE PROCEDURE sp_increment_view_count(IN notice_id INT UNSIGNED)
BEGIN
    UPDATE tender_notices 
    SET view_count = view_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = notice_id;
END//

-- 만료된 리프레시 토큰 정리 프로시저
CREATE PROCEDURE sp_cleanup_expired_tokens()
BEGIN
    DELETE FROM refresh_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP OR is_active = FALSE;
    
    SELECT ROW_COUNT() as deleted_tokens;
END//

-- 사용자 통계 조회 프로시저
CREATE PROCEDURE sp_get_user_statistics(IN target_user_id INT UNSIGNED)
BEGIN
    SELECT 
        u.email,
        u.status,
        r.name as role_name,
        u.created_at as joined_at,
        u.last_login_at,
        COUNT(DISTINCT b.id) as total_bids,
        COUNT(DISTINCT uf.id) as total_favorites,
        COUNT(DISTINCT CASE WHEN b.status = 'accepted' THEN b.id END) as accepted_bids
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN bids b ON u.id = b.user_id
    LEFT JOIN user_favorites uf ON u.id = uf.user_id
    WHERE u.id = target_user_id
    GROUP BY u.id, u.email, u.status, r.name, u.created_at, u.last_login_at;
END//

DELIMITER ;

-- =====================================================
-- 10. 성능 최적화를 위한 추가 설정
-- =====================================================

-- 자주 사용되는 뷰 생성
CREATE VIEW v_active_tender_notices AS
SELECT 
    tn.*,
    COUNT(DISTINCT b.id) as bid_count,
    COUNT(DISTINCT uf.id) as favorite_count
FROM tender_notices tn
LEFT JOIN bids b ON tn.id = b.tender_notice_id
LEFT JOIN user_favorites uf ON tn.id = uf.tender_notice_id
WHERE tn.status = 'active' AND tn.deadline > CURRENT_TIMESTAMP
GROUP BY tn.id;

-- 사용자별 즐겨찾기 공고 뷰
CREATE VIEW v_user_favorites AS
SELECT 
    uf.user_id,
    uf.tender_notice_id,
    tn.title,
    tn.organization,
    tn.budget,
    tn.deadline,
    tn.status,
    uf.created_at as favorited_at
FROM user_favorites uf
JOIN tender_notices tn ON uf.tender_notice_id = tn.id
WHERE tn.status = 'active';

-- =====================================================
-- 11. 권한 설정 (선택사항 - 전용 사용자 계정 사용 시)
-- =====================================================

-- 전용 애플리케이션 사용자 생성 (실제 운영에서 사용)
-- CREATE USER 'narajangter_app'@'localhost' IDENTIFIED BY 'your_secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON narajangter.* TO 'narajangter_app'@'localhost';
-- GRANT EXECUTE ON narajangter.* TO 'narajangter_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- 스키마 생성 완료
-- =====================================================

SELECT 'Database schema created successfully!' as message;

-- 테이블 생성 확인
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'narajangter' 
ORDER BY TABLE_NAME;