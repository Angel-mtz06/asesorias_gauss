import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { databaseOptions } from './config/database.config.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { TeachersModule } from './teachers/teachers.module.js';
import { VideosModule } from './videos/videos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      // Se resuelve después de que ConfigModule carga el .env.
      useFactory: () => databaseOptions(process.env),
    }),
    TeachersModule,
    SubjectsModule,
    VideosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
