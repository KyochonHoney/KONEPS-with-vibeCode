import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AnnouncementFile } from './AnnouncementFile';
import { AnalysisResult } from './AnalysisResult';

@Entity('announcements')
@Index('idx_announcements_bid_number', ['bid_number'])
@Index('idx_announcements_status', ['status'])
@Index('idx_announcements_deadline', ['application_deadline'])
export class Announcement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  bid_number!: string; // 공고번호

  @Column({ length: 500 })
  title!: string; // 공고명

  @Column({ type: 'text' })
  description!: string; // 공고내용

  @Column({ length: 200 })
  contracting_agency!: string; // 발주기관

  @Column({ type: 'bigint', unsigned: true })
  budget_amount!: number; // 예산금액

  @Column({ type: 'datetime' })
  announcement_date!: Date; // 공고일시

  @Column({ type: 'datetime' })
  application_deadline!: Date; // 신청마감일시

  @Column({ length: 50, default: 'active' })
  status!: string; // 상태 (active, closed, cancelled)

  @Column({ type: 'text', nullable: true })
  requirements?: string; // 참가자격

  @Column({ length: 500, nullable: true })
  original_url?: string; // 원본 공고 URL

  @OneToMany(() => AnnouncementFile, (file) => file.announcement)
  files!: AnnouncementFile[];

  @OneToMany(() => AnalysisResult, (analysis) => analysis.announcement)
  analysis_results!: AnalysisResult[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}