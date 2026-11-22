import { Injectable, signal } from '@angular/core';

const WATCHED_KEY = 'gauss.watched';
const NOTES_KEY = 'gauss.notes';
const POSITIONS_KEY = 'gauss.positions';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible (modo privado) */
  }
}

/**
 * Avance del estudiante guardado en el navegador.
 * Provisional hasta que exista autenticación de estudiantes en la API.
 */
@Injectable({ providedIn: 'root' })
export class ProgressStore {
  private readonly watchedIds = signal<Set<number>>(new Set(read<number[]>(WATCHED_KEY, [])));
  readonly watched = this.watchedIds.asReadonly();

  isWatched(videoId: number): boolean {
    return this.watchedIds().has(videoId);
  }

  markWatched(videoId: number): void {
    if (this.watchedIds().has(videoId)) return;
    const next = new Set(this.watchedIds());
    next.add(videoId);
    this.watchedIds.set(next);
    write(WATCHED_KEY, [...next]);
  }

  /** Fracción vista (0-1) de cada video, para "Continúa viendo". */
  private readonly positionMap = signal<Record<string, number>>(read<Record<string, number>>(POSITIONS_KEY, {}));
  readonly positions = this.positionMap.asReadonly();

  fraction(videoId: number): number {
    if (this.isWatched(videoId)) return 1;
    return this.positionMap()[videoId] ?? 0;
  }

  savePosition(videoId: number, fraction: number): void {
    const next = { ...this.positionMap(), [videoId]: Math.min(1, Math.max(0, fraction)) };
    this.positionMap.set(next);
    write(POSITIONS_KEY, next);
  }

  note(videoId: number): string {
    return read<Record<string, string>>(NOTES_KEY, {})[videoId] ?? '';
  }

  saveNote(videoId: number, text: string): void {
    const notes = read<Record<string, string>>(NOTES_KEY, {});
    notes[videoId] = text;
    write(NOTES_KEY, notes);
  }
}
