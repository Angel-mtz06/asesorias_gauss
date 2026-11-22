import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  host: { class: 'block' },
  template: `
    <div
      class="overflow-hidden rounded-full bg-line"
      [style.height.px]="height()"
      role="progressbar"
      [attr.aria-valuenow]="clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label() || null"
    >
      <div
        class="h-full rounded-full transition-[width] duration-500"
        [style.width.%]="clamped()"
        [style.background-color]="color()"
      ></div>
    </div>
  `,
})
export class ProgressBar {
  readonly value = input.required<number>();
  readonly color = input('var(--color-primary)');
  readonly height = input(6);
  readonly label = input('');
  protected readonly clamped = computed(() => Math.min(100, Math.max(0, Math.round(this.value()))));
}
