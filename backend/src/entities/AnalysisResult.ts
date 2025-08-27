import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Announcement } from './Announcement';
import { ProposalDraft } from './ProposalDraft';

@Entity('analysis_results')
@Index('idx_analysis_announcement_id', ['announcement_id'])
@Index('idx_analysis_status', ['analysis_status'])
export class AnalysisResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  announcement_id!: number;

  @Column({ type: 'text' })
  summary!: string; // 분석 요약

  @Column({ type: 'json', nullable: true })
  key_requirements?: object; // 핵심 요구사항 (JSON)

  @Column({ type: 'json', nullable: true })
  technical_specs?: object; // 기술 사양 (JSON)

  @Column({ type: 'json', nullable: true })
  evaluation_criteria?: object; // 평가 기준 (JSON)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  complexity_score?: number; // 복잡도 점수 (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  feasibility_score?: number; // 실현 가능성 점수 (0-100)

  @Column({ length: 50, default: 'pending' })
  analysis_status!: string; // 분석 상태 (pending, processing, completed, failed)

  @Column({ type: 'text', nullable: true })
  analysis_notes?: string; // 분석 노트

  @Column({ type: 'datetime', nullable: true })
  analyzed_at?: Date; // 분석 완료 시간

  @ManyToOne(() => Announcement, (announcement) => announcement.analysis_results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announcement_id' })
  announcement!: Announcement;

  @OneToMany(() => ProposalDraft, (draft) => draft.analysis_result)
  proposal_drafts!: ProposalDraft[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}