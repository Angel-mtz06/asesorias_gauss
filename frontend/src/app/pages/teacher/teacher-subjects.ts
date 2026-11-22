import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, apiErrorMessage } from '../../core/api.service';
import { formatHours, LEVEL_LABEL } from '../../core/format';
import { LEVELS, type Level, type SubjectSummary, type UnitWithVideos } from '../../core/models';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { NavIcon } from '../../shared/nav-icon';

const COLORS = ['#1B5FA8', '#4A90E2', '#1A1F2B', '#2E9E6D', '#D62839', '#22262B'];

type PendingDelete = { kind: 'subject'; id: number; name: string } | { kind: 'unit'; id: number; name: string };

@Component({
  selector: 'app-teacher-subjects',
  imports: [ReactiveFormsModule, NavIcon, ConfirmDialog],
  templateUrl: './teacher-subjects.html',
})
export class TeacherSubjects {
  private readonly api = inject(ApiService);
  protected readonly levels = LEVELS;
  protected readonly levelLabel = LEVEL_LABEL;
  protected readonly colors = COLORS;
  protected readonly formatHours = formatHours;

  protected readonly subjects = signal<SubjectSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly expandedId = signal<number | null>(null);
  protected readonly units = signal<UnitWithVideos[]>([]);
  protected readonly unitsLoading = signal(false);
  protected readonly newUnit = signal('');
  protected readonly editingUnitId = signal<number | null>(null);
  protected readonly editingTitle = signal('');

  protected readonly showCreate = signal(false);
  protected readonly creating = signal(false);
  protected readonly createSubmitted = signal(false);
  protected readonly createForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    level: new FormControl<Level>('preparatoria', { nonNullable: true }),
    color: new FormControl(COLORS[0], { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  protected readonly pendingDelete = signal<PendingDelete | null>(null);
  protected readonly deleting = signal(false);

  protected readonly grouped = computed(() =>
    LEVELS.map((l) => ({ ...l, items: this.subjects().filter((s) => s.level === l.id) })),
  );

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.subjects().subscribe({
      next: (s) => {
        this.subjects.set(s);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.loading.set(false);
      },
    });
  }

  protected toggle(subject: SubjectSummary): void {
    if (this.expandedId() === subject.id) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(subject.id);
    this.loadUnits(subject.id);
  }

  protected createSubject(): void {
    this.createSubmitted.set(true);
    if (this.createForm.invalid) return;
    this.creating.set(true);
    const v = this.createForm.getRawValue();
    this.api.createSubject({ ...v, name: v.name.trim(), description: v.description.trim() }).subscribe({
      next: (s) => {
        this.creating.set(false);
        this.showCreate.set(false);
        this.createSubmitted.set(false);
        this.createForm.reset({ name: '', level: v.level, color: COLORS[0], description: '' });
        this.load();
        this.expandedId.set(s.id);
        this.loadUnits(s.id);
      },
      error: (e) => {
        this.creating.set(false);
        this.error.set(apiErrorMessage(e));
      },
    });
  }

  protected addUnit(subjectId: number): void {
    const title = this.newUnit().trim();
    if (title.length < 2) return;
    this.api.createUnit(subjectId, title).subscribe({
      next: () => {
        this.newUnit.set('');
        this.loadUnits(subjectId);
        this.load();
      },
      error: (e) => this.error.set(apiErrorMessage(e)),
    });
  }

  protected startEdit(unit: UnitWithVideos): void {
    this.editingUnitId.set(unit.id);
    this.editingTitle.set(unit.title);
  }

  protected saveUnit(unit: UnitWithVideos): void {
    const title = this.editingTitle().trim();
    if (title.length < 2 || title === unit.title) {
      this.editingUnitId.set(null);
      return;
    }
    this.api.updateUnit(unit.id, { title }).subscribe({
      next: (u) => {
        this.units.update((list) => list.map((x) => (x.id === u.id ? { ...x, title: u.title } : x)));
        this.editingUnitId.set(null);
      },
      error: (e) => this.error.set(apiErrorMessage(e)),
    });
  }

  protected confirmDelete(): void {
    const p = this.pendingDelete();
    if (!p) return;
    this.deleting.set(true);
    const req = p.kind === 'subject' ? this.api.deleteSubject(p.id) : this.api.deleteUnit(p.id);
    req.subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        if (p.kind === 'subject' && this.expandedId() === p.id) this.expandedId.set(null);
        const expanded = this.expandedId();
        if (p.kind === 'unit' && expanded) this.loadUnits(expanded);
        this.load();
      },
      error: (e) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.error.set(apiErrorMessage(e));
      },
    });
  }

  protected deleteMessage(): string {
    const p = this.pendingDelete();
    if (!p) return '';
    return p.kind === 'subject'
      ? `Se eliminará la materia «${p.name}» con todas sus unidades y videos. No se puede deshacer.`
      : `Se eliminará la unidad «${p.name}» y todos sus videos. No se puede deshacer.`;
  }

  private loadUnits(subjectId: number): void {
    this.unitsLoading.set(true);
    this.api.subject(subjectId, true).subscribe({
      next: (s) => {
        this.units.set(s.units);
        this.unitsLoading.set(false);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e));
        this.unitsLoading.set(false);
      },
    });
  }
}
