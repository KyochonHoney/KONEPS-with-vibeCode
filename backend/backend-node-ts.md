# 백엔드 개발 문서: Node.js + Express + TypeScript

## 1. 프로젝트 개요

이 문서는 나라장터 입찰 공고 시스템의 백엔드 개발을 위한 상세 가이드라인을 제공합니다. Node.js와 Express를 기반으로 하며, TypeScript를 사용하여 타입 안전성을 보장합니다.

### 1.1. 아키텍처 개요

- **런타임**: Node.js 18+
- **프레임워크**: Express.js 4.x
- **언어**: TypeScript 5.x
- **데이터베이스**: MySQL 8.0 (mysql2 드라이버)
- **인증**: JWT (Access Token + Refresh Token)
- **환경 설정**: dotenv
- **API 문서화**: Swagger/OpenAPI 3.0
- **테스트**: Jest + Supertest
- **코드 품질**: ESLint + Prettier
- **빌드**: TypeScript Compiler (tsc)

### 1.2. 프로젝트 구조

```
backend/
├── src/
│   ├── controllers/       # 요청 처리 컨트롤러
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── tenders.ts
│   │   └── admin.ts
│   ├── middleware/        # Express 미들웨어
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimiting.ts
│   │   └── errorHandler.ts
│   ├── models/           # 데이터베이스 모델
│   │   ├── User.ts
│   │   ├── TenderNotice.ts
│   │   ├── Bid.ts
│   │   └── RefreshToken.ts
│   ├── routes/           # API 라우트 정의
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── tenders.ts
│   │   └── admin.ts
│   ├── services/         # 비즈니스 로직
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── tenderService.ts
│   │   └── emailService.ts
│   ├── utils/           # 유틸리티 함수
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   ├── validation.ts
│   │   ├── crypto.ts
│   │   └── logger.ts
│   ├── types/           # TypeScript 타입 정의
│   │   ├── express.d.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── tender.ts
│   ├── config/          # 설정 파일
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   └── swagger.ts
│   └── server.ts        # 애플리케이션 진입점
├── tests/              # 테스트 파일
│   ├── integration/    # 통합 테스트
│   ├── unit/          # 단위 테스트
│   └── fixtures/      # 테스트 데이터
├── docs/              # API 문서
├── uploads/           # 파일 업로드 저장소
├── logs/              # 애플리케이션 로그
├── .env.example       # 환경 변수 템플릿
├── .env               # 환경 변수 (gitignore)
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
└── .prettierrc
```

## 2. 환경 설정 및 의존성

### 2.1. 필수 의존성 (dependencies)

```json
{
  "express": "^4.18.0",
  "mysql2": "^3.6.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.3.0",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0",
  "joi": "^17.11.0",
  "multer": "^1.4.5",
  "uuid": "^9.0.0",
  "winston": "^3.11.0",
  "compression": "^1.7.4"
}
```

### 2.2. 개발 의존성 (devDependencies)

```json
{
  "@types/node": "^20.8.0",
  "@types/express": "^4.17.0",
  "@types/bcrypt": "^5.0.0",
  "@types/jsonwebtoken": "^9.0.0",
  "@types/cors": "^2.8.0",
  "@types/multer": "^1.4.0",
  "@types/uuid": "^9.0.0",
  "@types/jest": "^29.5.0",
  "@types/supertest": "^2.0.0",
  "typescript": "^5.2.0",
  "ts-node": "^10.9.0",
  "ts-node-dev": "^2.0.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.0",
  "eslint": "^8.52.0",
  "@typescript-eslint/parser": "^6.9.0",
  "@typescript-eslint/eslint-plugin": "^6.9.0",
  "prettier": "^3.0.0",
  "swagger-jsdoc": "^6.2.0",
  "swagger-ui-express": "^5.0.0"
}
```

### 2.3. package.json 스크립트

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js"
  }
}
```

## 3. 환경 변수 설정

### 3.1. .env.example 파일

```env
# 서버 설정
NODE_ENV=development
PORT=8000
API_BASE_URL=http://localhost:8000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USER=narajangter_app
DB_PASSWORD=your_secure_password
DB_NAME=narajangter
DB_CONNECTION_LIMIT=10

# JWT 설정
JWT_SECRET=your_super_secret_jwt_key_here_min_256_bits
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRES_IN=7d

# 보안 설정
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000

# CORS 설정
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# 파일 업로드 설정
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,hwp

# 이메일 설정 (선택)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# 로깅 설정
LOG_LEVEL=info
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# Redis 설정 (선택 - 세션/캐시용)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 외부 API 설정
NARAJANGTER_API_KEY=your_narajangter_api_key
NARAJANGTER_API_URL=https://www.g2b.go.kr/api
```

## 4. 데이터베이스 연결 및 관리

### 4.1. 데이터베이스 설정 (src/config/database.ts)

```typescript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'narajangter',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

export const pool = mysql.createPool(dbConfig);

// 연결 테스트 함수
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
```

### 4.2. 쿼리 헬퍼 유틸리티 (src/utils/database.ts)

```typescript
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';

export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = pool;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // SELECT 쿼리 실행
  async query<T extends RowDataPacket[]>(
    sql: string,
    params: any[] = []
  ): Promise<T> {
    const [rows] = await this.pool.execute<T>(sql, params);
    return rows;
  }

  // INSERT, UPDATE, DELETE 쿼리 실행
  async execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
    const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
    return result;
  }

  // 트랜잭션 실행
  async transaction<T>(
    callback: (connection: any) => Promise<T>
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export const db = Database.getInstance();
```

## 5. 인증 및 JWT 설정

### 5.1. JWT 유틸리티 (src/utils/jwt.ts)

```typescript
import jwt, { JwtPayload } from 'jsonwebtoken';
import { promisify } from 'util';

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify) as (
  token: string,
  secret: string
) => Promise<JwtPayload>;

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
    return signAsync(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    }) as Promise<string>;
  }

  // Refresh Token 생성
  static async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return signAsync(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    }) as Promise<string>;
  }

  // Access Token 검증
  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    return verifyAsync(token, this.accessSecret) as Promise<TokenPayload>;
  }

  // Refresh Token 검증
  static async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return verifyAsync(token, this.refreshSecret) as Promise<TokenPayload>;
  }

  // 토큰에서 페이로드 추출 (검증 없이)
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }
}
```

### 5.2. 인증 미들웨어 (src/middleware/auth.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

// JWT 토큰 검증 미들웨어
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
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
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// 관리자 권한 확인 미들웨어
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'superadmin') {
    res.status(403).json({ error: 'Superadmin access required' });
    return;
  }

  next();
};

// 특정 역할 권한 확인 미들웨어
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
};
```

## 6. API 라우트 및 컨트롤러 설계

### 6.1. 인증 라우트 (src/routes/auth.ts)

```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiting';

const router = Router();
const authController = new AuthController();

// POST /auth/register - 회원가입
router.post('/register', 
  rateLimiter.register, 
  validateRegistration, 
  authController.register
);

// POST /auth/login - 로그인
router.post('/login', 
  rateLimiter.login, 
  validateLogin, 
  authController.login
);

// POST /auth/refresh - 토큰 갱신
router.post('/refresh', 
  rateLimiter.refresh, 
  authController.refresh
);

// POST /auth/logout - 로그아웃
router.post('/logout', authController.logout);

// POST /auth/forgot-password - 비밀번호 재설정 요청
router.post('/forgot-password', 
  rateLimiter.passwordReset, 
  authController.forgotPassword
);

// POST /auth/reset-password - 비밀번호 재설정
router.post('/reset-password', 
  rateLimiter.passwordReset, 
  authController.resetPassword
);

export default router;
```

### 6.2. 사용자 관리 라우트 (src/routes/admin.ts)

```typescript
import { Router } from 'express';
import { AdminController } from '../controllers/admin';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth';
import { validateUserUpdate } from '../middleware/validation';

const router = Router();
const adminController = new AdminController();

// 모든 관리자 라우트에 인증 및 권한 확인 적용
router.use(authenticateToken, requireSuperAdmin);

// GET /admin/users - 사용자 목록 조회
router.get('/users', adminController.getUsers);

// GET /admin/users/:id - 특정 사용자 조회
router.get('/users/:id', adminController.getUserById);

// PATCH /admin/users/:id - 사용자 정보 수정
router.patch('/users/:id', validateUserUpdate, adminController.updateUser);

// DELETE /admin/users/:id - 사용자 계정 비활성화
router.delete('/users/:id', adminController.deactivateUser);

// GET /admin/statistics - 관리자 통계
router.get('/statistics', adminController.getStatistics);

// GET /admin/logs - 시스템 로그 조회
router.get('/logs', adminController.getLogs);

export default router;
```

## 7. 체크리스트 및 구현 단계

### Step 1: 프로젝트 초기 설정
- [ ] backend 폴더 생성
- [ ] package.json 및 tsconfig.json 설정
- [ ] 필수 의존성 패키지 설치
- [ ] 프로젝트 구조 생성
- [ ] 환경 변수 설정 (.env)

### Step 2: 데이터베이스 연결
- [ ] MySQL 연결 풀 설정
- [ ] 데이터베이스 연결 테스트
- [ ] 쿼리 헬퍼 유틸리티 구현
- [ ] 트랜잭션 처리 로직

### Step 3: 인증 시스템 구현
- [ ] JWT 유틸리티 함수 구현
- [ ] bcrypt 비밀번호 해시 처리
- [ ] 인증 미들웨어 구현
- [ ] 권한 검증 미들웨어 구현

### Step 4: 기본 API 구현
- [ ] 회원가입 API (POST /auth/register)
- [ ] 로그인 API (POST /auth/login)
- [ ] 로그아웃 API (POST /auth/logout)
- [ ] 토큰 갱신 API (POST /auth/refresh)

### Step 5: 관리자 API 구현
- [ ] 사용자 목록 조회 (GET /admin/users)
- [ ] 사용자 정보 수정 (PATCH /admin/users/:id)
- [ ] 사용자 상태 관리 (활성/비활성)
- [ ] 관리자 통계 API

### Step 6: 보안 및 검증
- [ ] 입력값 유효성 검증 (Joi)
- [ ] Rate Limiting 구현
- [ ] CORS 설정
- [ ] 보안 헤더 설정 (Helmet)
- [ ] 에러 핸들링 미들웨어

### Step 7: 테스트 구현
- [ ] Jest 환경 설정
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] API 테스트 (Supertest)

### Step 8: 문서화 및 배포
- [ ] Swagger/OpenAPI 문서 생성
- [ ] README.md 작성
- [ ] Docker 설정 (선택)
- [ ] PM2 설정 (프로덕션)

### Step 9: 모니터링 및 로깅
- [ ] Winston 로거 설정
- [ ] 에러 로깅 시스템
- [ ] 성능 모니터링 도구
- [ ] 헬스체크 엔드포인트 (/healthz)

### Step 10: 추가 기능
- [ ] 파일 업로드 처리
- [ ] 이메일 알림 시스템
- [ ] API 버저닝
- [ ] 캐싱 전략 (Redis)

## 8. 성능 최적화 및 보안

### 8.1. 성능 최적화
- **커넥션 풀링**: MySQL 커넥션 풀 사용
- **쿼리 최적화**: 인덱스 활용 및 N+1 문제 방지
- **압축**: gzip 압축 활성화
- **캐싱**: Redis를 통한 세션 및 데이터 캐싱
- **비동기 처리**: Promise/async-await 패턴 활용

### 8.2. 보안 강화
- **비밀번호 보안**: bcrypt 해시 (cost factor: 12)
- **JWT 보안**: 짧은 Access Token + 긴 Refresh Token
- **Rate Limiting**: 브루트 포스 공격 방지
- **입력값 검증**: SQL Injection 및 XSS 방지
- **HTTPS 강제**: 프로덕션 환경에서 SSL/TLS 사용

## 9. 에러 처리 및 로깅

### 9.1. 중앙화된 에러 처리
- **에러 미들웨어**: 모든 에러를 중앙에서 처리
- **에러 타입별 분류**: 4xx 클라이언트 오류, 5xx 서버 오류
- **로깅**: 모든 에러를 파일 및 외부 서비스로 전송

### 9.2. 로깅 전략
- **로그 레벨**: error, warn, info, debug
- **로그 순환**: 파일 크기 및 날짜 기반 로그 순환
- **구조화된 로깅**: JSON 형태의 로그 출력

## 10. 배포 및 운영

### 10.1. 프로덕션 배포
- **프로세스 관리**: PM2를 통한 클러스터 모드
- **로드밸런싱**: Nginx 리버스 프록시
- **SSL 설정**: Let's Encrypt 인증서
- **환경 분리**: development, staging, production

### 10.2. 모니터링
- **헬스체크**: /healthz 엔드포인트
- **메트릭 수집**: 응답 시간, 에러율, 처리량
- **알림 설정**: 장애 시 즉시 알림
- **로그 분석**: ELK Stack 또는 유사한 도구 활용

이 문서를 기반으로 단계별로 백엔드 시스템을 구축하면 안정적이고 확장 가능한 API 서버를 만들 수 있습니다.