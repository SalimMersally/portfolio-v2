import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  function createService(platformId = 'browser'): ThemeService {
    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.inject(ThemeService);
  }

  it('defaults to light when no preference is stored and the device is not dark', () => {
    const service = createService();

    service.init();

    expect(service.mode()).toBe('light');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('follows an OS dark preference when nothing is stored', () => {
    stubPrefersDark(true);
    const service = createService();

    service.init();

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('lets a stored light choice override an OS dark preference', () => {
    stubPrefersDark(true);
    localStorage.setItem('color-mode', 'light');
    const service = createService();

    service.init();

    expect(service.mode()).toBe('light');
  });

  it('restores a stored dark preference', () => {
    localStorage.setItem('color-mode', 'dark');
    const service = createService();

    service.init();

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists a toggle', () => {
    const service = createService();
    service.init();

    service.toggleMode();

    expect(service.mode()).toBe('dark');
    expect(localStorage.getItem('color-mode')).toBe('dark');
  });

  it('does not read browser storage while initializing on the server', () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const service = createService('server');

    service.init();

    expect(service.mode()).toBe('light');
    expect(storageRead).not.toHaveBeenCalled();
  });
});
