import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { initials } from '../../core/format';
import { TeacherSession } from '../../core/teacher-session.service';
import { Logo } from '../../shared/logo';
import { NavIcon, type NavIconName } from '../../shared/nav-icon';

@Component({
  selector: 'app-teacher-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, NavIcon],
  templateUrl: './teacher-shell.html',
})
export class TeacherShell {
  protected readonly session = inject(TeacherSession);
  protected readonly initials = initials;

  protected readonly nav: { path: string; label: string; icon: NavIconName; exact: boolean }[] = [
    { path: '/profesor', label: 'Resumen', icon: 'home', exact: true },
    { path: '/profesor/videos', label: 'Mis videos', icon: 'video', exact: true },
    { path: '/profesor/videos/nuevo', label: 'Subir video', icon: 'upload', exact: true },
    { path: '/profesor/materias', label: 'Materias y unidades', icon: 'book', exact: true },
  ];

  constructor() {
    this.session.load();
  }

  protected onSelect(event: Event): void {
    this.session.select(Number((event.target as HTMLSelectElement).value));
  }
}
