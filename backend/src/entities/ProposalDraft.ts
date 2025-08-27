import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AnalysisResult } from './AnalysisResult';

@Entity('proposal_drafts')
@Index('idx_proposals_analysis_id', ['analysis_result_id'])
@Index('idx_proposals_status', ['status'])
export class ProposalDraft {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  analysis_result_id!: number;

  @Column({ length: 500 })
  title!: string; // 제안서 제목

  @Column({ type: 'text' })
  executive_summary!: string; // 요약

  @Column({ type: 'json', nullable: true })
  technical_approach?: object; // 기술적 접근 방법 (JSON)

  @Column({ type: 'json', nullable: true })
  project_plan?: object; // 프로젝트 계획 (JSON)

  @Column({ type: 'json', nullable: true })
  team_composition?: object; // 팀 구성 (JSON)

  @Column({ type: 'json', nullable: true })
  budget_breakdown?: object; // 예산 세부사항 (JSON)

  @Column({ type: 'json', nullable: true })
  risk_management?: object; // 위험 관리 (JSON)

  @Column({ type: 'text', nullable: true })
  additional_notes?: string; // 추가 메모

  @Column({ length: 50, default: 'draft' })
  status!: string; // 상태 (draft, review, approved, rejected)

  @Column({ length: 500, nullable: true })
  hwp_file_path?: string; // 생성된 HWP 파일 경로

  @Column({ type: 'datetime', nullable: true })
  generated_at?: Date; // 생성 완료 시간

  @ManyToOne(() => AnalysisResult, analysis => analysis.proposal_drafts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'analysis_result_id' })
  analysis_result!: AnalysisResult;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
