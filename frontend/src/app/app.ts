import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScreenSwitcher } from './shared/screen-switcher';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScreenSwitcher],
  template: `
    <a
      href="#main"
      class="sr-only z-[200] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Saltar al contenido
    </a>
    <router-outlet />
    <app-screen-switcher />
  `,
})
export class App {}
