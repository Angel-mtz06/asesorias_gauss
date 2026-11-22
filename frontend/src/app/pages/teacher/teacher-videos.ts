import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService, apiErrorMessage } from '../../core/api.service';
import { formatDuration } from '../../core/format';
import type { Video, VideoStatus } from '../../core/models';
import { TeacherSession } from '../../core/teacher-session.service';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { NavIcon } from '../../shared/nav-icon';

type StatusFilter = 'all' | VideoStatus;

@Component({
  selector: 'app-teacher-videos',
  imports: [RouterLink, DatePipe, NavIcon, ConfirmDialog],
  templateUrl: './teacher-videos.html',
})
export class TeacherVideos {
  private readonly api = inject(ApiService);
  private readonly session = inject(TeacherSession);
  private readonly router = inject(Router);
  protected readonly formatDuration = formatDuration;

  protected readonly videos = signal<Video[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Filtros reflejados en la URL: ?q=...&materia=3&estado=draft
  readonly q = input<string>();
  readonly materia = input<string>();
  readonly estado = input<string>();
  protected readonly search = linkedSignal(() => this.q() ?? '');
  protected readonly subjectId = linkedSignal<number | 'all'>(() => (Number(this.materia()) > 0 ? Number(this.materia()) : 'all'));
  protected readonly status = linkedSignal<StatusFilter>(() =>
    this.estado() === 'draft' || this.estado() === 'published' ? (this.estado() as VideoStatus) : 'all',
  );
  protected readonly statusOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'published', label: 'Publicados' },
    { id: 'draft', label: 'Borradores' },
  ];

  protected readonly toDelete = signal<Video | null>(null);
  protected readonly deleting = signal(false);
  protected readonly toggling = signal<number | null>(null);

  /** Materias en las que el profesor tiene videos (para el filtro). */
  protected readonly subjects = computed(() => {
    const map = new Map<number, string>();
    for (const v of this.videos()) if (v.unit?.subject) map.set(v.unit.subject.id, v.unit.subject.name);
    return [...map].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.videos().filter(
      (v) =>
        (this.status() === 'all' || v.status === this.status()) &&
        (this.subjectId() === 'all' || v.unit?.subjectId === this.subjectId()) &&
        (!q || v.title.toLowerCase().includes(q) || v.unit?.title.toLowerCase().includes(q)),
    );
  });

  constructor() {
    effect(() => {
      const t = this.session.current();
      if (t) untracked(() => this.load(t.id));
    });

    effect(() => {
      const queryParams = {
        q: this.search().trim() || null,
        materia: this.subjectId() === 'all' ? null : this.subjectId(),
        estado: this.status() === 'all' ? null : this.status(),
      };
      untracked(() => this.router.navigate([], { queryParams, replaceUrl: true }));
    });
  }

  protected load(teacherId = this.session.current()?.id): void {
    if (!teacherId) return;
    this.loading.set(true);
    this.error.set(null);
    this.api.videos({ teacherId }).subscribe({
      next: (v) => {
        this.videos.set(v);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.loading.set(false);
      },
    });
  }

  protected onSubject(value: string): void {
    this.subjectId.set(value === 'all' ? 'all' : Number(value));
  }

  protected toggleStatus(v: Video): void {
    const status: VideoStatus = v.status === 'published' ? 'draft' : 'published';
    this.toggling.set(v.id);
    this.api.updateVideo(v.id, { status }).subscribe({
      next: (updated) => {
        this.videos.update((list) => list.map((x) => (x.id === v.id ? updated : x)));
        this.toggling.set(null);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.toggling.set(null);
      },
    });
  }

  protected confirmDelete(): void {
    const v = this.toDelete();
    if (!v) return;
    this.deleting.set(true);
    this.api.deleteVideo(v.id).subscribe({
      next: () => {
        this.videos.update((list) => list.filter((x) => x.id !== v.id));
        this.deleting.set(false);
        this.toDelete.set(null);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.deleting.set(false);
        this.toDelete.set(null);
      },
    });
  }

  protected clearFilters(): void {
    this.search.set('');
    this.subjectId.set('all');
    this.status.set('all');
  }
}
