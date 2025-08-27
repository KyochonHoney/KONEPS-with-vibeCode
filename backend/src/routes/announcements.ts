import { Router } from 'express';
import * as announcementController from '../controllers/announcement';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 공개 API (인증 불필요)
router.get('/', announcementController.getAllAnnouncements);
router.get('/active', announcementController.getActiveAnnouncements);
router.get('/search', announcementController.searchAnnouncements);
router.get('/upcoming', announcementController.getUpcomingDeadlines);
router.get('/stats', announcementController.getAnnouncementStats);
router.get('/status/:status', announcementController.getAnnouncementsByStatus);
router.get('/bid/:bidNumber', announcementController.getAnnouncementByBidNumber);
router.get('/:id', announcementController.getAnnouncementById);

// 관리자 API (인증 필요)
router.post('/', authenticateToken, announcementController.createAnnouncement);
router.put('/:id', authenticateToken, announcementController.updateAnnouncement);
router.delete('/:id', authenticateToken, announcementController.deleteAnnouncement);

export default router;
