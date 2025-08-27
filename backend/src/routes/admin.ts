import { Router } from 'express';
import { AdminController } from '../controllers/admin';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// 모든 관리자 라우트에 인증 및 권한 확인 적용
router.use(authenticateToken, requireSuperAdmin);

// GET /admin/users - 사용자 목록 조회
router.get('/users', adminController.getUsers.bind(adminController));

// GET /admin/users/:id - 특정 사용자 조회
router.get('/users/:id', adminController.getUserById.bind(adminController));

// PATCH /admin/users/:id - 사용자 정보 수정
router.patch('/users/:id', adminController.updateUser.bind(adminController));

// DELETE /admin/users/:id - 사용자 계정 비활성화
router.delete('/users/:id', adminController.deactivateUser.bind(adminController));

// GET /admin/statistics - 관리자 통계
router.get('/statistics', adminController.getStatistics.bind(adminController));

export default router;
