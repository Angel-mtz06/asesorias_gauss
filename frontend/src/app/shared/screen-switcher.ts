import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Píldora flotante del prototipo de Figma para saltar entre pantallas. */
@Component({
  selector: 'app-screen-switcher',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      aria-label="Pantallas del prototipo"
      class="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-dock px-2 py-1.5 shadow-lg"
    >
      @for (s of screens; track s.path) {
        <a
          [routerLink]="s.path"
          routerLinkActive="!bg-primary !text-white"
          [routerLinkActiveOptions]="{ exact: s.exact }"
          class="rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap text-white/70 transition-colors hover:text-white"
        >
          {{ s.label }}
        </a>
      }
    </nav>
  `,
})
export class ScreenSwitcher {
  protected readonly screens = [
    { path: '/', label: 'Landing', exact: true },
    { path: '/inicio', label: 'Dashboard', exact: true },
    { path: '/clase', label: 'Reproductor', exact: false },
    { path: '/profesor', label: 'Profesor', exact: false },
  ];
}
