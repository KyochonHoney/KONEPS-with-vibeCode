import { Router } from 'express';
import * as analysisController from '../controllers/analysis';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 공개 API (인증 불필요)
router.get('/', analysisController.getAllAnalysisResults);
router.get('/stats', analysisController.getAnalysisStats);
router.get('/pending', analysisController.getPendingAnalysis);
router.get('/completed', analysisController.getCompletedAnalysis);
router.get('/recent', analysisController.getRecentAnalysis);
router.get('/complexity-range', analysisController.getAnalysisByComplexityRange);
router.get('/feasibility-range', analysisController.getAnalysisByFeasibilityRange);
router.get('/high-complexity', analysisController.getHighComplexityAnalysis);
router.get('/high-feasibility', analysisController.getHighFeasibilityAnalysis);
router.get('/recommended', analysisController.getRecommendedAnnouncements);
router.get('/status/:status', analysisController.getAnalysisResultsByStatus);
router.get('/announcement/:announcementId', analysisController.getAnalysisResultsByAnnouncement);
router.get('/:id', analysisController.getAnalysisResultById);

// 관리자 API (인증 필요)
router.post('/', authenticateToken, analysisController.createAnalysisResult);
router.put('/:id', authenticateToken, analysisController.updateAnalysisResult);
router.delete('/:id', authenticateToken, analysisController.deleteAnalysisResult);
router.patch('/:id/complete', authenticateToken, analysisController.markAnalysisAsCompleted);
router.patch('/:id/fail', authenticateToken, analysisController.markAnalysisAsFailed);

// 처리 API (인증 필요)
router.post('/:id/process', authenticateToken, analysisController.processAnalysis);

export default router;
