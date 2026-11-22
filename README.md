# Asesorías Gauss

Plataforma de videoclases (secundaria a universidad) construida a partir del diseño de Figma Make
**Asesorías Gauss**. Incluye la landing, el dashboard del estudiante, el reproductor de clases y el
**panel del profesor** para administrar videos, materias y unidades.

| Carpeta     | Stack                                                    |
| ----------- | -------------------------------------------------------- |
| `backend/`  | NestJS 12 · TypeORM · PostgreSQL · class-validator       |
| `frontend/` | Angular 22 (standalone, signals) · Tailwind CSS v4       |

## Requisitos

- Node.js 24+
- PostgreSQL 17 corriendo en `localhost:5432`

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # pon tu usuario y contraseña de PostgreSQL
npm run seed                # crea la BD "asesorias_gauss", las tablas y los datos de prueba
npm run start:dev           # API en http://localhost:3000/api
```

> `npm run seed` **borra y vuelve a cargar** profesores, materias, unidades y videos.

### 2. Frontend

```bash
cd frontend
npm install
npm start                   # http://localhost:4200 (redirige /api al backend)
```

## Pantallas

| Ruta                          | Pantalla                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| `/`                           | Landing                                                     |
| `/inicio`                     | Dashboard del estudiante (`?nivel=secundaria` …)            |
| `/clase/:id`                  | Reproductor con temario, resumen, material y apuntes        |
| `/profesor`                   | Panel del profesor: métricas, recientes, borradores         |
| `/profesor/videos`            | Lista de videos con búsqueda y filtros (`?q=&materia=&estado=`) |
| `/profesor/videos/nuevo`      | Subir video (URL, vista previa, duración automática)        |
| `/profesor/videos/:id/editar` | Editar video                                                |
| `/profesor/materias`          | Materias y unidades                                         |

La píldora flotante inferior (como en el prototipo de Figma) salta entre pantallas.

## API

Prefijo `/api`. Todas las entradas se validan con DTOs.

| Método | Ruta                          | Descripción                                          |
| ------ | ----------------------------- | ---------------------------------------------------- |
| GET    | `/teachers`                   | Profesores                                           |
| GET    | `/teachers/:id/stats`         | Videos, borradores, segundos y vistas del profesor   |
| GET    | `/subjects?level=`            | Materias con conteos                                 |
| GET    | `/subjects/:id?includeDrafts=`| Materia con unidades y videos (temario)              |
| POST / PATCH / DELETE | `/subjects[/:id]`  | CRUD de materias                                     |
| POST   | `/subjects/:id/units`         | Nueva unidad                                         |
| PATCH / DELETE | `/units/:id`          | Renombrar / eliminar unidad                          |
| GET    | `/videos?teacherId=&subjectId=&unitId=&status=&search=&limit=` | Videos         |
| GET / POST / PATCH / DELETE | `/videos[/:id]`  | CRUD de videos                                    |
| POST   | `/videos/:id/view`            | Suma una reproducción                                |

### Modelo

`Teacher 1─* Video *─1 Unit *─1 Subject` — cada video pertenece a una unidad de una materia y tiene un
profesor autor. Los videos tienen estado `draft` / `published`; el estudiante solo ve los publicados.

## Videos de prueba

Los videos sembrados usan URLs públicas de prueba (MDN, W3C, test-videos.co.uk, samplelib, Blender),
listadas en `backend/src/seed/seed-data.ts` y en el formulario del profesor
(«Usar un video de prueba…»). Sustitúyelas por las videoclases reales cuando estén grabadas.

## Pendiente

- **Autenticación**: el panel del profesor permite elegir el profesor activo; el avance del estudiante
  (lecciones vistas, apuntes) se guarda en el navegador.
- Subida de archivos de video (hoy se registra la URL).
- Subtítulos (CC) y migraciones de TypeORM para producción (`DB_SYNC=false`).
