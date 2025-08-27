import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm';
import { UserActivityLog } from '../entities/UserActivityLog';

export class UserActivityLogRepository {
  private repository: Repository<UserActivityLog>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserActivityLog);
  }

  async findAll(): Promise<UserActivityLog[]> {
    return this.repository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<UserActivityLog | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: number): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async create(logData: Partial<UserActivityLog>): Promise<UserActivityLog> {
    const log = this.repository.create(logData);
    return this.repository.save(log);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async findByAction(action: string): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { action },
      order: { created_at: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<UserActivityLog[]> {
    return this.repository
      .createQueryBuilder('log')
      .where('log.created_at >= :startDate', { startDate })
      .andWhere('log.created_at <= :endDate', { endDate })
      .orderBy('log.created_at', 'DESC')
      .getMany();
  }

  async findByIpAddress(ipAddress: string): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { ip_address: ipAddress },
      order: { created_at: 'DESC' },
    });
  }

  async findBySessionId(sessionId: string): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' },
    });
  }

  async findRecentLogs(hours: number = 24): Promise<UserActivityLog[]> {
    const timeLimit = new Date();
    timeLimit.setHours(timeLimit.getHours() - hours);

    return this.repository
      .createQueryBuilder('log')
      .where('log.created_at >= :timeLimit', { timeLimit })
      .orderBy('log.created_at', 'DESC')
      .getMany();
  }

  async findLoginLogs(): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { action: 'login' },
      order: { created_at: 'DESC' },
    });
  }

  async findLogoutLogs(): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { action: 'logout' },
      order: { created_at: 'DESC' },
    });
  }

  async findAnnouncementViewLogs(): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { action: 'view_announcement' },
      order: { created_at: 'DESC' },
    });
  }

  async findFileDownloadLogs(): Promise<UserActivityLog[]> {
    return this.repository.find({
      where: { action: 'download_file' },
      order: { created_at: 'DESC' },
    });
  }

  async getActivityStats(): Promise<{
    total_logs: number;
    unique_users: number;
    unique_sessions: number;
    unique_ips: number;
    login_count: number;
    logout_count: number;
    announcement_views: number;
    file_downloads: number;
  }> {
    const total_logs = await this.repository.count();

    const unique_users_result = await this.repository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.user_id)', 'count')
      .where('log.user_id IS NOT NULL')
      .getRawOne();

    const unique_sessions_result = await this.repository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.session_id)', 'count')
      .where('log.session_id IS NOT NULL')
      .getRawOne();

    const unique_ips_result = await this.repository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.ip_address)', 'count')
      .where('log.ip_address IS NOT NULL')
      .getRawOne();

    const login_count = await this.repository.count({ where: { action: 'login' } });
    const logout_count = await this.repository.count({ where: { action: 'logout' } });
    const announcement_views = await this.repository.count({ where: { action: 'view_announcement' } });
    const file_downloads = await this.repository.count({ where: { action: 'download_file' } });

    return {
      total_logs,
      unique_users: parseInt(unique_users_result?.count || '0'),
      unique_sessions: parseInt(unique_sessions_result?.count || '0'),
      unique_ips: parseInt(unique_ips_result?.count || '0'),
      login_count,
      logout_count,
      announcement_views,
      file_downloads,
    };
  }

  async getTopActions(limit: number = 10): Promise<Array<{ action: string; count: number }>> {
    const results = await this.repository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(result => ({
      action: result.action,
      count: parseInt(result.count),
    }));
  }

  async getTopUsers(limit: number = 10): Promise<Array<{ user_id: number; count: number }>> {
    const results = await this.repository
      .createQueryBuilder('log')
      .select('log.user_id', 'user_id')
      .addSelect('COUNT(*)', 'count')
      .where('log.user_id IS NOT NULL')
      .groupBy('log.user_id')
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(result => ({
      user_id: parseInt(result.user_id),
      count: parseInt(result.count),
    }));
  }

  async getActivityByHour(): Promise<Array<{ hour: number; count: number }>> {
    const results = await this.repository
      .createQueryBuilder('log')
      .select('HOUR(log.created_at)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .groupBy('HOUR(log.created_at)')
      .orderBy('HOUR(log.created_at)', 'ASC')
      .getRawMany();

    return results.map(result => ({
      hour: parseInt(result.hour),
      count: parseInt(result.count),
    }));
  }

  async logUserAction(
    userId: number | null,
    action: string,
    description?: string,
    metadata?: object,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
  ): Promise<UserActivityLog> {
    return this.create({
      user_id: userId,
      action,
      description,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
      session_id: sessionId,
    });
  }

  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(UserActivityLog)
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    logs: UserActivityLog[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      logs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
