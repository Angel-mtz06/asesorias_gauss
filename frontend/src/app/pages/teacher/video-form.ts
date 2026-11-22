import {
  Component,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, map, startWith } from 'rxjs';
import { ApiService, apiErrorMessage } from '../../core/api.service';
import { formatDuration, LEVEL_LABEL, parseDuration } from '../../core/format';
import type { SubjectSummary, UnitWithVideos, VideoInput, VideoStatus } from '../../core/models';
import { TeacherSession } from '../../core/teacher-session.service';
import { TEST_VIDEOS } from '../../core/test-videos';
import { NavIcon } from '../../shared/nav-icon';
import { VideoPlayer } from '../../shared/video-player';

const URL_PATTERN = /^https?:\/\/\S+$/i;

function durationValidator(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  return parseDuration(control.value) === null ? { duration: true } : null;
}

type MaterialGroup = FormGroup<{ title: FormControl<string>; url: FormControl<string> }>;

@Component({
  selector: 'app-video-form',
  imports: [ReactiveFormsModule, RouterLink, NavIcon, VideoPlayer],
  templateUrl: './video-form.html',
})
export class VideoForm {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  protected readonly session = inject(TeacherSession);
  protected readonly testVideos = TEST_VIDEOS;
  protected readonly levelLabel = LEVEL_LABEL;

  /** Parámetro :id cuando se edita. */
  readonly id = input<string>();
  protected readonly isEdit = computed(() => !!this.id());

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(180)] }),
    videoUrl: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(URL_PATTERN)] }),
    duration: new FormControl('', { nonNullable: true, validators: [Validators.required, durationValidator] }),
    subjectId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    unitId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    summary: new FormControl('', { nonNullable: true }),
    status: new FormControl<VideoStatus>('draft', { nonNullable: true }),
    materials: new FormArray<MaterialGroup>([]),
  });

  protected readonly subjects = signal<SubjectSummary[]>([]);
  protected readonly units = signal<UnitWithVideos[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly detectedDuration = signal<number | null>(null);
  protected readonly newUnitTitle = signal('');
  protected readonly creatingUnit = signal(false);
  private originalTeacherId: number | null = null;
  private saved = false;

  /** URL que se previsualiza (con retardo para no recargar en cada tecla). */
  protected readonly previewUrl = toSignal(
    this.form.controls.videoUrl.valueChanges.pipe(
      startWith(this.form.controls.videoUrl.value),
      debounceTime(500),
      map((url) => (URL_PATTERN.test(url) ? url : '')),
    ),
    { initialValue: '' },
  );

  protected readonly subjectsByLevel = computed(() =>
    (['secundaria', 'preparatoria', 'universidad'] as const)
      .map((level) => ({ level, items: this.subjects().filter((s) => s.level === level) }))
      .filter((g) => g.items.length),
  );

  constructor() {
    this.api.subjects().subscribe({
      next: (s) => this.subjects.set(s),
      error: (e) => this.serverError.set(apiErrorMessage(e)),
    });

    this.form.controls.subjectId.valueChanges.subscribe((subjectId) => {
      this.form.controls.unitId.setValue(null);
      this.loadUnits(subjectId);
    });

    effect(() => {
      const id = Number(this.id());
      if (id) untracked(() => this.loadVideo(id));
    });
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saved;
  }

  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) event.preventDefault();
  }

  protected get materials(): FormArray<MaterialGroup> {
    return this.form.controls.materials;
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected addMaterial(title = '', url = ''): void {
    this.materials.push(
      new FormGroup({
        title: new FormControl(title, { nonNullable: true, validators: [Validators.required] }),
        url: new FormControl(url, { nonNullable: true, validators: [Validators.required, Validators.pattern(URL_PATTERN)] }),
      }),
    );
  }

  protected removeMaterial(index: number): void {
    this.materials.removeAt(index);
  }

  protected useTestVideo(url: string): void {
    if (!url) return;
    this.form.controls.videoUrl.setValue(url);
    this.form.controls.videoUrl.markAsTouched();
  }

  protected onDuration(seconds: number): void {
    this.detectedDuration.set(seconds);
    // Si el campo está vacío, se llena con la duración real del archivo.
    if (!this.form.controls.duration.value) this.applyDetected();
  }

  protected applyDetected(): void {
    const d = this.detectedDuration();
    if (d !== null) {
      this.form.controls.duration.setValue(formatDuration(d));
      this.form.controls.duration.markAsTouched();
    }
  }

  protected detectedLabel(): string {
    const d = this.detectedDuration();
    return d === null ? '' : formatDuration(d);
  }

  protected createUnit(): void {
    const subjectId = this.form.controls.subjectId.value;
    const title = this.newUnitTitle().trim();
    if (!subjectId || title.length < 2) return;
    this.creatingUnit.set(true);
    this.api.createUnit(subjectId, title).subscribe({
      next: (unit) => {
        this.units.update((list) => [...list, { ...unit, videos: [] }]);
        this.form.controls.unitId.setValue(unit.id);
        this.newUnitTitle.set('');
        this.creatingUnit.set(false);
      },
      error: (e) => {
        this.serverError.set(apiErrorMessage(e));
        this.creatingUnit.set(false);
      },
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    this.serverError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Lleva el foco al primer campo con error una vez renderizados los mensajes.
      afterNextRender(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(), {
        injector: this.injector,
      });
      return;
    }
    const teacherId = this.originalTeacherId ?? this.session.current()?.id;
    if (!teacherId) return;

    const v = this.form.getRawValue();
    const payload: VideoInput = {
      title: v.title.trim(),
      summary: v.summary.trim(),
      videoUrl: v.videoUrl.trim(),
      thumbnailUrl: null,
      durationSeconds: parseDuration(v.duration) ?? 0,
      status: v.status,
      materials: v.materials.map((m) => ({ title: m.title.trim(), url: m.url.trim() })),
      unitId: v.unitId!,
      teacherId,
    };

    this.saving.set(true);
    const id = Number(this.id());
    const request = id ? this.api.updateVideo(id, payload) : this.api.createVideo(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved = true;
        this.router.navigate(['/profesor/videos']);
      },
      error: (e) => {
        this.saving.set(false);
        this.serverError.set(apiErrorMessage(e));
      },
    });
  }

  private loadUnits(subjectId: number | null, then?: () => void): void {
    this.units.set([]);
    if (!subjectId) return;
    this.api.subject(subjectId, true).subscribe({
      next: (s) => {
        this.units.set(s.units);
        then?.();
      },
      error: (e) => this.serverError.set(apiErrorMessage(e)),
    });
  }

  private loadVideo(id: number): void {
    this.loading.set(true);
    this.api.video(id).subscribe({
      next: (video) => {
        this.originalTeacherId = video.teacherId;
        const subjectId = video.unit?.subjectId ?? null;
        this.form.patchValue(
          {
            title: video.title,
            videoUrl: video.videoUrl,
            duration: formatDuration(video.durationSeconds),
            summary: video.summary,
            status: video.status,
          },
          { emitEvent: true },
        );
        this.form.controls.subjectId.setValue(subjectId, { emitEvent: false });
        this.loadUnits(subjectId, () => this.form.controls.unitId.setValue(video.unitId));
        this.materials.clear();
        for (const m of video.materials) this.addMaterial(m.title, m.url);
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: (e) => {
        this.serverError.set(apiErrorMessage(e));
        this.loading.set(false);
      },
    });
  }
}
