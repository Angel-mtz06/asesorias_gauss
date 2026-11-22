import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './subject.entity.js';
import { SubjectsController } from './subjects.controller.js';
import { SubjectsService } from './subjects.service.js';
import { Unit } from './unit.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Unit])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
