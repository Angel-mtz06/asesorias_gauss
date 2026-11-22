import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Video } from '../videos/video.entity.js';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 160, unique: true })
  email: string;

  /** Materia o área principal, p. ej. "Cálculo y precálculo". */
  @Column({ length: 120, default: '' })
  specialty: string;

  @Column({ type: 'text', default: '' })
  bio: string;

  @Column({ length: 7, default: '#1B5FA8' })
  avatarColor: string;

  @OneToMany(() => Video, (video) => video.teacher)
  videos: Relation<Video[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
