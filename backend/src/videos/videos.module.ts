import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from '../subjects/unit.entity.js';
import { Teacher } from '../teachers/teacher.entity.js';
import { Video } from './video.entity.js';
import { VideosController } from './videos.controller.js';
import { VideosService } from './videos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Unit, Teacher])],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
