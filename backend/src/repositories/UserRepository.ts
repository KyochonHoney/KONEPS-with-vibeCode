import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm';
import { User } from '../entities/User';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async findActiveUsers(): Promise<User[]> {
    return this.repository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.repository.update(id, {
      last_login_at: new Date(),
      login_attempts: 0,
      locked_until: null,
    });
  }

  async incrementLoginAttempts(id: number): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      const attempts = user.login_attempts + 1;
      const lockTime = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await this.repository.update(id, {
        login_attempts: attempts,
        locked_until: lockTime,
      });
    }
  }

  async isAccountLocked(id: number): Promise<boolean> {
    const user = await this.findById(id);
    return user?.locked_until ? new Date() < user.locked_until : false;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
