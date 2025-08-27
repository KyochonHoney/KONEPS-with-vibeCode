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

  // 단일 레코드 조회
  async findOne<T extends RowDataPacket>(
    sql: string,
    params: any[] = []
  ): Promise<T | null> {
    const rows = await this.query<T[]>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // 페이지네이션을 위한 카운트 쿼리
  async count(sql: string, params: any[] = []): Promise<number> {
    const countSql = `SELECT COUNT(*) as count FROM (${sql}) as countQuery`;
    const result = await this.query<RowDataPacket[]>(countSql, params);
    return result[0].count;
  }

  // 헬스체크
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.length > 0;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const db = Database.getInstance();