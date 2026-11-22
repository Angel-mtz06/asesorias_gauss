import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { formatDuration, youTubeEmbedUrl } from '../core/format';

const SPEEDS = [1, 1.25, 1.5, 2];

/**
 * Reproductor con los controles del diseño (play central, barra de progreso,
 * tiempo, velocidad, CC y pantalla completa). Si la URL es de YouTube usa su embed.
 */
@Component({
  selector: 'app-video-player',
  host: { class: 'block' },
  template: `
    <div
      #frame
      class="group relative w-full overflow-hidden bg-player"
      [class.aspect-video]="true"
      [style.max-height]="maxHeight()"
    >
      @if (embedUrl(); as embed) {
        <iframe
          class="absolute inset-0 size-full"
          [src]="embed"
          [title]="title()"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      } @else {
        <video
          #video
          class="absolute inset-0 size-full object-contain"
          [src]="src()"
          [attr.poster]="poster() || null"
          preload="metadata"
          playsinline
          (click)="toggle()"
          (play)="playing.set(true)"
          (pause)="onPause()"
          (timeupdate)="onTime()"
          (loadedmetadata)="onMeta()"
          (waiting)="buffering.set(true)"
          (playing)="buffering.set(false)"
          (ended)="onEnded()"
          (error)="failed.set(true)"
        ></video>

        @if (failed()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
            <p class="text-sm font-semibold">No se pudo cargar el video</p>
            <p class="max-w-md text-xs break-all text-white/70">{{ src() }}</p>
          </div>
        } @else {
          <!-- Play / pausa central -->
          <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200"
            [class.opacity-0]="playing() && !buffering()"
            [class.group-hover:opacity-100]="playing()"
          >
            <button
              type="button"
              class="pointer-events-auto flex size-14 items-center justify-center rounded-full border-2 border-white/45 bg-white/15 transition-opacity hover:opacity-80"
              [attr.aria-label]="playing() ? 'Pausar' : 'Reproducir'"
              (click)="toggle()"
            >
              @if (playing()) {
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="5" height="18" rx="1.5" fill="white" />
                  <rect x="12" y="1" width="5" height="18" rx="1.5" fill="white" />
                </svg>
              } @else {
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
                  <path d="M1 1l14 9-14 9V1z" fill="white" />
                </svg>
              }
            </button>
          </div>

          <!-- Controles inferiores -->
          <div
            class="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-b from-transparent to-black/70 px-4 pt-8 pb-3"
          >
            <input
              type="range"
              class="scrubber w-full"
              min="0"
              [max]="duration() || 0"
              step="0.1"
              [value]="current()"
              [style.--pct]="percent() + '%'"
              aria-label="Posición del video"
              [attr.aria-valuetext]="timeLabel()"
              (input)="seek($event)"
            />
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 text-white">
                <button type="button" [attr.aria-label]="playing() ? 'Pausar' : 'Reproducir'" (click)="toggle()">
                  @if (playing()) {
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
                      <rect x="0" y="0" width="4" height="16" rx="1" fill="white" />
                      <rect x="9" y="0" width="4" height="16" rx="1" fill="white" />
                    </svg>
                  } @else {
                    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
                      <path d="M1 1l10 7-10 7V1z" fill="white" />
                    </svg>
                  }
                </button>
                <span class="tabular text-xs text-white/85">{{ timeLabel() }}</span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="tabular rounded border border-white/45 px-2 py-0.5 text-xs text-white"
                  aria-label="Cambiar velocidad de reproducción"
                  (click)="cycleSpeed()"
                >
                  {{ speedLabel() }}
                </button>
                <button
                  type="button"
                  class="text-xs font-medium text-white/50"
                  disabled
                  title="Subtítulos próximamente"
                  aria-label="Subtítulos (no disponibles)"
                >
                  CC
                </button>
                <button type="button" class="text-white/85" aria-label="Pantalla completa" (click)="fullscreen()">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"
                      stroke="white"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .scrubber {
      appearance: none;
      height: 6px;
      border-radius: 999px;
      background: linear-gradient(
        to right,
        var(--color-primary) var(--pct, 0%),
        rgb(255 255 255 / 0.25) var(--pct, 0%)
      );
      cursor: pointer;
    }
    .scrubber::-webkit-slider-thumb {
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: white;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
    }
    .scrubber::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border: 0;
      border-radius: 999px;
      background: white;
    }
  `,
})
export class VideoPlayer {
  private readonly sanitizer = inject(DomSanitizer);

  readonly src = input.required<string>();
  readonly title = input('Videoclase');
  readonly poster = input<string | null>(null);
  readonly maxHeight = input<string | null>('420px');

  /** Se emite al llegar al 90 % o al terminar (para marcar la lección como vista). */
  readonly completed = output<void>();
  /** Se emite la primera vez que se reproduce (para contar la vista). */
  readonly started = output<void>();
  /** Fracción reproducida (0-1), emitida como máximo cada 5 s y al pausar. */
  readonly progressed = output<number>();
  /** Duración real detectada en el archivo. */
  readonly durationDetected = output<number>();

  private readonly videoEl = viewChild<ElementRef<HTMLVideoElement>>('video');
  private readonly frameEl = viewChild<ElementRef<HTMLDivElement>>('frame');

  protected readonly playing = signal(false);
  protected readonly buffering = signal(false);
  protected readonly failed = signal(false);
  protected readonly current = signal(0);
  protected readonly duration = signal(0);
  protected readonly speed = signal(1);
  private completedEmitted = false;
  private startedEmitted = false;
  private lastProgressAt = 0;

  protected readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const url = youTubeEmbedUrl(this.src());
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  protected readonly percent = computed(() => (this.duration() ? (this.current() / this.duration()) * 100 : 0));
  protected readonly timeLabel = computed(
    () => `${formatDuration(this.current())} / ${formatDuration(this.duration())}`,
  );
  protected readonly speedLabel = computed(() => `${this.speed()}×`);

  constructor() {
    // Reinicia el estado cuando cambia el video.
    effect(() => {
      this.src();
      this.playing.set(false);
      this.failed.set(false);
      this.current.set(0);
      this.duration.set(0);
      this.completedEmitted = false;
      this.startedEmitted = false;
    });
  }

  protected toggle(): void {
    const v = this.videoEl()?.nativeElement;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => this.failed.set(true));
      if (!this.startedEmitted) {
        this.startedEmitted = true;
        this.started.emit();
      }
    } else {
      v.pause();
    }
  }

  protected onTime(): void {
    const v = this.videoEl()?.nativeElement;
    if (!v) return;
    this.current.set(v.currentTime);
    const now = Date.now();
    if (v.duration && now - this.lastProgressAt > 5000) {
      this.lastProgressAt = now;
      this.progressed.emit(v.currentTime / v.duration);
    }
    if (!this.completedEmitted && v.duration && v.currentTime / v.duration >= 0.9) {
      this.completedEmitted = true;
      this.completed.emit();
    }
  }

  protected onMeta(): void {
    const v = this.videoEl()?.nativeElement;
    if (!v) return;
    this.duration.set(v.duration);
    v.playbackRate = this.speed();
    if (Number.isFinite(v.duration)) this.durationDetected.emit(Math.round(v.duration));
  }

  protected onPause(): void {
    this.playing.set(false);
    const v = this.videoEl()?.nativeElement;
    if (v?.duration) this.progressed.emit(v.currentTime / v.duration);
  }

  protected onEnded(): void {
    this.playing.set(false);
    if (!this.completedEmitted) {
      this.completedEmitted = true;
      this.completed.emit();
    }
  }

  protected seek(event: Event): void {
    const v = this.videoEl()?.nativeElement;
    if (!v) return;
    v.currentTime = Number((event.target as HTMLInputElement).value);
  }

  protected cycleSpeed(): void {
    const next = SPEEDS[(SPEEDS.indexOf(this.speed()) + 1) % SPEEDS.length];
    this.speed.set(next);
    const v = this.videoEl()?.nativeElement;
    if (v) v.playbackRate = next;
  }

  protected fullscreen(): void {
    const el = this.frameEl()?.nativeElement;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }
}
