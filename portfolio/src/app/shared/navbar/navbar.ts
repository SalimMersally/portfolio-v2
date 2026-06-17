import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

const SECTIONS = ['about', 'experience', 'projects', 'skills', 'books'] as const;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [RouterLink, TitleCasePipe],
})
export class Navbar implements OnDestroy {
  protected readonly theme = inject(ThemeService);
  protected readonly scrolled = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly activeSection = signal('');

  readonly sections = SECTIONS;
  private scrollTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.scrollTimer !== null) clearTimeout(this.scrollTimer);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
    if (this.scrollTimer !== null) clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => this.updateActiveSection(), 16);
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
