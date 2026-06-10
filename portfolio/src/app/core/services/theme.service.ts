import { inject, Injectable, signal } from '@angular/core';
import { ColorMode, Theme } from '../models/theme.model';
import { SanityService } from './sanity.service';

const STORAGE_KEY = 'color-mode';

const RADIUS_MAP: Record<string, string> = {
  sharp: '0px',
  rounded: '8px',
  pill: '9999px',
};

const DENSITY_MAP: Record<string, string> = {
  compact: '0.85',
  comfortable: '1',
  spacious: '1.2',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ColorMode>('dark');

  private readonly sanity = inject(SanityService);

  async init(): Promise<void> {
    // Resolve and apply mode before the network fetch to avoid any flash.
    this.applyMode(this.resolveMode());

    const theme = await this.sanity.getTheme().catch(() => null);
    if (theme) {
      this.applyTheme(theme);
    }
  }

  toggleMode(): void {
    const next: ColorMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.applyMode(next);
    localStorage.setItem(STORAGE_KEY, next);
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

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Mode is owned by localStorage/system — never overridden by Sanity.
    if (theme.accentHue !== undefined) {
      root.style.setProperty('--accent-h', String(theme.accentHue));
    }
    if (theme.accentChroma !== undefined) {
      root.style.setProperty('--accent-c', String(theme.accentChroma));
    }

    const headingFont = theme.fontHeading ?? 'Inter';
    const bodyFont = theme.fontBody ?? 'Inter';
    const monoFont = theme.fontMono ?? 'JetBrains Mono';

    root.style.setProperty('--font-heading', `'${headingFont}', system-ui, sans-serif`);
    root.style.setProperty('--font-body', `'${bodyFont}', system-ui, sans-serif`);
    root.style.setProperty('--font-mono', `'${monoFont}', 'Courier New', monospace`);

    if (theme.borderRadius) {
      root.style.setProperty('--radius', RADIUS_MAP[theme.borderRadius] ?? '8px');
    }
    if (theme.spacing) {
      root.style.setProperty('--density', DENSITY_MAP[theme.spacing] ?? '1');
    }

    this.loadGoogleFonts([headingFont, bodyFont, monoFont]);
  }

  private loadGoogleFonts(families: string[]): void {
    const unique = [...new Set(families)];
    const params = unique
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
      .join('&');
    const href = `https://fonts.googleapis.com/css2?${params}&display=swap`;

    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }
}
