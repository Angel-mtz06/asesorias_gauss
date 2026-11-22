import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService, apiErrorMessage } from '../../core/api.service';
import { formatDuration, LEVEL_LABEL } from '../../core/format';
import type { SubjectDetail, Video } from '../../core/models';
import { ProgressStore } from '../../core/progress.store';
import { ProgressBar } from '../../shared/progress-bar';
import { VideoPlayer } from '../../shared/video-player';

type Tab = 'Resumen' | 'Material descargable' | 'Mis apuntes' | 'Preguntas';
type LessonStatus = 'done' | 'current' | 'pending';

@Component({
  selector: 'app-class-player',
  imports: [RouterLink, ProgressBar, VideoPlayer],
  templateUrl: './class-player.html',
})
export class ClassPlayer {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  protected readonly progress = inject(ProgressStore);
  protected readonly formatDuration = formatDuration;
  protected readonly levelLabel = LEVEL_LABEL;

  /** Parámetro de ruta :id (opcional). */
  readonly id = input<string>();

  protected readonly tabs: Tab[] = ['Resumen', 'Material descargable', 'Mis apuntes', 'Preguntas'];
  protected readonly activeTab = signal<Tab>('Resumen');

  protected readonly video = signal<Video | null>(null);
  protected readonly subject = signal<SubjectDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly note = signal('');
  protected readonly noteSaved = signal(false);

  /** Lecciones publicadas de la materia en orden. */
  protected readonly lessons = computed(() => this.subject()?.units.flatMap((u) => u.videos) ?? []);
  protected readonly lessonIndex = computed(() => this.lessons().findIndex((l) => l.id === this.video()?.id));
  protected readonly nextLesson = computed(() => this.lessons()[this.lessonIndex() + 1] ?? null);
  protected readonly subjectProgress = computed(() => {
    const total = this.lessons().length;
    const done = this.lessons().filter((l) => this.progress.isWatched(l.id)).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  constructor() {
    effect(() => {
      const id = Number(this.id());
      untracked(() => (id ? this.load(id) : this.redirectToSample()));
    });
  }

  protected status(lesson: Video): LessonStatus {
    if (lesson.id === this.video()?.id) return 'current';
    return this.progress.isWatched(lesson.id) ? 'done' : 'pending';
  }

  protected onStarted(): void {
    const v = this.video();
    if (v) this.api.registerView(v.id).subscribe({ error: () => undefined });
  }

  protected onProgress(fraction: number): void {
    const v = this.video();
    if (v) this.progress.savePosition(v.id, fraction);
  }

  protected onCompleted(): void {
    const v = this.video();
    if (v) this.progress.markWatched(v.id);
  }

  protected onNoteInput(text: string): void {
    this.note.set(text);
    const v = this.video();
    if (!v) return;
    this.progress.saveNote(v.id, text);
    this.noteSaved.set(true);
  }

  protected selectTab(tab: Tab, event?: KeyboardEvent): void {
    if (event) {
      const i = this.tabs.indexOf(this.activeTab());
      if (event.key === 'ArrowRight') tab = this.tabs[(i + 1) % this.tabs.length];
      else if (event.key === 'ArrowLeft') tab = this.tabs[(i - 1 + this.tabs.length) % this.tabs.length];
      else return;
      event.preventDefault();
      document.getElementById(`tab-${this.tabs.indexOf(tab)}`)?.focus();
    }
    this.activeTab.set(tab);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.activeTab.set('Resumen');
    this.api.video(id).subscribe({
      next: (video) => {
        this.video.set(video);
        this.note.set(this.progress.note(video.id));
        this.noteSaved.set(false);
        const subjectId = video.unit?.subjectId;
        if (subjectId && this.subject()?.id !== subjectId) {
          this.api.subject(subjectId).subscribe({
            next: (s) => {
              this.subject.set(s);
              this.loading.set(false);
            },
            error: (e) => {
              this.error.set(apiErrorMessage(e));
              this.loading.set(false);
            },
          });
        } else {
          this.loading.set(false);
        }
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.loading.set(false);
      },
    });
  }

  /** /clase sin id: abre la clase de muestra del diseño (o la primera publicada). */
  private redirectToSample(): void {
    this.api.videos({ status: 'published' }).subscribe({
      next: (videos) => {
        const sample = videos.find((v) => v.title.startsWith('Regla de la cadena')) ?? videos[0];
        if (sample) this.router.navigate(['/clase', sample.id], { replaceUrl: true });
        else {
          this.error.set('Todavía no hay clases publicadas.');
          this.loading.set(false);
        }
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.loading.set(false);
      },
    });
  }
}
