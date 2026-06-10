import { Component, inject, resource } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.html',
  styleUrl: './introduction.scss',
})
export class Introduction {
  private readonly sanity = inject(SanityService);
  protected readonly settings = resource({ loader: () => this.sanity.getSiteSettings() });
}
