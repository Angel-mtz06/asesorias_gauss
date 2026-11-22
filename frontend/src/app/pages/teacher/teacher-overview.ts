import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, apiErrorMessage } from '../../core/api.service';
import { formatDuration, formatHours, LEVEL_LABEL } from '../../core/format';
import type { TeacherStats, Video } from '../../core/models';
import { TeacherSession } from '../../core/teacher-session.service';
import { NavIcon } from '../../shared/nav-icon';

@Component({
  selector: 'app-teacher-overview',
  imports: [RouterLink, NavIcon],
  templateUrl: './teacher-overview.html',
})
export class TeacherOverview {
  private readonly api = inject(ApiService);
  protected readonly session = inject(TeacherSession);
  protected readonly formatDuration = formatDuration;
  protected readonly levelLabel = LEVEL_LABEL;

  protected readonly stats = signal<TeacherStats | null>(null);
  protected readonly videos = signal<Video[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly publishing = signal<number | null>(null);

  protected readonly firstName = computed(() => {
    const name = this.session.current()?.name ?? '';
    return name.replace(/^(Prof\.|Mtra\.|Mtro\.)\s*/, '').split(' ')[0];
  });
  protected readonly recent = computed(() => this.videos().slice(0, 5));
  protected readonly drafts = computed(() => this.videos().filter((v) => v.status === 'draft'));
  protected readonly topVideos = computed(() =>
    [...this.videos()].filter((v) => v.status === 'published').sort((a, b) => b.views - a.views).slice(0, 3),
  );
  protected readonly hours = computed(() => formatHours(this.stats()?.totalSeconds ?? 0));

  constructor() {
    effect(() => {
      const t = this.session.current();
      if (t) untracked(() => this.load(t.id));
    });
  }

  protected load(teacherId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.teacherStats(teacherId).subscribe({
      next: (s) => this.stats.set(s),
      error: (e) => this.error.set(apiErrorMessage(e)),
    });
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

  protected publish(video: Video): void {
    this.publishing.set(video.id);
    this.api.updateVideo(video.id, { status: 'published' }).subscribe({
      next: () => {
        this.publishing.set(null);
        this.load(video.teacherId);
      },
      error: (e) => {
        this.publishing.set(null);
        this.error.set(apiErrorMessage(e));
      },
    });
  }

  protected location(v: Video): string {
    const u = v.unit;
    return u?.subject ? `${u.subject.name} · Unidad ${u.number}` : '';
  }
}
