import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/FileService';

const fileService = new FileService();

// 모든 파일 조회
export const getAllFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (req.query.page || req.query.limit) {
      const result = await fileService.getFilesWithPagination(page, limit);
      res.json(result);
    } else {
      const files = await fileService.getAllFiles();
      res.json(files);
    }
  } catch (error) {
    next(error);
  }
};

// 특정 파일 조회
export const getFileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const file = await fileService.getFileById(id);

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with id ${id} does not exist`
      });
    }

    res.json(file);
  } catch (error) {
    next(error);
  }
};

// 공고별 파일 조회
export const getFilesByAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcementId = parseInt(req.params.announcementId);
    const files = await fileService.getFilesByAnnouncementId(announcementId);
    res.json(files);
  } catch (error) {
    next(error);
  }
};

// 새 파일 생성
export const createFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      announcement_id,
      original_filename,
      stored_filename,
      file_path,
      file_size,
      file_type,
      file_hash,
      download_url
    } = req.body;

    if (!announcement_id || !original_filename || !stored_filename || !file_path || !file_size || !file_type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'announcement_id, original_filename, stored_filename, file_path, file_size, and file_type are required'
      });
    }

    const file = await fileService.createFile({
      announcement_id: parseInt(announcement_id),
      original_filename,
      stored_filename,
      file_path,
      file_size: parseInt(file_size),
      file_type,
      file_hash,
      download_url
    });

    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
};

// 파일 정보 수정
export const updateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    if (updateData.file_size) {
      updateData.file_size = parseInt(updateData.file_size);
    }
    if (updateData.announcement_id) {
      updateData.announcement_id = parseInt(updateData.announcement_id);
    }

    const file = await fileService.updateFile(id, updateData);

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with id ${id} does not exist`
      });
    }

    res.json(file);
  } catch (error) {
    next(error);
  }
};

// 파일 삭제
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await fileService.deleteFile(id);

    if (!success) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with id ${id} does not exist`
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// 파일 타입별 조회
export const getFilesByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileType } = req.params;
    const files = await fileService.getFilesByType(fileType);
    res.json(files);
  } catch (error) {
    next(error);
  }
};

// 다운로드된 파일 조회
export const getDownloadedFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await fileService.getDownloadedFiles();
    res.json(files);
  } catch (error) {
    next(error);
  }
};

// 분석된 파일 조회
export const getAnalyzedFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await fileService.getAnalyzedFiles();
    res.json(files);
  } catch (error) {
    next(error);
  }
};

// 다운로드 대기 파일 조회
export const getPendingDownloads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await fileService.getPendingDownloads();
    res.json(files);
  } catch (error) {
    next(error);
  }
};

// 분석 대기 파일 조회
export const getPendingAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await fileService.getPendingAnalysis();
    res.json(files);
  } catch (error) {
    next(error);
  }
};

// 파일을 다운로드 완료로 표시
export const markFileAsDownloaded = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await fileService.markFileAsDownloaded(id);

    if (!success) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with id ${id} does not exist`
      });
    }

    res.json({ message: 'File marked as downloaded successfully' });
  } catch (error) {
    next(error);
  }
};

// 파일을 분석 완료로 표시
export const markFileAsAnalyzed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await fileService.markFileAsAnalyzed(id);

    if (!success) {
      return res.status(404).json({
        error: 'File not found',
        message: `File with id ${id} does not exist`
      });
    }

    res.json({ message: 'File marked as analyzed successfully' });
  } catch (error) {
    next(error);
  }
};

// 파일 통계
export const getFileStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await fileService.getFileStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// 파일 다운로드 처리
export const processFileDownload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await fileService.processFileDownload(id);

    if (!success) {
      return res.status(400).json({
        error: 'Download failed',
        message: 'File not found or already downloaded'
      });
    }

    res.json({ message: 'File download process initiated successfully' });
  } catch (error) {
    next(error);
  }
};

// 파일 분석 처리
export const processFileAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await fileService.processFileAnalysis(id);

    if (!success) {
      return res.status(400).json({
        error: 'Analysis failed',
        message: 'File not found, not downloaded, or already analyzed'
      });
    }

    res.json({ message: 'File analysis process initiated successfully' });
  } catch (error) {
    next(error);
  }
};