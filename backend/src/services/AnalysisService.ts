import { AnalysisResultRepository } from '../repositories/AnalysisResultRepository';
import { AnalysisResult } from '../entities/AnalysisResult';

export class AnalysisService {
  private analysisRepository: AnalysisResultRepository;

  constructor() {
    this.analysisRepository = new AnalysisResultRepository();
  }

  async getAllAnalysisResults(): Promise<AnalysisResult[]> {
    return this.analysisRepository.findAll();
  }

  async getAnalysisResultById(id: number): Promise<AnalysisResult | null> {
    return this.analysisRepository.findById(id);
  }

  async getAnalysisResultsByAnnouncementId(announcementId: number): Promise<AnalysisResult[]> {
    return this.analysisRepository.findByAnnouncementId(announcementId);
  }

  async createAnalysisResult(analysisData: {
    announcement_id: number;
    summary: string;
    key_requirements?: object;
    technical_specs?: object;
    evaluation_criteria?: object;
    complexity_score?: number;
    feasibility_score?: number;
    analysis_status?: string;
    analysis_notes?: string;
  }): Promise<AnalysisResult> {
    const data = {
      ...analysisData,
      analysis_status: analysisData.analysis_status || 'pending',
    };
    return this.analysisRepository.create(data);
  }

  async updateAnalysisResult(id: number, updateData: Partial<AnalysisResult>): Promise<AnalysisResult | null> {
    return this.analysisRepository.update(id, updateData);
  }

  async deleteAnalysisResult(id: number): Promise<boolean> {
    return this.analysisRepository.delete(id);
  }

  async getAnalysisResultsByStatus(status: string): Promise<AnalysisResult[]> {
    return this.analysisRepository.findByStatus(status);
  }

  async getPendingAnalysis(): Promise<AnalysisResult[]> {
    return this.analysisRepository.findPendingAnalysis();
  }

  async getCompletedAnalysis(): Promise<AnalysisResult[]> {
    return this.analysisRepository.findCompletedAnalysis();
  }

  async getAnalysisByComplexityRange(minScore: number, maxScore: number): Promise<AnalysisResult[]> {
    return this.analysisRepository.findByComplexityRange(minScore, maxScore);
  }

  async getAnalysisByFeasibilityRange(minScore: number, maxScore: number): Promise<AnalysisResult[]> {
    return this.analysisRepository.findByFeasibilityRange(minScore, maxScore);
  }

  async markAnalysisAsCompleted(id: number, analysisNotes?: string): Promise<boolean> {
    return this.analysisRepository.markAsCompleted(id, analysisNotes);
  }

  async markAnalysisAsFailed(id: number, errorMessage: string): Promise<boolean> {
    return this.analysisRepository.markAsFailed(id, errorMessage);
  }

  async getAnalysisStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    avg_complexity: number;
    avg_feasibility: number;
  }> {
    return this.analysisRepository.getAnalysisStats();
  }

  async getRecentAnalysis(days: number = 7): Promise<AnalysisResult[]> {
    return this.analysisRepository.findRecentAnalysis(days);
  }

  async getAnalysisWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    analysis_results: AnalysisResult[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    return this.analysisRepository.findWithPagination(page, limit);
  }

  // 분석 처리 로직 (향후 구현)
  async processAnalysis(analysisId: number): Promise<boolean> {
    const analysis = await this.analysisRepository.findById(analysisId);
    if (!analysis || analysis.analysis_status !== 'pending') {
      return false;
    }

    try {
      // 분석 상태를 처리중으로 변경
      await this.analysisRepository.update(analysisId, {
        analysis_status: 'processing',
      });

      // TODO: 실제 AI 분석 로직 구현
      // 1. HuggingFace 모델 호출
      // 2. 공고 문서 및 첨부파일 분석
      // 3. 키워드, 기술요구사항, 복잡도 등 추출

      // 임시 분석 결과 생성
      const mockAnalysisResult = {
        key_requirements: {
          technical: ['웹 개발 경험', 'API 연동 경험'],
          business: ['정부 용역 경험', '프로젝트 관리 경험'],
          timeline: '3-6개월',
        },
        technical_specs: {
          backend: 'Node.js',
          frontend: 'React',
          database: 'MySQL',
        },
        evaluation_criteria: {
          기술력: '40%',
          경험: '30%',
          가격: '30%',
        },
        complexity_score: Math.random() * 10,
        feasibility_score: Math.random() * 10,
        analysis_notes: '자동 분석이 완료되었습니다.',
      };

      // 분석 완료로 업데이트
      await this.analysisRepository.update(analysisId, {
        ...mockAnalysisResult,
        analysis_status: 'completed',
        analyzed_at: new Date(),
      });

      return true;
    } catch (error) {
      // 오류 발생시 실패 상태로 변경
      await this.analysisRepository.markAsFailed(analysisId, `분석 처리 중 오류 발생: ${(error as Error).message}`);
      return false;
    }
  }

  // 고복잡도 분석 필터링
  async getHighComplexityAnalysis(threshold: number = 7.0): Promise<AnalysisResult[]> {
    return this.analysisRepository.findByComplexityRange(threshold, 10.0);
  }

  // 고실현가능성 분석 필터링
  async getHighFeasibilityAnalysis(threshold: number = 7.0): Promise<AnalysisResult[]> {
    return this.analysisRepository.findByFeasibilityRange(threshold, 10.0);
  }

  // 추천 공고 (높은 실현가능성, 낮은 복잡도)
  async getRecommendedAnnouncements(): Promise<AnalysisResult[]> {
    // 실현가능성 7.0 이상, 복잡도 6.0 이하인 분석 결과
    const highFeasibility = await this.analysisRepository.findByFeasibilityRange(7.0, 10.0);

    return highFeasibility.filter(
      analysis => analysis.complexity_score !== null && parseFloat(analysis.complexity_score.toString()) <= 6.0,
    );
  }
}
