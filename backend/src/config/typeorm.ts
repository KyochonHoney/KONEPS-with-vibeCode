import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'narajangter',
  synchronize: false, // 자동 동기화 비활성화 (기존 테이블과 충돌 방지)
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../entities/**/*.{ts,js}'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  charset: 'utf8mb4',
  extra: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  },
});

// 데이터베이스 초기화
export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ TypeORM DataSource has been initialized');
    }
    return true;
  } catch (error) {
    console.error('❌ Error during DataSource initialization:', error);
    return false;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (AppDataSource.isInitialized) {
    console.log('Closing TypeORM DataSource...');
    await AppDataSource.destroy();
    console.log('TypeORM DataSource closed');
  }
  process.exit(0);
});
