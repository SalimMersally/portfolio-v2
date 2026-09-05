import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from './theme.service';

function stubPrefersDark(prefersDark: boolean): void {
  window.matchMedia = ((query: string) =>
    ({
      matches: prefersDark && query.includes('dark'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('theme-transitioning');
    stubPrefersDark(false);
  });

  it('defaults to light when no preference is stored and the device is not dark', () => {
    const service = new ThemeService();

    service.init();

    expect(service.mode()).toBe('light');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('follows an OS dark preference when nothing is stored', () => {
    stubPrefersDark(true);
    const service = new ThemeService();

    service.init();

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('lets a stored light choice override an OS dark preference', () => {
    stubPrefersDark(true);
    localStorage.setItem('color-mode', 'light');
    const service = new ThemeService();

    service.init();

    expect(service.mode()).toBe('light');
  });

  it('restores a stored dark preference', () => {
    localStorage.setItem('color-mode', 'dark');
    const service = new ThemeService();

    service.init();

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists a toggle', () => {
    const service = new ThemeService();
    service.init();

    service.toggleMode();

    expect(service.mode()).toBe('dark');
    expect(localStorage.getItem('color-mode')).toBe('dark');
  });
});
