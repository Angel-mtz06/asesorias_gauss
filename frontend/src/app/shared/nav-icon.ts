import { Component, input } from '@angular/core';

export type NavIconName =
  | 'home'
  | 'book'
  | 'play'
  | 'chart'
  | 'fire'
  | 'gear'
  | 'upload'
  | 'video'
  | 'search'
  | 'bell'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'eye'
  | 'external';

/** Íconos de 15 px del diseño de Gauss (dashboard) y complementos con el mismo trazo. */
@Component({
  selector: 'app-nav-icon',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    @switch (name()) {
      @case ('home') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1L1 6.5V14h4.5V9.5h4V14H14V6.5L7.5 1z" fill="currentColor" />
        </svg>
      }
      @case ('book') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2 2h5v11l-2.5-1.5L2 13V2z" fill="currentColor" opacity=".4" />
          <path d="M7 2h6v11l-2.5-1.5L8 13V3" stroke="currentColor" stroke-width="1.2" fill="none" />
        </svg>
      }
      @case ('play') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="1" width="13" height="13" rx="2" fill="currentColor" opacity=".15" />
          <path d="M5.5 4.5l5 3-5 3V4.5z" fill="currentColor" />
        </svg>
      }
      @case ('chart') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="9" width="3" height="5" fill="currentColor" opacity=".4" />
          <rect x="6" y="5" width="3" height="9" fill="currentColor" opacity=".7" />
          <rect x="11" y="1" width="3" height="13" fill="currentColor" />
        </svg>
      }
      @case ('fire') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1C7 4 5 5 5 8c0 1.4 1.1 2.5 2.5 2.5S10 9.4 10 8c0-3-2.5-4-2.5-7z" fill="currentColor" />
          <path d="M7.5 10.5C5.8 10.5 4 12 4 13.5h7c0-1.5-1.8-3-3.5-3z" fill="currentColor" opacity=".5" />
        </svg>
      }
      @case ('gear') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" stroke-width="1.2" />
          <path
            d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M2.9 12.1l1.4-1.4M10.7 4.3l1.4-1.4"
            stroke="currentColor"
            stroke-width="1.2"
          />
        </svg>
      }
      @case ('upload') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 10V2M4.5 5l3-3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M2 10v2.5c0 .3.2.5.5.5h10c.3 0 .5-.2.5-.5V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      }
      @case ('video') {
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="3" width="9" height="9" rx="1.5" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="1.2" />
          <path d="M10 6.5l4-2.5v7l-4-2.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none" />
        </svg>
      }
      @case ('search') {
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.2" />
          <path d="M9 9l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      }
      @case ('bell') {
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2a5 5 0 015 5c0 3 1 4 1.5 5H2.5C3 12 4 11 4 7a5 5 0 015-5z" stroke="currentColor" stroke-width="1.2" fill="none" />
          <path d="M7 15a2 2 0 004 0" stroke="currentColor" stroke-width="1.2" fill="none" />
        </svg>
      }
      @case ('plus') {
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      }
      @case ('edit') {
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9.5 1.5l3 3L5 12H2v-3l7.5-7.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
        </svg>
      }
      @case ('trash') {
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5l.5 8.5h6l.5-8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
      @case ('eye') {
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 7s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.2" />
          <circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2" />
        </svg>
      }
      @case ('external') {
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M5 2H2v8h8V7M7 1h4v4M11 1L5.5 6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
    }
  `,
})
export class NavIcon {
  readonly name = input.required<NavIconName>();
}
