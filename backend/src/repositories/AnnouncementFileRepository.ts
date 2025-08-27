import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm';
import { AnnouncementFile } from '../entities/AnnouncementFile';

export class AnnouncementFileRepository {
  private repository: Repository<AnnouncementFile>;

  constructor() {
    this.repository = AppDataSource.getRepository(AnnouncementFile);
  }

  async findAll(): Promise<AnnouncementFile[]> {
    return this.repository.find({
      relations: ['announcement'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<AnnouncementFile | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['announcement'],
    });
  }

  async findByAnnouncementId(announcementId: number): Promise<AnnouncementFile[]> {
    return this.repository.find({
      where: { announcement_id: announcementId },
      order: { created_at: 'ASC' },
    });
  }

  async create(fileData: Partial<AnnouncementFile>): Promise<AnnouncementFile> {
    const file = this.repository.create(fileData);
    return this.repository.save(file);
  }

  async update(id: number, fileData: Partial<AnnouncementFile>): Promise<AnnouncementFile | null> {
    await this.repository.update(id, fileData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async findByFileType(fileType: string): Promise<AnnouncementFile[]> {
    return this.repository.find({
      where: { file_type: fileType },
      relations: ['announcement'],
      order: { created_at: 'DESC' },
    });
  }

  async findDownloadedFiles(): Promise<AnnouncementFile[]> {
    return this.repository.find({
      where: { is_downloaded: true },
      relations: ['announcement'],
      order: { created_at: 'DESC' },
    });
  }

  async findAnalyzedFiles(): Promise<AnnouncementFile[]> {
    return this.repository.find({
      where: { is_analyzed: true },
      relations: ['announcement'],
      order: { created_at: 'DESC' },
    });
  }

  async findPendingDownloads(): Promise<AnnouncementFile[]> {
    return this.repository.find({
      where: { is_downloaded: false },
      relations: ['announcement'],
      order: { created_at: 'ASC' },
    });
  }

  async findPendingAnalysis(): Promise<AnnouncementFile[]> {
    return this.repository.find({
      where: {
        is_downloaded: true,
        is_analyzed: false,
      },
      relations: ['announcement'],
      order: { created_at: 'ASC' },
    });
  }

  async markAsDownloaded(id: number): Promise<boolean> {
    const result = await this.repository.update(id, {
      is_downloaded: true,
      updated_at: new Date(),
    });
    return result.affected !== null && result.affected > 0;
  }

  async markAsAnalyzed(id: number): Promise<boolean> {
    const result = await this.repository.update(id, {
      is_analyzed: true,
      updated_at: new Date(),
    });
    return result.affected !== null && result.affected > 0;
  }

  async findByFileHash(fileHash: string): Promise<AnnouncementFile | null> {
    return this.repository.findOne({
      where: { file_hash: fileHash },
      relations: ['announcement'],
    });
  }

  async getTotalFileSize(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('file')
      .select('SUM(file.file_size)', 'totalSize')
      .getRawOne();

    return parseInt(result?.totalSize || '0');
  }

  async getFileStats(): Promise<{
    total: number;
    downloaded: number;
    analyzed: number;
    pending_download: number;
    pending_analysis: number;
    total_size: number;
  }> {
    const total = await this.repository.count();
    const downloaded = await this.repository.count({ where: { is_downloaded: true } });
    const analyzed = await this.repository.count({ where: { is_analyzed: true } });
    const pending_download = await this.repository.count({ where: { is_downloaded: false } });
    const pending_analysis = await this.repository.count({
      where: { is_downloaded: true, is_analyzed: false },
    });
    const total_size = await this.getTotalFileSize();

    return {
      total,
      downloaded,
      analyzed,
      pending_download,
      pending_analysis,
      total_size,
    };
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    files: AnnouncementFile[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [files, total] = await this.repository.findAndCount({
      relations: ['announcement'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      files,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
