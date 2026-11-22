import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Video } from '../videos/video.entity.js';
import { Subject } from './subject.entity.js';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  /** Número de la unidad dentro de la materia (1, 2, 3...). */
  @Column({ type: 'int' })
  number: number;

  @Column({ length: 160 })
  title: string;

  @Column()
  subjectId: number;

  @ManyToOne(() => Subject, (subject) => subject.units, { onDelete: 'CASCADE' })
  subject: Relation<Subject>;

  @OneToMany(() => Video, (video) => video.unit)
  videos: Relation<Video[]>;
}
