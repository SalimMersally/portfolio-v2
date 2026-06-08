import { inject, Injectable, signal } from '@angular/core';
import { ColorMode, Theme } from '../models/theme.model';
import { SanityService } from './sanity.service';

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
    const theme = await this.sanity.getTheme().catch(() => null);
    if (theme) {
      this.applyTheme(theme);
    }
  }

  toggleMode(): void {
    const next: ColorMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.mode.set(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const mode = theme.defaultMode ?? 'dark';
    this.mode.set(mode);
    root.setAttribute('data-theme', mode);

    if (theme.colorAccent) root.style.setProperty('--color-accent', theme.colorAccent);
    if (theme.colorBg) root.style.setProperty('--color-bg', theme.colorBg);
    if (theme.colorSurface) root.style.setProperty('--color-surface', theme.colorSurface);
    if (theme.colorText) root.style.setProperty('--color-text', theme.colorText);
    if (theme.colorTextMuted) root.style.setProperty('--color-text-muted', theme.colorTextMuted);

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
