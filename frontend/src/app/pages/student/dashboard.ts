import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService, apiErrorMessage } from '../../core/api.service';
import { formatDuration, formatHours } from '../../core/format';
import { LEVELS, type Level, type SubjectSummary, type Video } from '../../core/models';
import { ProgressStore } from '../../core/progress.store';
import { Logo } from '../../shared/logo';
import { NavIcon, type NavIconName } from '../../shared/nav-icon';
import { ProgressBar } from '../../shared/progress-bar';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Logo, NavIcon, ProgressBar],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  protected readonly progress = inject(ProgressStore);
  protected readonly formatDuration = formatDuration;

  protected readonly levels = LEVELS;
  /** ?nivel=secundaria|preparatoria|universidad (el nivel queda en la URL). */
  readonly nivel = input<string>();
  protected readonly level = linkedSignal<Level>(() =>
    LEVELS.some((l) => l.id === this.nivel()) ? (this.nivel() as Level) : 'preparatoria',
  );
  protected readonly query = signal('');
  protected readonly searchResults = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < 2) return [];
    return this.videosAll()
      .filter((v) => v.title.toLowerCase().includes(q) || v.unit?.subject?.name.toLowerCase().includes(q))
      .slice(0, 8);
  });

  protected readonly navItems: { icon: NavIconName; label: string; active: boolean }[] = [
    { icon: 'home', label: 'Inicio', active: true },
    { icon: 'book', label: 'Mis materias', active: false },
    { icon: 'play', label: 'Biblioteca', active: false },
    { icon: 'chart', label: 'Mi progreso', active: false },
    { icon: 'fire', label: 'Rachas e insignias', active: false },
    { icon: 'gear', label: 'Ajustes', active: false },
  ];

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly subjectsAll = signal<SubjectSummary[]>([]);
  private readonly videosAll = signal<Video[]>([]);

  /** Videos publicados del nivel elegido, en orden de temario. */
  private readonly levelVideos = computed(() =>
    this.videosAll()
      .filter((v) => v.unit?.subject?.level === this.level())
      .sort(
        (a, b) =>
          (a.unit!.subject!.name).localeCompare(b.unit!.subject!.name) ||
          a.unit!.number - b.unit!.number ||
          a.position - b.position,
      ),
  );

  protected readonly subjects = computed(() =>
    this.subjectsAll()
      .filter((s) => s.level === this.level() && s.publishedCount > 0)
      .map((s) => {
        const videos = this.levelVideos().filter((v) => v.unit?.subjectId === s.id);
        const done = videos.filter((v) => this.progress.isWatched(v.id)).length;
        const total = videos.length;
        return { ...s, done, total, pct: total ? Math.round((done / total) * 100) : 0 };
      }),
  );

  protected readonly nextClass = computed(
    () => this.levelVideos().find((v) => !this.progress.isWatched(v.id)) ?? this.levelVideos()[0] ?? null,
  );

  protected readonly continueItems = computed(() => {
    const started = this.levelVideos().filter((v) => {
      const f = this.progress.fraction(v.id);
      return f > 0 && f < 1;
    });
    const pool = started.length ? started : this.levelVideos().filter((v) => v.id !== this.nextClass()?.id);
    return pool.slice(0, 3).map((v) => ({ video: v, pct: Math.round(this.progress.fraction(v.id) * 100) }));
  });

  protected readonly stats = computed(() => {
    const all = this.videosAll();
    const watched = all.filter((v) => this.progress.isWatched(v.id));
    return {
      completed: watched.length,
      total: all.length,
      hours: formatHours(watched.reduce((acc, v) => acc + v.durationSeconds, 0)),
    };
  });

  protected readonly streakDays = Array.from({ length: 14 }, (_, i) => i < 12);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    let pending = 2;
    const done = () => {
      if (--pending === 0) this.loading.set(false);
    };
    this.api.subjects().subscribe({
      next: (s) => {
        this.subjectsAll.set(s);
        done();
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        done();
      },
    });
    this.api.videos({ status: 'published' }).subscribe({
      next: (v) => {
        this.videosAll.set(v);
        done();
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        done();
      },
    });
  }

  protected setLevel(level: Level): void {
    this.level.set(level);
    this.router.navigate([], { queryParams: { nivel: level }, replaceUrl: true });
  }

  protected lessonLabel(v: Video): string {
    const u = v.unit;
    return `${u?.subject?.name ?? ''} · Unidad ${u?.number ?? ''} · Lección ${v.position}`;
  }
}
