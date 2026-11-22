import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  Level,
  Subject,
  SubjectDetail,
  SubjectSummary,
  Teacher,
  TeacherStats,
  Unit,
  Video,
  VideoInput,
  VideoQuery,
} from './models';

const API = '/api';

function toParams(query: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
  }
  return params;
}

/** Convierte un error HTTP de Nest en un mensaje legible. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No hay conexión con el servidor. ¿Está corriendo la API en el puerto 3000?';
    const message = err.error?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
    return `Error ${err.status}`;
  }
  return 'Ocurrió un error inesperado';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // Profesores
  teachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${API}/teachers`);
  }
  teacher(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${API}/teachers/${id}`);
  }
  teacherStats(id: number): Observable<TeacherStats> {
    return this.http.get<TeacherStats>(`${API}/teachers/${id}/stats`);
  }

  // Materias y unidades
  subjects(level?: Level): Observable<SubjectSummary[]> {
    return this.http.get<SubjectSummary[]>(`${API}/subjects`, { params: toParams({ level }) });
  }
  subject(id: number, includeDrafts = false): Observable<SubjectDetail> {
    return this.http.get<SubjectDetail>(`${API}/subjects/${id}`, { params: toParams({ includeDrafts }) });
  }
  createSubject(data: Pick<Subject, 'name' | 'level' | 'description' | 'color'>): Observable<Subject> {
    return this.http.post<Subject>(`${API}/subjects`, data);
  }
  updateSubject(id: number, data: Partial<Subject>): Observable<Subject> {
    return this.http.patch<Subject>(`${API}/subjects/${id}`, data);
  }
  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/subjects/${id}`);
  }
  createUnit(subjectId: number, title: string): Observable<Unit> {
    return this.http.post<Unit>(`${API}/subjects/${subjectId}/units`, { title });
  }
  updateUnit(id: number, data: Partial<Pick<Unit, 'title' | 'number'>>): Observable<Unit> {
    return this.http.patch<Unit>(`${API}/units/${id}`, data);
  }
  deleteUnit(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/units/${id}`);
  }

  // Videos
  videos(query: VideoQuery = {}): Observable<Video[]> {
    return this.http.get<Video[]>(`${API}/videos`, { params: toParams(query) });
  }
  video(id: number): Observable<Video> {
    return this.http.get<Video>(`${API}/videos/${id}`);
  }
  createVideo(data: VideoInput): Observable<Video> {
    return this.http.post<Video>(`${API}/videos`, data);
  }
  updateVideo(id: number, data: Partial<VideoInput>): Observable<Video> {
    return this.http.patch<Video>(`${API}/videos/${id}`, data);
  }
  deleteVideo(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/videos/${id}`);
  }
  registerView(id: number): Observable<{ views: number }> {
    return this.http.post<{ views: number }>(`${API}/videos/${id}/view`, {});
  }
}
