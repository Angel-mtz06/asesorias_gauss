import type { Routes } from '@angular/router';
import { unsavedChangesGuard } from './core/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Asesorías Gauss · Clases que sí se entienden',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'inicio',
    title: 'Inicio · Asesorías Gauss',
    loadComponent: () => import('./pages/student/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'clase',
    title: 'Clase · Asesorías Gauss',
    loadComponent: () => import('./pages/student/class-player').then((m) => m.ClassPlayer),
  },
  {
    path: 'clase/:id',
    title: 'Clase · Asesorías Gauss',
    loadComponent: () => import('./pages/student/class-player').then((m) => m.ClassPlayer),
  },
  {
    path: 'profesor',
    loadComponent: () => import('./pages/teacher/teacher-shell').then((m) => m.TeacherShell),
    children: [
      {
        path: '',
        title: 'Panel del profesor · Asesorías Gauss',
        loadComponent: () => import('./pages/teacher/teacher-overview').then((m) => m.TeacherOverview),
      },
      {
        path: 'videos',
        title: 'Mis videos · Asesorías Gauss',
        loadComponent: () => import('./pages/teacher/teacher-videos').then((m) => m.TeacherVideos),
      },
      {
        path: 'videos/nuevo',
        title: 'Subir video · Asesorías Gauss',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/teacher/video-form').then((m) => m.VideoForm),
      },
      {
        path: 'videos/:id/editar',
        title: 'Editar video · Asesorías Gauss',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/teacher/video-form').then((m) => m.VideoForm),
      },
      {
        path: 'materias',
        title: 'Materias y unidades · Asesorías Gauss',
        loadComponent: () => import('./pages/teacher/teacher-subjects').then((m) => m.TeacherSubjects),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
