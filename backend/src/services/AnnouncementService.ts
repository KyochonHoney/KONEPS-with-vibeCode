import { AnnouncementRepository } from '../repositories/AnnouncementRepository';
import { Announcement } from '../entities/Announcement';

export class AnnouncementService {
  private announcementRepository: AnnouncementRepository;

  constructor() {
    this.announcementRepository = new AnnouncementRepository();
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return this.announcementRepository.findAll();
  }

  async getAnnouncementById(id: number): Promise<Announcement | null> {
    return this.announcementRepository.findById(id);
  }

  async getAnnouncementByBidNumber(bid_number: string): Promise<Announcement | null> {
    return this.announcementRepository.findByBidNumber(bid_number);
  }

  async createAnnouncement(announcementData: {
    bid_number: string;
    title: string;
    description: string;
    contracting_agency: string;
    budget_amount: number;
    announcement_date: Date;
    application_deadline: Date;
    status?: string;
    requirements?: string;
    original_url?: string;
  }): Promise<Announcement> {
    return this.announcementRepository.create(announcementData);
  }

  async updateAnnouncement(
    id: number,
    updateData: Partial<Announcement>
  ): Promise<Announcement | null> {
    return this.announcementRepository.update(id, updateData);
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcementRepository.delete(id);
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return this.announcementRepository.findActiveAnnouncements();
  }

  async getAnnouncementsByStatus(status: string): Promise<Announcement[]> {
    return this.announcementRepository.findByStatus(status);
  }

  async getAnnouncementsByDateRange(startDate: Date, endDate: Date): Promise<Announcement[]> {
    return this.announcementRepository.findByDateRange(startDate, endDate);
  }

  async getAnnouncementsByAgency(agency: string): Promise<Announcement[]> {
    return this.announcementRepository.findByAgency(agency);
  }

  async searchAnnouncements(searchTerm: string): Promise<Announcement[]> {
    return this.announcementRepository.searchByTitle(searchTerm);
  }

  async getAnnouncementsWithPagination(page: number, limit: number): Promise<{
    announcements: Announcement[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    return this.announcementRepository.findWithPagination(page, limit);
  }

  async getUpcomingDeadlines(days: number = 7): Promise<Announcement[]> {
    return this.announcementRepository.findUpcomingDeadlines(days);
  }

  async getAnnouncementStats(): Promise<{
    total: number;
    active: number;
    closed: number;
    upcomingDeadlines: number;
  }> {
    const total = await this.announcementRepository.count();
    const activeAnnouncements = await this.announcementRepository.findByStatus('active');
    const closedAnnouncements = await this.announcementRepository.findByStatus('closed');
    const upcomingDeadlines = await this.announcementRepository.findUpcomingDeadlines(7);

    return {
      total,
      active: activeAnnouncements.length,
      closed: closedAnnouncements.length,
      upcomingDeadlines: upcomingDeadlines.length,
    };
  }
}