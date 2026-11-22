import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { VideoStatus } from '../common/level.enum.js';
import { Video } from '../videos/video.entity.js';
import { CreateTeacherDto, UpdateTeacherDto } from './teacher.dto.js';
import { Teacher } from './teacher.entity.js';

export interface TeacherStats {
  totalVideos: number;
  published: number;
  drafts: number;
  totalSeconds: number;
  totalViews: number;
  subjects: number;
}

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher) private readonly teachers: Repository<Teacher>,
    @InjectRepository(Video) private readonly videos: Repository<Video>,
  ) {}

  findAll(): Promise<Teacher[]> {
    return this.teachers.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teachers.findOne({ where: { id } });
    if (!teacher) throw new NotFoundException(`Profesor ${id} no encontrado`);
    return teacher;
  }

  create(dto: CreateTeacherDto): Promise<Teacher> {
    return this.teachers.save(this.teachers.create(dto));
  }

  async update(id: number, dto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);
    return this.teachers.save(this.teachers.merge(teacher, dto));
  }

  async remove(id: number): Promise<void> {
    const teacher = await this.findOne(id);
    await this.teachers.remove(teacher);
  }

  async stats(id: number): Promise<TeacherStats> {
    await this.findOne(id);
    const raw = await this.videos
      .createQueryBuilder('v')
      .innerJoin('v.unit', 'u')
      .select('COUNT(*)', 'totalVideos')
      .addSelect(`COUNT(*) FILTER (WHERE v.status = '${VideoStatus.Published}')`, 'published')
      .addSelect(`COUNT(*) FILTER (WHERE v.status = '${VideoStatus.Draft}')`, 'drafts')
      .addSelect('COALESCE(SUM(v.durationSeconds), 0)', 'totalSeconds')
      .addSelect('COALESCE(SUM(v.views), 0)', 'totalViews')
      .addSelect('COUNT(DISTINCT u.subjectId)', 'subjects')
      .where('v.teacherId = :id', { id })
      .getRawOne<Record<keyof TeacherStats, string>>();

    return {
      totalVideos: Number(raw?.totalVideos ?? 0),
      published: Number(raw?.published ?? 0),
      drafts: Number(raw?.drafts ?? 0),
      totalSeconds: Number(raw?.totalSeconds ?? 0),
      totalViews: Number(raw?.totalViews ?? 0),
      subjects: Number(raw?.subjects ?? 0),
    };
  }
}
