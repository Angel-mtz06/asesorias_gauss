/**
 * Crea la base de datos (si no existe), sincroniza las tablas y carga datos de prueba.
 *
 *   npm run seed
 *
 * ¡Borra los datos existentes de profesores, materias, unidades y videos!
 */
import { existsSync } from 'node:fs';
import pg from 'pg';
import { DataSource } from 'typeorm';
import { VideoStatus } from '../common/level.enum.js';
import { databaseOptions } from '../config/database.config.js';
import { Subject } from '../subjects/subject.entity.js';
import { Unit } from '../subjects/unit.entity.js';
import { Teacher } from '../teachers/teacher.entity.js';
import { Video } from '../videos/video.entity.js';
import { SUBJECTS, TEACHERS, TEST_MATERIALS, TEST_VIDEO_URLS, toSeconds } from './seed-data.js';

if (existsSync('.env')) process.loadEnvFile('.env');

async function ensureDatabase(): Promise<void> {
  const name = process.env.DB_NAME ?? 'asesorias_gauss';
  if (!/^[a-z0-9_]+$/i.test(name)) throw new Error(`Nombre de base de datos inválido: ${name}`);

  const client = new pg.Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: 'postgres',
  });
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  if (!rowCount) {
    await client.query(`CREATE DATABASE "${name}"`);
    console.log(`Base de datos "${name}" creada.`);
  }
  await client.end();
}

async function seed(): Promise<void> {
  await ensureDatabase();

  const ds = new DataSource({ ...databaseOptions(process.env), synchronize: true });
  await ds.initialize();

  await ds.query('TRUNCATE TABLE videos, units, subjects, teachers RESTART IDENTITY CASCADE');

  const teacherRepo = ds.getRepository(Teacher);
  const subjectRepo = ds.getRepository(Subject);
  const unitRepo = ds.getRepository(Unit);
  const videoRepo = ds.getRepository(Video);

  const teacherByKey = new Map<string, Teacher>();
  for (const { key, ...data } of TEACHERS) {
    teacherByKey.set(key, await teacherRepo.save(teacherRepo.create(data)));
  }

  let urlIndex = 0;
  let videoCount = 0;
  for (const s of SUBJECTS) {
    const subject = await subjectRepo.save(
      subjectRepo.create({ name: s.name, level: s.level, color: s.color, description: s.description }),
    );
    const teacher = teacherByKey.get(s.teacher)!;

    for (const [ui, u] of s.units.entries()) {
      const unit = await unitRepo.save(unitRepo.create({ number: ui + 1, title: u.title, subjectId: subject.id }));

      for (const [li, lesson] of u.lessons.entries()) {
        await videoRepo.save(
          videoRepo.create({
            title: lesson.title,
            summary:
              lesson.summary ??
              `Clase de ${s.name}: ${lesson.title.toLowerCase()}. Incluye ejemplos resueltos y una práctica breve al final.`,
            videoUrl: TEST_VIDEO_URLS[urlIndex++ % TEST_VIDEO_URLS.length],
            thumbnailUrl: null,
            durationSeconds: toSeconds(lesson.duration),
            position: li + 1,
            status: lesson.status ?? VideoStatus.Published,
            views: 40 + ((videoCount * 37) % 260),
            materials: li % 2 === 0 ? TEST_MATERIALS : TEST_MATERIALS.slice(0, 1),
            unitId: unit.id,
            teacherId: teacher.id,
          }),
        );
        videoCount++;
      }
    }
  }

  console.log(`Seed listo: ${TEACHERS.length} profesores, ${SUBJECTS.length} materias, ${videoCount} videos.`);
  await ds.destroy();
}

seed().catch((err: unknown) => {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
});
