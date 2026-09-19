import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ServerResponseService } from '../../core/services/server-response.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly response = inject(ServerResponseService);

  constructor() {
    this.response.setStatus(404);
    this.seo.setNoIndex(
      'Page not found — Salim Al Mersally',
      'The requested page could not be found.',
    );
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
