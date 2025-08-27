import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';

// JWT 토큰 검증 미들웨어
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        message: 'Authorization header with Bearer token is required',
      });
      return;
    }

    const payload = await JWTUtil.verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    res.status(403).json({
      error: 'Invalid or expired token',
      message: 'The provided token is invalid or has expired',
    });
  }
};

// 슈퍼관리자 권한 확인 미들웨어
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource',
    });
    return;
  }

  if (req.user.role !== 'superadmin') {
    res.status(403).json({
      error: 'Superadmin access required',
      message: 'This resource requires superadmin privileges',
    });
    return;
  }

  next();
};

// 특정 역할 권한 확인 미들웨어 팩토리
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Access denied',
        message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      });
      return;
    }

    next();
  };
};

// 본인 확인 또는 관리자 권한 확인 미들웨어
export const requireSelfOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource',
    });
    return;
  }

  const targetUserId = parseInt(req.params.id);
  const isOwner = req.user.id === targetUserId;
  const isAdmin = req.user.role === 'superadmin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own resources or must have admin privileges',
    });
    return;
  }

  next();
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // 토큰이 없어도 다음으로 진행
      next();
      return;
    }

    try {
      const payload = await JWTUtil.verifyAccessToken(token);
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      // 토큰이 유효하지 않아도 다음으로 진행 (user 정보는 없음)
      console.warn('Optional auth: Invalid token provided');
    }

    next();
  } catch (error) {
    next();
  }
};
