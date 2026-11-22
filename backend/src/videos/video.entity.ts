import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { VideoStatus } from '../common/level.enum.js';
import { Unit } from '../subjects/unit.entity.js';
import { Teacher } from '../teachers/teacher.entity.js';

export interface VideoMaterial {
  title: string;
  url: string;
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 180 })
  title: string;

  /** Resumen que se muestra en la pestaña "Resumen" del reproductor. */
  @Column({ type: 'text', default: '' })
  summary: string;

  /** URL del archivo de video (mp4/webm) o de YouTube. */
  @Column({ type: 'text' })
  videoUrl: string;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  /** Orden dentro de la unidad. */
  @Column({ type: 'int', default: 1 })
  position: number;

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.Draft })
  status: VideoStatus;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  materials: VideoMaterial[];

  @Column()
  unitId: number;

  @ManyToOne(() => Unit, (unit) => unit.videos, { onDelete: 'CASCADE' })
  unit: Relation<Unit>;

  @Column()
  teacherId: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.videos, { onDelete: 'CASCADE' })
  teacher: Relation<Teacher>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
