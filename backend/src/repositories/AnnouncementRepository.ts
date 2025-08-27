import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm';
import { Announcement } from '../entities/Announcement';

export class AnnouncementRepository {
  private repository: Repository<Announcement>;

  constructor() {
    this.repository = AppDataSource.getRepository(Announcement);
  }

  async findAll(): Promise<Announcement[]> {
    return this.repository.find({
      relations: ['files', 'analysis_results'],
      order: { announcement_date: 'DESC' },
    });
  }

  async findById(id: number): Promise<Announcement | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['files', 'analysis_results', 'analysis_results.proposal_drafts'],
    });
  }

  async findByBidNumber(bid_number: string): Promise<Announcement | null> {
    return this.repository.findOne({
      where: { bid_number },
      relations: ['files', 'analysis_results'],
    });
  }

  async create(announcementData: Partial<Announcement>): Promise<Announcement> {
    const announcement = this.repository.create(announcementData);
    return this.repository.save(announcement);
  }

  async update(id: number, announcementData: Partial<Announcement>): Promise<Announcement | null> {
    await this.repository.update(id, announcementData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async findActiveAnnouncements(): Promise<Announcement[]> {
    return this.repository.find({
      where: { status: 'active' },
      relations: ['files'],
      order: { announcement_date: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Announcement[]> {
    return this.repository.find({
      where: { status },
      relations: ['files', 'analysis_results'],
      order: { announcement_date: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Announcement[]> {
    return this.repository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.files', 'files')
      .leftJoinAndSelect('announcement.analysis_results', 'analysis_results')
      .where('announcement.announcement_date >= :startDate', { startDate })
      .andWhere('announcement.announcement_date <= :endDate', { endDate })
      .orderBy('announcement.announcement_date', 'DESC')
      .getMany();
  }

  async findByAgency(contracting_agency: string): Promise<Announcement[]> {
    return this.repository.find({
      where: { contracting_agency },
      relations: ['files', 'analysis_results'],
      order: { announcement_date: 'DESC' },
    });
  }

  async findWithBudgetRange(minBudget: number, maxBudget: number): Promise<Announcement[]> {
    return this.repository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.files', 'files')
      .where('announcement.budget_amount >= :minBudget', { minBudget })
      .andWhere('announcement.budget_amount <= :maxBudget', { maxBudget })
      .orderBy('announcement.budget_amount', 'DESC')
      .getMany();
  }

  async searchByTitle(searchTerm: string): Promise<Announcement[]> {
    return this.repository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.files', 'files')
      .where('announcement.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('announcement.description LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('announcement.announcement_date', 'DESC')
      .getMany();
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    announcements: Announcement[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [announcements, total] = await this.repository.findAndCount({
      relations: ['files', 'analysis_results'],
      skip,
      take: limit,
      order: { announcement_date: 'DESC' },
    });

    return {
      announcements,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findUpcomingDeadlines(days: number = 7): Promise<Announcement[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.repository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.files', 'files')
      .where('announcement.application_deadline >= :now', { now: new Date() })
      .andWhere('announcement.application_deadline <= :futureDate', { futureDate })
      .andWhere('announcement.status = :status', { status: 'active' })
      .orderBy('announcement.application_deadline', 'ASC')
      .getMany();
  }
}
