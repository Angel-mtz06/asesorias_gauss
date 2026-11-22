import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsHexColor, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  specialty?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsHexColor()
  avatarColor?: string;
}

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
