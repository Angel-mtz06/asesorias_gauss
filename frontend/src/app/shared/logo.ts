import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a [routerLink]="link()" class="flex items-center gap-2.5 rounded-md" aria-label="Asesorías Gauss, inicio">
      <span class="flex size-7 items-center justify-center rounded-full bg-primary" aria-hidden="true">
        <span class="text-xs font-bold text-white">G</span>
      </span>
      <span class="font-display text-sm font-semibold whitespace-nowrap text-ink" translate="no">Asesorías Gauss</span>
    </a>
  `,
})
export class Logo {
  readonly link = input<string>('/');
}
