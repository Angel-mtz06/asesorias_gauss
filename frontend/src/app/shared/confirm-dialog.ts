import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/** Diálogo modal de confirmación con <dialog> nativo (foco atrapado y Esc incluidos). */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <dialog
      #dlg
      class="m-auto w-[min(92vw,420px)] overscroll-contain rounded-xl border border-line bg-white p-0 shadow-xl backdrop:bg-ink/40"
      [attr.aria-labelledby]="'dlg-title'"
      (close)="cancel.emit()"
    >
      <div class="p-5">
        <h2 id="dlg-title" class="mb-1.5 font-display text-base font-semibold text-ink">{{ title() }}</h2>
        <p class="text-sm leading-relaxed text-ink-muted">{{ message() }}</p>
      </div>
      <div class="flex justify-end gap-2 border-t border-line bg-surface px-5 py-3">
        <button type="button" class="btn-ghost" (click)="dlg.close()">Cancelar</button>
        <button type="button" class="btn-danger" [disabled]="busy()" (click)="confirm.emit()">
          {{ busy() ? 'Eliminando…' : confirmLabel() }}
        </button>
      </div>
    </dialog>
  `,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('¿Estás seguro?');
  readonly message = input('');
  readonly confirmLabel = input('Eliminar');
  readonly busy = input(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const el = this.dlg().nativeElement;
      if (this.open() && !el.open) el.showModal();
      if (!this.open() && el.open) el.close();
    });
  }
}
