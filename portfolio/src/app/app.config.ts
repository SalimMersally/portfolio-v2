import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { ThemeService } from './core/services/theme.service';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    provideAppInitializer(() => inject(ThemeService).init()),
    provideAppInitializer(() => {
      const document = inject(DOCUMENT);
      const viewportScroller = inject(ViewportScroller);
      viewportScroller.setOffset(() => {
        const styles = document.defaultView?.getComputedStyle(document.documentElement);
        const navHeight = Number.parseFloat(styles?.getPropertyValue('--nav-h') ?? '') || 0;
        return [0, navHeight + 16];
      });
    }),
    provideClientHydration(),
  ],
};
