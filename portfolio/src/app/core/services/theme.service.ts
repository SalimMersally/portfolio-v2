import { Injectable, signal } from '@angular/core';

type ColorMode = 'dark' | 'light';

const STORAGE_KEY = 'color-mode';
// Must exceed --t-slow in _variables.scss.
const TRANSITION_MS = 600;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ColorMode>('light');
  private transitionTimer?: ReturnType<typeof setTimeout>;

  init(): void {
    this.applyMode(this.resolveMode());
  }

  toggleMode(): void {
    const next: ColorMode = this.mode() === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transitioning');
    // Flush the class before the attribute flips, so the new colours animate
    // from the old ones instead of being painted straight away.
    void document.documentElement.offsetHeight;
    this.applyMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    clearTimeout(this.transitionTimer);
    // Outlast --t-slow (500ms); removing the class mid-transition snaps colours.
    this.transitionTimer = setTimeout(
      () => document.documentElement.classList.remove('theme-transitioning'),
      TRANSITION_MS,
    );
  }

  private resolveMode(): ColorMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // No stored choice: follow the device. Warm Paper is still the design's
    // default, so anything other than an explicit OS dark preference is light.
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyMode(mode: ColorMode): void {
    this.mode.set(mode);
    if (mode === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }
}
