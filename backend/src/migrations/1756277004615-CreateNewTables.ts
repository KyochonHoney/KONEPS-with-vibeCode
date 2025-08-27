import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNewTables1756277004615 implements MigrationInterface {
    name = 'CreateNewTables1756277004615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 공고 테이블 생성 (기존에 없는 경우)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`announcements\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`bid_number\` varchar(100) NOT NULL,
                \`title\` varchar(500) NOT NULL,
                \`description\` text NOT NULL,
                \`contracting_agency\` varchar(200) NOT NULL,
                \`budget_amount\` bigint UNSIGNED NOT NULL,
                \`announcement_date\` datetime NOT NULL,
                \`application_deadline\` datetime NOT NULL,
                \`status\` varchar(50) NOT NULL DEFAULT 'active',
                \`requirements\` text NULL,
                \`original_url\` varchar(500) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_bid_number\` (\`bid_number\`),
                INDEX \`idx_announcements_bid_number\` (\`bid_number\`),
                INDEX \`idx_announcements_status\` (\`status\`),
                INDEX \`idx_announcements_deadline\` (\`application_deadline\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 첨부파일 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`announcement_files\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`announcement_id\` int NOT NULL,
                \`original_filename\` varchar(300) NOT NULL,
                \`stored_filename\` varchar(300) NOT NULL,
                \`file_path\` varchar(500) NOT NULL,
                \`file_size\` bigint UNSIGNED NOT NULL,
                \`file_type\` varchar(50) NOT NULL,
                \`file_hash\` varchar(32) NULL,
                \`download_url\` varchar(500) NULL,
                \`is_downloaded\` tinyint NOT NULL DEFAULT '0',
                \`is_analyzed\` tinyint NOT NULL DEFAULT '0',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_files_announcement_id\` (\`announcement_id\`),
                INDEX \`idx_files_file_type\` (\`file_type\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 분석 결과 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`analysis_results\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`announcement_id\` int NOT NULL,
                \`summary\` text NOT NULL,
                \`key_requirements\` json NULL,
                \`technical_specs\` json NULL,
                \`evaluation_criteria\` json NULL,
                \`complexity_score\` decimal(5,2) NULL,
                \`feasibility_score\` decimal(5,2) NULL,
                \`analysis_status\` varchar(50) NOT NULL DEFAULT 'pending',
                \`analysis_notes\` text NULL,
                \`analyzed_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_analysis_announcement_id\` (\`announcement_id\`),
                INDEX \`idx_analysis_status\` (\`analysis_status\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 제안서 초안 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`proposal_drafts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`analysis_result_id\` int NOT NULL,
                \`title\` varchar(500) NOT NULL,
                \`executive_summary\` text NOT NULL,
                \`technical_approach\` json NULL,
                \`project_plan\` json NULL,
                \`team_composition\` json NULL,
                \`budget_breakdown\` json NULL,
                \`risk_management\` json NULL,
                \`additional_notes\` text NULL,
                \`status\` varchar(50) NOT NULL DEFAULT 'draft',
                \`hwp_file_path\` varchar(500) NULL,
                \`generated_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_proposals_analysis_id\` (\`analysis_result_id\`),
                INDEX \`idx_proposals_status\` (\`status\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        console.log('✅ New tables created successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 테이블 제거 (외래키는 CASCADE로 자동 처리)
        await queryRunner.query(`DROP TABLE IF EXISTS \`proposal_drafts\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`analysis_results\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`announcement_files\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`announcements\``);
        
        console.log('✅ New tables dropped successfully');
    }
}
