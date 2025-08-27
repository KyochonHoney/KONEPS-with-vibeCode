import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm';
import { ProposalDraft } from '../entities/ProposalDraft';

export class ProposalDraftRepository {
  private repository: Repository<ProposalDraft>;

  constructor() {
    this.repository = AppDataSource.getRepository(ProposalDraft);
  }

  async findAll(): Promise<ProposalDraft[]> {
    return this.repository.find({
      relations: ['analysis_result', 'analysis_result.announcement'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<ProposalDraft | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['analysis_result', 'analysis_result.announcement'],
    });
  }

  async findByAnalysisResultId(analysisResultId: number): Promise<ProposalDraft[]> {
    return this.repository.find({
      where: { analysis_result_id: analysisResultId },
      relations: ['analysis_result', 'analysis_result.announcement'],
      order: { created_at: 'DESC' },
    });
  }

  async create(proposalData: Partial<ProposalDraft>): Promise<ProposalDraft> {
    const proposal = this.repository.create(proposalData);
    return this.repository.save(proposal);
  }

  async update(id: number, proposalData: Partial<ProposalDraft>): Promise<ProposalDraft | null> {
    await this.repository.update(id, proposalData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async findByStatus(status: string): Promise<ProposalDraft[]> {
    return this.repository.find({
      where: { status },
      relations: ['analysis_result', 'analysis_result.announcement'],
      order: { created_at: 'DESC' },
    });
  }

  async findDrafts(): Promise<ProposalDraft[]> {
    return this.findByStatus('draft');
  }

  async findApprovedProposals(): Promise<ProposalDraft[]> {
    return this.findByStatus('approved');
  }

  async findReviewProposals(): Promise<ProposalDraft[]> {
    return this.findByStatus('review');
  }

  async findRejectedProposals(): Promise<ProposalDraft[]> {
    return this.findByStatus('rejected');
  }

  async findGeneratedProposals(): Promise<ProposalDraft[]> {
    return this.repository.find({
      where: { 
        status: 'approved',
        // generated_at이 null이 아닌 경우
      },
      relations: ['analysis_result', 'analysis_result.announcement'],
      order: { generated_at: 'DESC' },
    });
  }

  async markAsReview(id: number): Promise<boolean> {
    const result = await this.repository.update(id, {
      status: 'review',
      updated_at: new Date(),
    });
    return result.affected !== null && result.affected > 0;
  }

  async markAsApproved(id: number): Promise<boolean> {
    const result = await this.repository.update(id, {
      status: 'approved',
      updated_at: new Date(),
    });
    return result.affected !== null && result.affected > 0;
  }

  async markAsRejected(id: number, reason?: string): Promise<boolean> {
    const updateData: Partial<ProposalDraft> = {
      status: 'rejected',
      updated_at: new Date(),
    };

    if (reason) {
      updateData.additional_notes = reason;
    }

    const result = await this.repository.update(id, updateData);
    return result.affected !== null && result.affected > 0;
  }

  async markAsGenerated(id: number, hwpFilePath: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      status: 'approved',
      hwp_file_path: hwpFilePath,
      generated_at: new Date(),
      updated_at: new Date(),
    });
    return result.affected !== null && result.affected > 0;
  }

  async findByAnnouncementId(announcementId: number): Promise<ProposalDraft[]> {
    return this.repository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.analysis_result', 'analysis')
      .leftJoinAndSelect('analysis.announcement', 'announcement')
      .where('announcement.id = :announcementId', { announcementId })
      .orderBy('proposal.created_at', 'DESC')
      .getMany();
  }

  async searchByTitle(searchTerm: string): Promise<ProposalDraft[]> {
    return this.repository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.analysis_result', 'analysis')
      .leftJoinAndSelect('analysis.announcement', 'announcement')
      .where('proposal.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('proposal.executive_summary LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('proposal.created_at', 'DESC')
      .getMany();
  }

  async getProposalStats(): Promise<{
    total: number;
    draft: number;
    review: number;
    approved: number;
    rejected: number;
    generated: number;
  }> {
    const total = await this.repository.count();
    const draft = await this.repository.count({ where: { status: 'draft' } });
    const review = await this.repository.count({ where: { status: 'review' } });
    const approved = await this.repository.count({ where: { status: 'approved' } });
    const rejected = await this.repository.count({ where: { status: 'rejected' } });
    
    // 생성된 제안서 (HWP 파일이 있는 경우)
    const generated = await this.repository
      .createQueryBuilder('proposal')
      .where('proposal.generated_at IS NOT NULL')
      .andWhere('proposal.hwp_file_path IS NOT NULL')
      .getCount();

    return {
      total,
      draft,
      review,
      approved,
      rejected,
      generated,
    };
  }

  async findRecentProposals(days: number = 7): Promise<ProposalDraft[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    return this.repository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.analysis_result', 'analysis')
      .leftJoinAndSelect('analysis.announcement', 'announcement')
      .where('proposal.created_at >= :dateLimit', { dateLimit })
      .orderBy('proposal.created_at', 'DESC')
      .getMany();
  }

  async findWithPagination(page: number = 1, limit: number = 10): Promise<{
    proposals: ProposalDraft[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [proposals, total] = await this.repository.findAndCount({
      relations: ['analysis_result', 'analysis_result.announcement'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      proposals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findByStatusWithPagination(
    status: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    proposals: ProposalDraft[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [proposals, total] = await this.repository.findAndCount({
      where: { status },
      relations: ['analysis_result', 'analysis_result.announcement'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      proposals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}