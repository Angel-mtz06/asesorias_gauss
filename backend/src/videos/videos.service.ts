import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Unit } from '../subjects/unit.entity.js';
import { Teacher } from '../teachers/teacher.entity.js';
import { CreateVideoDto, UpdateVideoDto, VideoQueryDto } from './video.dto.js';
import { Video } from './video.entity.js';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video) private readonly videos: Repository<Video>,
    @InjectRepository(Unit) private readonly units: Repository<Unit>,
    @InjectRepository(Teacher) private readonly teachers: Repository<Teacher>,
  ) {}

  findAll(query: VideoQueryDto): Promise<Video[]> {
    const qb = this.videos
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.unit', 'u')
      .leftJoinAndSelect('u.subject', 's')
      .leftJoinAndSelect('v.teacher', 't')
      .orderBy('v.updatedAt', 'DESC');

    if (query.teacherId) qb.andWhere('v.teacherId = :teacherId', { teacherId: query.teacherId });
    if (query.unitId) qb.andWhere('v.unitId = :unitId', { unitId: query.unitId });
    if (query.subjectId) qb.andWhere('u.subjectId = :subjectId', { subjectId: query.subjectId });
    if (query.status) qb.andWhere('v.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere('(v.title ILIKE :q OR s.name ILIKE :q OR u.title ILIKE :q)', { q: `%${query.search}%` });
    }
    if (query.limit) qb.take(query.limit);

    return qb.getMany();
  }

  async findOne(id: number): Promise<Video> {
    const video = await this.videos.findOne({
      where: { id },
      relations: { unit: { subject: true }, teacher: true },
    });
    if (!video) throw new NotFoundException(`Video ${id} no encontrado`);
    return video;
  }

  async create(dto: CreateVideoDto): Promise<Video> {
    await this.assertRelations(dto.unitId, dto.teacherId);
    const position = dto.position ?? (await this.nextPosition(dto.unitId));
    const saved = await this.videos.save(this.videos.create({ ...dto, position }));
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateVideoDto): Promise<Video> {
    const video = await this.videos.findOne({ where: { id } });
    if (!video) throw new NotFoundException(`Video ${id} no encontrado`);
    await this.assertRelations(dto.unitId, dto.teacherId);
    // Evita que la relación cargada pise el nuevo unitId/teacherId.
    await this.videos.save(this.videos.merge(video, dto));
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.videos.delete(id);
    if (!result.affected) throw new NotFoundException(`Video ${id} no encontrado`);
  }

  async registerView(id: number): Promise<{ views: number }> {
    const result = await this.videos.increment({ id }, 'views', 1);
    if (!result.affected) throw new NotFoundException(`Video ${id} no encontrado`);
    const { views } = await this.videos.findOneOrFail({ where: { id }, select: { id: true, views: true } });
    return { views };
  }

  private async nextPosition(unitId: number): Promise<number> {
    const max = await this.videos.maximum('position', { unitId });
    return (max ?? 0) + 1;
  }

  private async assertRelations(unitId?: number, teacherId?: number): Promise<void> {
    if (unitId !== undefined && !(await this.units.exists({ where: { id: unitId } }))) {
      throw new BadRequestException(`La unidad ${unitId} no existe`);
    }
    if (teacherId !== undefined && !(await this.teachers.exists({ where: { id: teacherId } }))) {
      throw new BadRequestException(`El profesor ${teacherId} no existe`);
    }
  }
}
