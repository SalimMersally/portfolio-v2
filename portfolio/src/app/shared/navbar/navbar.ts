import { Component, HostListener, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

const SECTIONS = ['experience', 'skills', 'projects', 'books'] as const;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [RouterLink, TitleCasePipe],
})
export class Navbar {
  protected readonly theme = inject(ThemeService);
  protected readonly scrolled = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly activeSection = signal('');

  readonly sections = SECTIONS;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
    this.updateActiveSection();
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  private updateActiveSection(): void {
    const scrollY = window.scrollY + 120;
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        this.activeSection.set(id);
        return;
      }
    }
    this.activeSection.set('');
  }
}
