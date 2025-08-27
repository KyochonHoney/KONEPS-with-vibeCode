-- 나라장터 공고 분석 시스템 MySQL 8.0 스키마 (테이블 생성만)
-- 문자셋: utf8mb4 (이모지 및 다국어 지원)
-- 스토리지 엔진: InnoDB (트랜잭션 지원)

USE narajangter;

-- 기존 테이블 삭제 (개발 환경에서만 사용, 운영에서는 주석 처리)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS analysis_results;
DROP TABLE IF EXISTS proposal_drafts;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS user_activity_logs;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS user_favorites;
SET FOREIGN_KEY_CHECKS = 1;

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

SELECT 'New database tables created successfully!' as message;