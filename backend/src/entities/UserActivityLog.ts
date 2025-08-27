import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_activity_logs')
@Index('idx_logs_user_id', ['user_id'])
@Index('idx_logs_action', ['action'])
@Index('idx_logs_created_at', ['created_at'])
export class UserActivityLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  user_id?: number; // NULL인 경우 익명 사용자

  @Column({ length: 100 })
  action!: string; // 액션 (login, logout, view_announcement, download_file 등)

  @Column({ length: 500, nullable: true })
  description?: string; // 설명

  @Column({ type: 'json', nullable: true })
  metadata?: object; // 추가 메타데이터 (JSON)

  @Column({ length: 45, nullable: true })
  ip_address?: string; // IP 주소

  @Column({ length: 500, nullable: true })
  user_agent?: string; // 사용자 에이전트

  @Column({ length: 100, nullable: true })
  session_id?: string; // 세션 ID

  @CreateDateColumn()
  created_at!: Date;
}