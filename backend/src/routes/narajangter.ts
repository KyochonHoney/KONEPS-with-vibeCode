import { Router } from 'express';
import * as narajangterController from '../controllers/narajangter';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 공개 API (인증 불필요)
router.get('/status', narajangterController.getApiStatus);
router.get('/test-connection', narajangterController.testConnection);
router.get('/notices', narajangterController.getBidNotices);

// 관리자 API (인증 필요)
router.post('/collect', authenticateToken, narajangterController.collectNotices);

export default router;