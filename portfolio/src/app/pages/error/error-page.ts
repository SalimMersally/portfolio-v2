import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ServerResponseService } from '../../core/services/server-response.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly response = inject(ServerResponseService);

  constructor() {
    this.response.setStatus(503);
    this.seo.setNoIndex(
      'Temporarily unavailable — Salim Al Mersally',
      'The site is temporarily unavailable. Please try again shortly.',
    );
  }

  retry(): void {
    this.router.navigate(['/']);
  }
}
