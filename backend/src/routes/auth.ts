import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// POST /auth/register - 회원가입
router.post('/register', authController.register.bind(authController));

// POST /auth/login - 로그인
router.post('/login', authController.login.bind(authController));

// POST /auth/refresh - 토큰 갱신
router.post('/refresh', authController.refresh.bind(authController));

// POST /auth/logout - 로그아웃
router.post('/logout', authController.logout.bind(authController));

// POST /auth/forgot-password - 비밀번호 재설정 요청
router.post('/forgot-password', authController.forgotPassword.bind(authController));

// POST /auth/reset-password - 비밀번호 재설정
router.post('/reset-password', authController.resetPassword.bind(authController));

// GET /auth/me - 현재 사용자 정보 조회 (인증 필요)
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

export default router;