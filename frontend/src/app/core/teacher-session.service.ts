import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService, apiErrorMessage } from './api.service';
import type { Teacher } from './models';

const KEY = 'gauss.teacherId';

/**
 * Profesor activo del panel. Mientras no haya login, se elige de la lista de
 * profesores y se recuerda en el navegador.
 */
@Injectable({ providedIn: 'root' })
export class TeacherSession {
  private readonly api = inject(ApiService);

  readonly teachers = signal<Teacher[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private readonly selectedId = signal<number | null>(this.storedId());

  readonly current = computed<Teacher | null>(() => {
    const list = this.teachers();
    // Sin selección previa se usa el primer profesor registrado (id más bajo).
    const fallback = list.reduce<Teacher | null>((min, t) => (!min || t.id < min.id ? t : min), null);
    return list.find((t) => t.id === this.selectedId()) ?? fallback;
  });

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.teachers().subscribe({
      next: (list) => {
        this.teachers.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  select(id: number): void {
    this.selectedId.set(id);
    try {
      localStorage.setItem(KEY, String(id));
    } catch {
      /* ignorar */
    }
  }

  private storedId(): number | null {
    try {
      const v = Number(localStorage.getItem(KEY));
      return Number.isFinite(v) && v > 0 ? v : null;
    } catch {
      return null;
    }
  }
}
