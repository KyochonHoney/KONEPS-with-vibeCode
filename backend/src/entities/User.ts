import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index('idx_users_email', ['email'])
@Index('idx_users_username', ['username'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ length: 255 })
  password_hash!: string;

  @Column({ length: 50, default: 'user' })
  role!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_login_at?: Date;

  @Column({ type: 'int', default: 0 })
  login_attempts!: number;

  @Column({ type: 'datetime', nullable: true })
  locked_until?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
