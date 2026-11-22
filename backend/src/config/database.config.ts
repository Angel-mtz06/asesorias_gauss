import type { DataSourceOptions } from 'typeorm';
import { Subject } from '../subjects/subject.entity.js';
import { Unit } from '../subjects/unit.entity.js';
import { Teacher } from '../teachers/teacher.entity.js';
import { Video } from '../videos/video.entity.js';

export const ENTITIES = [Teacher, Subject, Unit, Video];

/** Opciones de conexión a PostgreSQL leídas de las variables de entorno (.env). */
export function databaseOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USERNAME ?? 'postgres',
    password: env.DB_PASSWORD ?? '',
    database: env.DB_NAME ?? 'asesorias_gauss',
    entities: ENTITIES,
    // En desarrollo TypeORM crea/ajusta las tablas. En producción usa migraciones.
    synchronize: (env.DB_SYNC ?? 'true') === 'true',
    logging: env.DB_LOGGING === 'true',
  };
}
