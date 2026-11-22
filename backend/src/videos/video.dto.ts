import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { VideoStatus } from '../common/level.enum.js';

export class VideoMaterialDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title: string;

  @IsUrl({ require_protocol: true }, { message: 'La URL del material debe empezar con http(s)://' })
  url: string;
}

export class CreateVideoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsUrl({ require_protocol: true }, { message: 'La URL del video debe empezar con http(s)://' })
  videoUrl: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  thumbnailUrl?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSeconds: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position?: number;

  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => VideoMaterialDto)
  materials?: VideoMaterialDto[];

  @Type(() => Number)
  @IsInt()
  unitId: number;

  @Type(() => Number)
  @IsInt()
  teacherId: number;
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {}

export class VideoQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unitId?: number;

  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
