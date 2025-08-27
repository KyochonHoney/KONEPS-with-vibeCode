import 'reflect-metadata';
import { AppDataSource } from '../config/typeorm';
import { Announcement } from '../entities/Announcement';
import { AnnouncementFile } from '../entities/AnnouncementFile';
import { AnalysisResult } from '../entities/AnalysisResult';

async function seedSampleData() {
  try {
    // TypeORM 초기화
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ TypeORM 연결 성공');
    }

    const announcementRepo = AppDataSource.getRepository(Announcement);
    const fileRepo = AppDataSource.getRepository(AnnouncementFile);
    const analysisRepo = AppDataSource.getRepository(AnalysisResult);

    // 1. 샘플 공고 생성
    const sampleAnnouncement = announcementRepo.create({
      bid_number: 'TEST-2025-001',
      title: 'AI 기반 문서 분석 시스템 구축 용역',
      description:
        'TypeORM 마이그레이션 및 API 테스트를 위한 샘플 공고입니다. 실제 나라장터 공고 형식으로 작성되었습니다.',
      contracting_agency: '한국정보화진흥원',
      budget_amount: 500000000, // 5억원
      announcement_date: new Date('2025-08-27T09:00:00Z'),
      application_deadline: new Date('2025-09-15T18:00:00Z'),
      status: 'active',
      requirements: '- SW개발업체 (주업종코드 62010)\n- 동종업무 수행실적 보유\n- 기술인력 보유 증명서 제출',
      original_url: 'https://www.g2b.go.kr/sample',
    });

    const savedAnnouncement = await announcementRepo.save(sampleAnnouncement);
    console.log(`✅ 공고 생성 완료: ${savedAnnouncement.title} (ID: ${savedAnnouncement.id})`);

    // 2. 샘플 첨부파일 정보 생성
    const sampleFile = fileRepo.create({
      announcement_id: savedAnnouncement.id,
      original_filename: '입찰공고서.pdf',
      stored_filename: `announcement_${savedAnnouncement.id}_file_1.pdf`,
      file_path: `/uploads/announcements/${savedAnnouncement.id}/`,
      file_size: 2048000, // 2MB
      file_type: 'pdf',
      file_hash: 'abc123def456',
      download_url: 'https://www.g2b.go.kr/download/sample.pdf',
      is_downloaded: true,
      is_analyzed: false,
    });

    const savedFile = await fileRepo.save(sampleFile);
    console.log(`✅ 첨부파일 정보 생성 완료: ${savedFile.original_filename} (ID: ${savedFile.id})`);

    // 3. 샘플 분석 결과 생성
    const sampleAnalysis = analysisRepo.create({
      announcement_id: savedAnnouncement.id,
      summary:
        '이 공고는 AI 기반 문서 분석 시스템 구축을 위한 용역으로, 기술적 복잡도가 높고 다양한 AI 모델 연동이 필요합니다.',
      key_requirements: {
        technical: ['Python/Node.js 개발 경험', 'AI/ML 모델 활용 경험', '대용량 문서 처리'],
        business: ['정부 용역 수행 경험', '보안 요구사항 준수', '프로젝트 관리 역량'],
        timeline: '6개월 내 완료',
      },
      technical_specs: {
        backend: 'Node.js + TypeScript',
        frontend: 'React + TypeScript',
        database: 'MySQL 8.0',
        ai_models: ['HuggingFace Transformers', 'OpenAI GPT'],
        deployment: 'Docker + Kubernetes',
      },
      evaluation_criteria: {
        기술력: '40%',
        경험: '30%',
        가격: '20%',
        제안내용: '10%',
      },
      complexity_score: 8.5,
      feasibility_score: 7.2,
      analysis_status: 'completed',
      analysis_notes: '높은 기술적 요구사항을 가지고 있으나, 충분한 개발 기간과 예산이 책정되어 수행 가능성이 높음',
      analyzed_at: new Date(),
    });

    const savedAnalysis = await analysisRepo.save(sampleAnalysis);
    console.log(`✅ 분석 결과 생성 완료 (ID: ${savedAnalysis.id})`);

    // 4. 추가 공고들 생성
    const additionalAnnouncements = [
      {
        bid_number: 'TEST-2025-002',
        title: '전자정부 시스템 유지보수 용역',
        description: '기존 전자정부 시스템의 유지보수 및 기능 개선 용역',
        contracting_agency: '행정안전부',
        budget_amount: 200000000,
        announcement_date: new Date('2025-08-26T09:00:00Z'),
        application_deadline: new Date('2025-09-10T18:00:00Z'),
        status: 'active',
      },
      {
        bid_number: 'TEST-2025-003',
        title: '빅데이터 플랫폼 구축 사업',
        description: '공공데이터 통합 분석을 위한 빅데이터 플랫폼 구축',
        contracting_agency: '한국데이터산업진흥원',
        budget_amount: 800000000,
        announcement_date: new Date('2025-08-25T09:00:00Z'),
        application_deadline: new Date('2025-09-20T18:00:00Z'),
        status: 'active',
      },
    ];

    for (const announcementData of additionalAnnouncements) {
      const announcement = announcementRepo.create(announcementData);
      const saved = await announcementRepo.save(announcement);
      console.log(`✅ 추가 공고 생성: ${saved.title} (ID: ${saved.id})`);
    }

    console.log('\n🎉 샘플 데이터 생성 완료!');
    console.log('API 테스트를 위해 http://localhost:8002/api/announcements 를 확인해보세요.');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedSampleData();
}
