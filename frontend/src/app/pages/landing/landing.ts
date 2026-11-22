import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { formatDuration, LEVEL_LABEL } from '../../core/format';
import type { Video } from '../../core/models';
import { ProgressStore } from '../../core/progress.store';
import { Logo } from '../../shared/logo';
import { ProgressBar } from '../../shared/progress-bar';

interface LibraryCard {
  id: number | null;
  bg: string;
  category: string;
  title: string;
  duration: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Logo, ProgressBar],
  templateUrl: './landing.html',
})
export class Landing {
  private readonly api = inject(ApiService);
  protected readonly progress = inject(ProgressStore);

  protected readonly navItems = ['Secundaria', 'Preparatoria', 'Universidad', 'Cómo funciona', 'Precios'];

  protected readonly metrics = [
    { value: '1,240', label: 'videos propios' },
    { value: '32', label: 'materias cubiertas' },
    { value: '18k', label: 'estudiantes activos' },
  ];

  protected readonly heroProgress = [
    { subject: 'Cálculo diferencial', pct: 32 },
    { subject: 'Física II', pct: 43 },
    { subject: 'Química orgánica', pct: 18 },
  ];

  protected readonly heroStreak = [true, true, true, true, true, false, false];

  protected readonly stages = [
    {
      title: 'Secundaria',
      desc: 'Bases sólidas en matemáticas, ciencias y comprensión lectora.',
      chips: ['Álgebra', 'Biología', 'Español', '+9'],
    },
    {
      title: 'Preparatoria',
      desc: 'Cálculo, física y química, más preparación para el examen de admisión.',
      chips: ['Cálculo', 'Física', 'Química', '+15'],
    },
    {
      title: 'Universidad',
      desc: 'Ecuaciones diferenciales, estadística, programación y más.',
      chips: ['Álgebra lineal', 'Estadística', '+21'],
    },
  ];

  protected readonly calendar = Array.from({ length: 21 }, (_, i) => ({
    filled: i < 12,
    today: i === 12,
  }));

  protected readonly badges = [
    { label: '7 días', bg: 'var(--color-secondary-text)' },
    { label: '30 días', bg: 'var(--color-success-text)' },
    { label: '100 días', bg: 'var(--color-accent)' },
  ];

  protected readonly footerLinks = ['Materias', 'Precios', 'Ayuda', 'Aviso de privacidad'];

  /** Tarjetas del diseño; se reemplazan por videos reales cuando la API responde. */
  protected readonly library = signal<LibraryCard[]>([
    { id: null, bg: '#1A1F2B', category: 'Preparatoria · Cálculo', title: 'La derivada como razón de cambio', duration: '14:25' },
    { id: null, bg: '#1B5FA8', category: 'Secundaria · Álgebra', title: 'Sistemas de ecuaciones 2×2', duration: '08:40' },
    { id: null, bg: '#4A90E2', category: 'Universidad · Estadística', title: 'Distribución normal y estandarización', duration: '21:05' },
  ]);
  protected readonly sampleId = signal<number | null>(null);

  constructor() {
    const wanted = ['La derivada como razón de cambio', 'Sistemas de ecuaciones 2×2', 'Distribución normal y estandarización'];
    this.api.videos({ status: 'published' }).subscribe({
      next: (videos) => {
        if (!videos.length) return;
        const picked = wanted
          .map((t) => videos.find((v) => v.title === t))
          .filter((v): v is Video => !!v);
        const cards = (picked.length === 3 ? picked : videos.slice(0, 3)).map((v) => this.toCard(v));
        this.library.set(cards);
        this.sampleId.set(cards[0]?.id ?? null);
      },
      error: () => {
        /* Sin API se muestran las tarjetas estáticas del diseño. */
      },
    });
  }

  protected status(card: LibraryCard): { text: string; className: string } {
    if (card.id !== null && this.progress.isWatched(card.id)) {
      return { text: 'Completada', className: 'text-success-text' };
    }
    return { text: 'Sin empezar', className: 'text-ink-subtle' };
  }

  private toCard(v: Video): LibraryCard {
    const subject = v.unit?.subject;
    return {
      id: v.id,
      bg: subject?.color ?? '#1A1F2B',
      category: subject ? `${LEVEL_LABEL[subject.level]} · ${subject.name}` : 'Videoclase',
      title: v.title,
      duration: formatDuration(v.durationSeconds),
    };
  }
}
