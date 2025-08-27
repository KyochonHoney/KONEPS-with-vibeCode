import { Request, Response } from 'express';
import { db } from '../utils/database';
import { RowDataPacket } from 'mysql2';

export class AdminController {
  // GET /admin/users - 사용자 목록 조회
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = Math.min(parseInt(req.query.size as string) || 10, 100); // 최대 100개
      const keyword = req.query.keyword as string || '';
      const sort = req.query.sort as string || 'created_at';
      const order = req.query.order as string || 'desc';

      const offset = (page - 1) * size;

      // 검색 조건 구성
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (keyword) {
        whereClause += ' AND (u.email LIKE ? OR r.name LIKE ?)';
        queryParams.push(`%${keyword}%`, `%${keyword}%`);
      }

      // 정렬 조건 검증
      const allowedSortFields = ['id', 'email', 'status', 'role_name', 'created_at', 'last_login_at'];
      const allowedOrders = ['asc', 'desc'];
      const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
      const sortOrder = allowedOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

      // 사용자 목록 조회
      const usersQuery = `
        SELECT 
          u.id,
          u.email,
          u.status,
          u.last_login_at,
          u.failed_login_attempts,
          u.created_at,
          u.updated_at,
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ${whereClause}
        ORDER BY ${sortField === 'role_name' ? 'r.name' : 'u.' + sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const users = await db.query<RowDataPacket[]>(
        usersQuery,
        [...queryParams, size, offset]
      );

      // 총 개수 조회
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ${whereClause}
      `;

      const countResult = await db.query<RowDataPacket[]>(countQuery, queryParams);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / size);

      res.json({
        items: users,
        pageInfo: {
          page,
          size,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });

    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve users'
      });
    }
  }

  // GET /admin/users/:id - 특정 사용자 조회
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid user ID'
        });
        return;
      }

      const user = await db.findOne<RowDataPacket>(
        `SELECT 
          u.id,
          u.email,
          u.status,
          u.last_login_at,
          u.failed_login_attempts,
          u.locked_until,
          u.created_at,
          u.updated_at,
          r.id as role_id,
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?`,
        [userId]
      );

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      // 사용자 통계 조회
      const stats = await db.findOne<RowDataPacket>(
        `SELECT 
          COUNT(DISTINCT b.id) as total_bids,
          COUNT(DISTINCT uf.id) as total_favorites,
          COUNT(DISTINCT rt.id) as active_sessions
        FROM users u
        LEFT JOIN bids b ON u.id = b.user_id
        LEFT JOIN user_favorites uf ON u.id = uf.user_id
        LEFT JOIN refresh_tokens rt ON u.id = rt.user_id AND rt.is_active = TRUE AND rt.expires_at > CURRENT_TIMESTAMP
        WHERE u.id = ?`,
        [userId]
      );

      res.json({
        user: {
          ...user,
          statistics: stats || {
            total_bids: 0,
            total_favorites: 0,
            active_sessions: 0
          }
        }
      });

    } catch (error: any) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user'
      });
    }
  }

  // PATCH /admin/users/:id - 사용자 정보 수정
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const { role, status } = req.body;

      if (isNaN(userId)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid user ID'
        });
        return;
      }

      // 사용자 존재 확인
      const existingUser = await db.findOne<RowDataPacket>(
        'SELECT id, email FROM users WHERE id = ?',
        [userId]
      );

      if (!existingUser) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      const updates: string[] = [];
      const params: any[] = [];

      // 역할 변경
      if (role) {
        const validRoles = ['user', 'superadmin'];
        if (!validRoles.includes(role)) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid role. Must be one of: user, superadmin'
          });
          return;
        }

        // 역할 ID 조회
        const roleRecord = await db.findOne<RowDataPacket>(
          'SELECT id FROM roles WHERE name = ?',
          [role]
        );

        if (!roleRecord) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'Role not found'
          });
          return;
        }

        updates.push('role_id = ?');
        params.push(roleRecord.id);
      }

      // 상태 변경
      if (status) {
        const validStatuses = ['active', 'inactive', 'locked'];
        if (!validStatuses.includes(status)) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid status. Must be one of: active, inactive, locked'
          });
          return;
        }

        updates.push('status = ?');
        params.push(status);

        // 계정 활성화 시 실패 횟수와 잠금 해제
        if (status === 'active') {
          updates.push('failed_login_attempts = 0');
          updates.push('locked_until = NULL');
        }
      }

      if (updates.length === 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'No valid fields to update'
        });
        return;
      }

      // 업데이트 실행
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(userId);

      await db.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      // 업데이트된 사용자 정보 조회
      const updatedUser = await db.findOne<RowDataPacket>(
        `SELECT 
          u.id,
          u.email,
          u.status,
          u.last_login_at,
          u.failed_login_attempts,
          u.created_at,
          u.updated_at,
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?`,
        [userId]
      );

      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });

    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update user'
      });
    }
  }

  // DELETE /admin/users/:id - 사용자 계정 비활성화
  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid user ID'
        });
        return;
      }

      // 자신의 계정 비활성화 방지
      if (req.user && req.user.id === userId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Cannot deactivate your own account'
        });
        return;
      }

      // 사용자 존재 확인
      const existingUser = await db.findOne<RowDataPacket>(
        'SELECT id, email, status FROM users WHERE id = ?',
        [userId]
      );

      if (!existingUser) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      // 계정 비활성화
      await db.execute(
        'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['inactive', userId]
      );

      // 해당 사용자의 모든 리프레시 토큰 무효화
      await db.execute(
        'UPDATE refresh_tokens SET is_active = FALSE WHERE user_id = ?',
        [userId]
      );

      res.json({
        message: 'User deactivated successfully'
      });

    } catch (error: any) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to deactivate user'
      });
    }
  }

  // GET /admin/statistics - 관리자 통계
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      // 사용자 통계
      const userStats = await db.query<RowDataPacket[]>(
        `SELECT 
          r.name as role,
          u.status,
          COUNT(*) as count
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        GROUP BY r.name, u.status
        ORDER BY r.name, u.status`
      );

      // 공고 통계
      const tenderStats = await db.query<RowDataPacket[]>(
        `SELECT 
          status,
          COUNT(*) as count,
          AVG(budget) as avg_budget
        FROM tender_notices
        GROUP BY status`
      );

      // 입찰 통계
      const bidStats = await db.query<RowDataPacket[]>(
        `SELECT 
          status,
          COUNT(*) as count
        FROM bids
        GROUP BY status`
      );

      // 최근 활동 통계 (최근 30일)
      const recentActivity = await db.query<RowDataPacket[]>(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30`
      );

      res.json({
        statistics: {
          users: userStats,
          tenderNotices: tenderStats,
          bids: bidStats,
          recentActivity
        },
        generatedAt: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve statistics'
      });
    }
  }
}