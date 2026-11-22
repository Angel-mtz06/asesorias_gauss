import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Level, VideoStatus } from '../common/level.enum.js';
import { CreateSubjectDto, CreateUnitDto, UpdateSubjectDto, UpdateUnitDto } from './subject.dto.js';
import { Subject } from './subject.entity.js';
import { Unit } from './unit.entity.js';

export interface SubjectSummary extends Omit<Subject, 'units'> {
  unitCount: number;
  videoCount: number;
  publishedCount: number;
  totalSeconds: number;
}

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject) private readonly subjects: Repository<Subject>,
    @InjectRepository(Unit) private readonly units: Repository<Unit>,
  ) {}

  /** Lista de materias con conteos de unidades y videos. */
  async findAll(level?: Level): Promise<SubjectSummary[]> {
    const qb = this.subjects
      .createQueryBuilder('s')
      .leftJoin('s.units', 'u')
      .leftJoin('u.videos', 'v')
      .select('s.*')
      .addSelect('COUNT(DISTINCT u.id)', 'unitCount')
      .addSelect('COUNT(v.id)', 'videoCount')
      .addSelect(`COUNT(v.id) FILTER (WHERE v.status = '${VideoStatus.Published}')`, 'publishedCount')
      .addSelect('COALESCE(SUM(v.durationSeconds), 0)', 'totalSeconds')
      .groupBy('s.id')
      .orderBy('s.name', 'ASC');
    if (level) qb.where('s.level = :level', { level });

    const rows = await qb.getRawMany<Record<string, unknown>>();
    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      level: r.level as Level,
      description: String(r.description ?? ''),
      color: String(r.color),
      createdAt: r.createdAt as Date,
      unitCount: Number(r.unitCount),
      videoCount: Number(r.videoCount),
      publishedCount: Number(r.publishedCount),
      totalSeconds: Number(r.totalSeconds),
    }));
  }

  /**
   * Materia con sus unidades y videos ordenados (temario).
   * Por defecto solo incluye videos publicados; el panel del profesor pide también borradores.
   */
  async findOne(id: number, includeDrafts = false): Promise<Subject> {
    const qb = this.subjects
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.units', 'u')
      .leftJoinAndSelect('u.videos', 'v', includeDrafts ? undefined : 'v.status = :published', {
        published: VideoStatus.Published,
      })
      .leftJoinAndSelect('v.teacher', 't')
      .where('s.id = :id', { id })
      .orderBy('u.number', 'ASC')
      .addOrderBy('v.position', 'ASC')
      .addOrderBy('v.id', 'ASC');

    const subject = await qb.getOne();
    if (!subject) throw new NotFoundException(`Materia ${id} no encontrada`);
    return subject;
  }

  create(dto: CreateSubjectDto): Promise<Subject> {
    return this.subjects.save(this.subjects.create(dto));
  }

  async update(id: number, dto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.subjects.findOne({ where: { id } });
    if (!subject) throw new NotFoundException(`Materia ${id} no encontrada`);
    return this.subjects.save(this.subjects.merge(subject, dto));
  }

  async remove(id: number): Promise<void> {
    const result = await this.subjects.delete(id);
    if (!result.affected) throw new NotFoundException(`Materia ${id} no encontrada`);
  }

  // ── Unidades ──────────────────────────────────────────────

  async addUnit(subjectId: number, dto: CreateUnitDto): Promise<Unit> {
    const exists = await this.subjects.exists({ where: { id: subjectId } });
    if (!exists) throw new NotFoundException(`Materia ${subjectId} no encontrada`);

    let number = dto.number;
    if (!number) {
      const max = await this.units.maximum('number', { subjectId });
      number = (max ?? 0) + 1;
    }
    return this.units.save(this.units.create({ title: dto.title, number, subjectId }));
  }

  async updateUnit(id: number, dto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.units.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Unidad ${id} no encontrada`);
    return this.units.save(this.units.merge(unit, dto));
  }

  async removeUnit(id: number): Promise<void> {
    const result = await this.units.delete(id);
    if (!result.affected) throw new NotFoundException(`Unidad ${id} no encontrada`);
  }
}
