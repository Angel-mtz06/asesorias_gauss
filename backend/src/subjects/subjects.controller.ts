import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSubjectDto, CreateUnitDto, SubjectQueryDto, UpdateSubjectDto, UpdateUnitDto } from './subject.dto.js';
import { SubjectsService } from './subjects.service.js';

@Controller()
export class SubjectsController {
  constructor(private readonly service: SubjectsService) {}

  @Get('subjects')
  findAll(@Query() query: SubjectQueryDto) {
    return this.service.findAll(query.level);
  }

  @Get('subjects/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeDrafts', new ParseBoolPipe({ optional: true })) includeDrafts?: boolean,
  ) {
    return this.service.findOne(id, includeDrafts ?? false);
  }

  @Post('subjects')
  create(@Body() dto: CreateSubjectDto) {
    return this.service.create(dto);
  }

  @Patch('subjects/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubjectDto) {
    return this.service.update(id, dto);
  }

  @Delete('subjects/:id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('subjects/:id/units')
  addUnit(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateUnitDto) {
    return this.service.addUnit(id, dto);
  }

  @Patch('units/:id')
  updateUnit(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
    return this.service.updateUnit(id, dto);
  }

  @Delete('units/:id')
  @HttpCode(204)
  removeUnit(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeUnit(id);
  }
}
