import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../utils/database';
import { JWTUtil } from '../utils/jwt';
import { 
  User, 
  UserWithRole, 
  AuthResponse, 
  RefreshTokenRecord,
  LoginRequest,
  RegisterRequest 
} from '../types/auth';
import { RowDataPacket } from 'mysql2';

export class AuthService {
  private static readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
  private static readonly MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
  private static readonly LOCKOUT_TIME = parseInt(process.env.LOCKOUT_TIME || '900000'); // 15분

  // 비밀번호 해시 생성
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  // 비밀번호 검증
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // 리프레시 토큰 해시 생성
  static hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // 사용자 등록
  static async register(registerData: RegisterRequest): Promise<{ id: number; email: string }> {
    const { email, password } = registerData;

    // 이메일 중복 확인
    const existingUser = await db.findOne<RowDataPacket>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // 비밀번호 해시
    const passwordHash = await this.hashPassword(password);

    // 사용자 생성 (기본 role_id: 2 = user)
    const result = await db.execute(
      `INSERT INTO users (email, password_hash, role_id, status) 
       VALUES (?, ?, 2, 'active')`,
      [email, passwordHash]
    );

    return {
      id: result.insertId,
      email
    };
  }

  // 로그인
  static async login(
    loginData: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const { email, password } = loginData;

    // 사용자 조회 (역할 정보 포함)
    const user = await db.findOne<UserWithRole & RowDataPacket>(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 계정 잠금 확인
    if (user.status === 'locked' && user.locked_until && new Date() < user.locked_until) {
      throw new Error('Account is temporarily locked. Try again later.');
    }

    // 계정 비활성 확인
    if (user.status === 'inactive') {
      throw new Error('Account is inactive');
    }

    // 비밀번호 확인
    const isPasswordValid = await this.verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      // 로그인 실패 횟수 증가
      await this.handleFailedLogin(user.id);
      throw new Error('Invalid email or password');
    }

    // 로그인 성공 - 실패 횟수 리셋 및 마지막 로그인 시간 업데이트
    await db.execute(
      `UPDATE users 
       SET failed_login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [user.id]
    );

    // JWT 토큰 생성
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role_name
    };

    const accessToken = await JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = await JWTUtil.generateRefreshToken(tokenPayload);

    // 리프레시 토큰 저장
    await this.saveRefreshToken(user.id, refreshToken, ipAddress, userAgent);

    return {
      accessToken,
      refreshToken,
      role: user.role_name,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name
      }
    };
  }

  // 로그인 실패 처리
  private static async handleFailedLogin(userId: number): Promise<void> {
    // 실패 횟수 증가
    await db.execute(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
      [userId]
    );

    // 현재 실패 횟수 조회
    const user = await db.findOne<RowDataPacket>(
      'SELECT failed_login_attempts FROM users WHERE id = ?',
      [userId]
    );

    // 최대 시도 횟수 초과 시 계정 잠금
    if (user && user.failed_login_attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + this.LOCKOUT_TIME);
      await db.execute(
        'UPDATE users SET status = ?, locked_until = ? WHERE id = ?',
        ['locked', lockUntil, userId]
      );
    }
  }

  // 리프레시 토큰 저장
  private static async saveRefreshToken(
    userId: number,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = JWTUtil.getTokenExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    // 기존 활성 토큰 비활성화 (사용자당 하나의 활성 토큰만 유지)
    await db.execute(
      'UPDATE refresh_tokens SET is_active = FALSE WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    // 새 리프레시 토큰 저장
    await db.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, tokenHash, expiresAt, ipAddress, userAgent]
    );
  }

  // 토큰 갱신
  static async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    // 리프레시 토큰 검증
    const payload = await JWTUtil.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashRefreshToken(refreshToken);

    // 데이터베이스에서 토큰 확인
    const tokenRecord = await db.findOne<RefreshTokenRecord & RowDataPacket>(
      `SELECT rt.*, u.email, r.name as role_name
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE rt.token_hash = ? AND rt.is_active = TRUE AND rt.expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (!tokenRecord) {
      throw new Error('Invalid or expired refresh token');
    }

    // 사용자 상태 확인
    const user = await db.findOne<UserWithRole & RowDataPacket>(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [tokenRecord.user_id]
    );

    if (!user || user.status !== 'active') {
      throw new Error('User account is not active');
    }

    // 새 토큰 생성
    const newTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role_name
    };

    const newAccessToken = await JWTUtil.generateAccessToken(newTokenPayload);
    const newRefreshToken = await JWTUtil.generateRefreshToken(newTokenPayload);

    // 기존 토큰 비활성화 및 새 토큰 저장
    await db.execute(
      'UPDATE refresh_tokens SET is_active = FALSE WHERE token_hash = ?',
      [tokenHash]
    );

    await this.saveRefreshToken(
      user.id, 
      newRefreshToken, 
      tokenRecord.ip_address, 
      tokenRecord.user_agent
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      role: user.role_name,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name
      }
    };
  }

  // 로그아웃 (리프레시 토큰 무효화)
  static async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    
    await db.execute(
      'UPDATE refresh_tokens SET is_active = FALSE WHERE token_hash = ?',
      [tokenHash]
    );
  }

  // 만료된 토큰 정리 (스케줄러에서 호출)
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await db.execute(
      'DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP OR is_active = FALSE'
    );
    
    return result.affectedRows || 0;
  }

  // 사용자의 모든 토큰 무효화 (보안 목적)
  static async revokeAllUserTokens(userId: number): Promise<void> {
    await db.execute(
      'UPDATE refresh_tokens SET is_active = FALSE WHERE user_id = ?',
      [userId]
    );
  }
}