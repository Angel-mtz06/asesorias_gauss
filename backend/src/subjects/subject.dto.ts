import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsHexColor, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Level } from '../common/level.enum.js';

export class CreateSubjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEnum(Level)
  level: Level;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}

export class SubjectQueryDto {
  @IsOptional()
  @IsEnum(Level)
  level?: Level;
}

export class CreateUnitDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title: string;

  /** Si no se envía, se asigna el siguiente número disponible. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  number?: number;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}
