import jwt, { JwtPayload } from 'jsonwebtoken';
import { promisify } from 'util';

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify) as (token: string, secret: string) => Promise<JwtPayload>;

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JWTUtil {
  private static accessSecret = process.env.JWT_SECRET!;
  private static refreshSecret = process.env.JWT_REFRESH_SECRET!;
  private static accessExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
  private static refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  // Access Token 생성
  static async generateAccessToken(payload: TokenPayload): Promise<string> {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    return signAsync(tokenPayload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    }) as Promise<string>;
  }

  // Refresh Token 생성
  static async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    return signAsync(tokenPayload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    }) as Promise<string>;
  }

  // Access Token 검증
  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await verifyAsync(token, this.accessSecret);
      return payload as TokenPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Refresh Token 검증
  static async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await verifyAsync(token, this.refreshSecret);
      return payload as TokenPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // 토큰에서 페이로드 추출 (검증 없이)
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  // 토큰 만료 시간 계산
  static getTokenExpiration(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error('Invalid expires in format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error('Invalid time unit');
    }
  }
}
