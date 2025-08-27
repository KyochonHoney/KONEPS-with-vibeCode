import { Router } from 'express';
import * as fileController from '../controllers/files';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 공개 API (인증 불필요)
router.get('/', fileController.getAllFiles);
router.get('/stats', fileController.getFileStats);
router.get('/downloaded', fileController.getDownloadedFiles);
router.get('/analyzed', fileController.getAnalyzedFiles);
router.get('/pending-downloads', fileController.getPendingDownloads);
router.get('/pending-analysis', fileController.getPendingAnalysis);
router.get('/type/:fileType', fileController.getFilesByType);
router.get('/announcement/:announcementId', fileController.getFilesByAnnouncement);
router.get('/:id', fileController.getFileById);

// 관리자 API (인증 필요)
router.post('/', authenticateToken, fileController.createFile);
router.put('/:id', authenticateToken, fileController.updateFile);
router.delete('/:id', authenticateToken, fileController.deleteFile);
router.patch('/:id/mark-downloaded', authenticateToken, fileController.markFileAsDownloaded);
router.patch('/:id/mark-analyzed', authenticateToken, fileController.markFileAsAnalyzed);

// 처리 API (인증 필요)
router.post('/:id/download', authenticateToken, fileController.processFileDownload);
router.post('/:id/analyze', authenticateToken, fileController.processFileAnalysis);

export default router;
