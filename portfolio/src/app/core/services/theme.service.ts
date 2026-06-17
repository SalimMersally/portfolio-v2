import { Injectable, signal } from '@angular/core';

type ColorMode = 'dark' | 'light';

const STORAGE_KEY = 'color-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ColorMode>('dark');

  init(): void {
    this.applyMode(this.resolveMode());
  }

  toggleMode(): void {
    const next: ColorMode = this.mode() === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transitioning');
    this.applyMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 500);
  }

  private resolveMode(): ColorMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  private applyMode(mode: ColorMode): void {
    this.mode.set(mode);
    if (mode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
