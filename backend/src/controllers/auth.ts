import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types/auth';

export class AuthController {
  // POST /auth/register - 회원가입
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: RegisterRequest = req.body;

      // 입력값 검증
      if (!email || !password) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required',
          details: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null
          }
        });
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid email format'
        });
        return;
      }

      // 비밀번호 강도 검증
      if (password.length < 8) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 8 characters long'
        });
        return;
      }

      const result = await AuthService.register({ email, password });

      res.status(201).json({
        message: 'User registered successfully',
        user: result
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message === 'Email already exists') {
        res.status(409).json({
          error: 'Conflict',
          message: 'Email already exists'
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Registration failed'
      });
    }
  }

  // POST /auth/login - 로그인
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // 입력값 검증
      if (!email || !password) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required'
        });
        return;
      }

      // 클라이언트 정보 수집
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      const userAgent = req.get('User-Agent') || '';

      const result = await AuthService.login(
        { email, password },
        ipAddress,
        userAgent
      );

      res.json({
        message: 'Login successful',
        ...result
      });

    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessages = [
        'Invalid email or password',
        'Account is temporarily locked. Try again later.',
        'Account is inactive'
      ];

      if (errorMessages.includes(error.message)) {
        res.status(401).json({
          error: 'Authentication Failed',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed'
      });
    }
  }

  // POST /auth/refresh - 토큰 갱신
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Refresh token is required'
        });
        return;
      }

      const result = await AuthService.refreshTokens(refreshToken);

      res.json({
        message: 'Tokens refreshed successfully',
        ...result
      });

    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      if (error.message.includes('Invalid or expired refresh token') || 
          error.message.includes('User account is not active')) {
        res.status(401).json({
          error: 'Authentication Failed',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Token refresh failed'
      });
    }
  }

  // POST /auth/logout - 로그아웃
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Refresh token is required'
        });
        return;
      }

      await AuthService.logout(refreshToken);

      res.json({
        message: 'Logout successful'
      });

    } catch (error: any) {
      console.error('Logout error:', error);
      
      // 로그아웃은 토큰이 유효하지 않아도 성공으로 처리
      res.json({
        message: 'Logout successful'
      });
    }
  }

  // POST /auth/forgot-password - 비밀번호 재설정 요청
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email is required'
        });
        return;
      }

      // TODO: 이메일 전송 기능 구현
      // 실제 구현에서는 이메일로 재설정 링크를 보내야 함
      
      // 보안상 이메일 존재 여부와 관계없이 동일한 응답 반환
      res.json({
        message: 'If the email exists, a password reset link has been sent'
      });

    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Password reset request failed'
      });
    }
  }

  // POST /auth/reset-password - 비밀번호 재설정
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Token and new password are required'
        });
        return;
      }

      // 비밀번호 강도 검증
      if (newPassword.length < 8) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 8 characters long'
        });
        return;
      }

      // TODO: 비밀번호 재설정 토큰 검증 및 비밀번호 업데이트 구현
      
      res.json({
        message: 'Password reset successful'
      });

    } catch (error: any) {
      console.error('Reset password error:', error);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Password reset failed'
      });
    }
  }

  // GET /auth/me - 현재 사용자 정보 조회
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication Required',
          message: 'Please log in to access this resource'
        });
        return;
      }

      res.json({
        user: req.user
      });

    } catch (error: any) {
      console.error('Get current user error:', error);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get user information'
      });
    }
  }
}