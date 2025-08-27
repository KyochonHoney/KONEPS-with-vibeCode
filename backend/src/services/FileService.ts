import { AnnouncementFileRepository } from '../repositories/AnnouncementFileRepository';
import { AnnouncementFile } from '../entities/AnnouncementFile';

export class FileService {
  private fileRepository: AnnouncementFileRepository;

  constructor() {
    this.fileRepository = new AnnouncementFileRepository();
  }

  async getAllFiles(): Promise<AnnouncementFile[]> {
    return this.fileRepository.findAll();
  }

  async getFileById(id: number): Promise<AnnouncementFile | null> {
    return this.fileRepository.findById(id);
  }

  async getFilesByAnnouncementId(announcementId: number): Promise<AnnouncementFile[]> {
    return this.fileRepository.findByAnnouncementId(announcementId);
  }

  async createFile(fileData: {
    announcement_id: number;
    original_filename: string;
    stored_filename: string;
    file_path: string;
    file_size: number;
    file_type: string;
    file_hash?: string;
    download_url?: string;
  }): Promise<AnnouncementFile> {
    return this.fileRepository.create(fileData);
  }

  async updateFile(id: number, updateData: Partial<AnnouncementFile>): Promise<AnnouncementFile | null> {
    return this.fileRepository.update(id, updateData);
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.fileRepository.delete(id);
  }

  async getFilesByType(fileType: string): Promise<AnnouncementFile[]> {
    return this.fileRepository.findByFileType(fileType);
  }

  async getDownloadedFiles(): Promise<AnnouncementFile[]> {
    return this.fileRepository.findDownloadedFiles();
  }

  async getAnalyzedFiles(): Promise<AnnouncementFile[]> {
    return this.fileRepository.findAnalyzedFiles();
  }

  async getPendingDownloads(): Promise<AnnouncementFile[]> {
    return this.fileRepository.findPendingDownloads();
  }

  async getPendingAnalysis(): Promise<AnnouncementFile[]> {
    return this.fileRepository.findPendingAnalysis();
  }

  async markFileAsDownloaded(id: number): Promise<boolean> {
    return this.fileRepository.markAsDownloaded(id);
  }

  async markFileAsAnalyzed(id: number): Promise<boolean> {
    return this.fileRepository.markAsAnalyzed(id);
  }

  async getFileByHash(fileHash: string): Promise<AnnouncementFile | null> {
    return this.fileRepository.findByFileHash(fileHash);
  }

  async getFileStats(): Promise<{
    total: number;
    downloaded: number;
    analyzed: number;
    pending_download: number;
    pending_analysis: number;
    total_size: number;
  }> {
    return this.fileRepository.getFileStats();
  }

  async getFilesWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    files: AnnouncementFile[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    return this.fileRepository.findWithPagination(page, limit);
  }

  // 파일 다운로드 처리 (향후 구현)
  async processFileDownload(fileId: number): Promise<boolean> {
    const file = await this.fileRepository.findById(fileId);
    if (!file || file.is_downloaded) {
      return false;
    }

    // TODO: 실제 파일 다운로드 로직 구현
    // 1. file.download_url에서 파일 다운로드
    // 2. file.file_path에 저장
    // 3. 파일 해시 계산 및 검증

    // 임시로 다운로드 완료로 표시
    await this.fileRepository.markAsDownloaded(fileId);
    return true;
  }

  // 파일 분석 처리 (향후 구현)
  async processFileAnalysis(fileId: number): Promise<boolean> {
    const file = await this.fileRepository.findById(fileId);
    if (!file || !file.is_downloaded || file.is_analyzed) {
      return false;
    }

    // TODO: 실제 파일 분석 로직 구현
    // 1. HuggingFace 모델로 파일 분석
    // 2. 분석 결과를 analysis_results 테이블에 저장

    // 임시로 분석 완료로 표시
    await this.fileRepository.markAsAnalyzed(fileId);
    return true;
  }
}
