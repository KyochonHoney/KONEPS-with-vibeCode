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
import { Announcement } from './Announcement';

@Entity('announcement_files')
@Index('idx_files_announcement_id', ['announcement_id'])
@Index('idx_files_file_type', ['file_type'])
export class AnnouncementFile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  announcement_id!: number;

  @Column({ length: 300 })
  original_filename!: string; // 원본 파일명

  @Column({ length: 300 })
  stored_filename!: string; // 저장된 파일명

  @Column({ length: 500 })
  file_path!: string; // 파일 경로

  @Column({ type: 'bigint', unsigned: true })
  file_size!: number; // 파일 크기 (바이트)

  @Column({ length: 50 })
  file_type!: string; // 파일 형식 (pdf, doc, hwp 등)

  @Column({ length: 32, nullable: true })
  file_hash?: string; // 파일 해시 (MD5)

  @Column({ length: 500, nullable: true })
  download_url?: string; // 원본 다운로드 URL

  @Column({ type: 'boolean', default: false })
  is_downloaded!: boolean; // 다운로드 완료 여부

  @Column({ type: 'boolean', default: false })
  is_analyzed!: boolean; // 분석 완료 여부

  @ManyToOne(() => Announcement, announcement => announcement.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announcement_id' })
  announcement!: Announcement;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
