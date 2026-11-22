import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Level } from '../common/level.enum.js';
import { Unit } from './unit.entity.js';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'enum', enum: Level })
  level: Level;

  @Column({ type: 'text', default: '' })
  description: string;

  /** Color de las miniaturas de la materia (tokens del diseño). */
  @Column({ length: 7, default: '#1B5FA8' })
  color: string;

  @OneToMany(() => Unit, (unit) => unit.subject, { cascade: true })
  units: Relation<Unit[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
