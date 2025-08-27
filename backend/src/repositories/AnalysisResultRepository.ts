import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm';
import { AnalysisResult } from '../entities/AnalysisResult';

export class AnalysisResultRepository {
  private repository: Repository<AnalysisResult>;

  constructor() {
    this.repository = AppDataSource.getRepository(AnalysisResult);
  }

  async findAll(): Promise<AnalysisResult[]> {
    return this.repository.find({
      relations: ['announcement', 'proposal_drafts'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<AnalysisResult | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['announcement', 'proposal_drafts'],
    });
  }

  async findByAnnouncementId(announcementId: number): Promise<AnalysisResult[]> {
    return this.repository.find({
      where: { announcement_id: announcementId },
      relations: ['announcement', 'proposal_drafts'],
      order: { created_at: 'DESC' },
    });
  }

  async create(analysisData: Partial<AnalysisResult>): Promise<AnalysisResult> {
    const analysis = this.repository.create(analysisData);
    return this.repository.save(analysis);
  }

  async update(id: number, analysisData: Partial<AnalysisResult>): Promise<AnalysisResult | null> {
    await this.repository.update(id, analysisData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async findByStatus(status: string): Promise<AnalysisResult[]> {
    return this.repository.find({
      where: { analysis_status: status },
      relations: ['announcement', 'proposal_drafts'],
      order: { created_at: 'DESC' },
    });
  }

  async findPendingAnalysis(): Promise<AnalysisResult[]> {
    return this.repository.find({
      where: { analysis_status: 'pending' },
      relations: ['announcement'],
      order: { created_at: 'ASC' },
    });
  }

  async findCompletedAnalysis(): Promise<AnalysisResult[]> {
    return this.repository.find({
      where: { analysis_status: 'completed' },
      relations: ['announcement', 'proposal_drafts'],
      order: { analyzed_at: 'DESC' },
    });
  }

  async findByComplexityRange(minScore: number, maxScore: number): Promise<AnalysisResult[]> {
    return this.repository
      .createQueryBuilder('analysis')
      .leftJoinAndSelect('analysis.announcement', 'announcement')
      .leftJoinAndSelect('analysis.proposal_drafts', 'proposal_drafts')
      .where('analysis.complexity_score >= :minScore', { minScore })
      .andWhere('analysis.complexity_score <= :maxScore', { maxScore })
      .orderBy('analysis.complexity_score', 'DESC')
      .getMany();
  }

  async findByFeasibilityRange(minScore: number, maxScore: number): Promise<AnalysisResult[]> {
    return this.repository
      .createQueryBuilder('analysis')
      .leftJoinAndSelect('analysis.announcement', 'announcement')
      .leftJoinAndSelect('analysis.proposal_drafts', 'proposal_drafts')
      .where('analysis.feasibility_score >= :minScore', { minScore })
      .andWhere('analysis.feasibility_score <= :maxScore', { maxScore })
      .orderBy('analysis.feasibility_score', 'DESC')
      .getMany();
  }

  async markAsCompleted(id: number, analysisNotes?: string): Promise<boolean> {
    const updateData: Partial<AnalysisResult> = {
      analysis_status: 'completed',
      analyzed_at: new Date(),
      updated_at: new Date(),
    };

    if (analysisNotes) {
      updateData.analysis_notes = analysisNotes;
    }

    const result = await this.repository.update(id, updateData);
    return result.affected !== null && result.affected > 0;
  }

  async markAsFailed(id: number, errorMessage: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      analysis_status: 'failed',
      analysis_notes: errorMessage,
      updated_at: new Date(),
    });
    return result.affected !== null && result.affected > 0;
  }

  async getAverageComplexityScore(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('analysis')
      .select('AVG(analysis.complexity_score)', 'avgComplexity')
      .where('analysis.complexity_score IS NOT NULL')
      .getRawOne();

    return parseFloat(result?.avgComplexity || '0');
  }

  async getAverageFeasibilityScore(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('analysis')
      .select('AVG(analysis.feasibility_score)', 'avgFeasibility')
      .where('analysis.feasibility_score IS NOT NULL')
      .getRawOne();

    return parseFloat(result?.avgFeasibility || '0');
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
    const total = await this.repository.count();
    const pending = await this.repository.count({ where: { analysis_status: 'pending' } });
    const processing = await this.repository.count({ where: { analysis_status: 'processing' } });
    const completed = await this.repository.count({ where: { analysis_status: 'completed' } });
    const failed = await this.repository.count({ where: { analysis_status: 'failed' } });
    const avg_complexity = await this.getAverageComplexityScore();
    const avg_feasibility = await this.getAverageFeasibilityScore();

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      avg_complexity: Math.round(avg_complexity * 100) / 100,
      avg_feasibility: Math.round(avg_feasibility * 100) / 100,
    };
  }

  async findRecentAnalysis(days: number = 7): Promise<AnalysisResult[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    return this.repository
      .createQueryBuilder('analysis')
      .leftJoinAndSelect('analysis.announcement', 'announcement')
      .leftJoinAndSelect('analysis.proposal_drafts', 'proposal_drafts')
      .where('analysis.analyzed_at >= :dateLimit', { dateLimit })
      .orderBy('analysis.analyzed_at', 'DESC')
      .getMany();
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    analysis_results: AnalysisResult[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [analysis_results, total] = await this.repository.findAndCount({
      relations: ['announcement', 'proposal_drafts'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      analysis_results,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
