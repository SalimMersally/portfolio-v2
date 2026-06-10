import { Component, inject, resource } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [RevealDirective],
})
export class Contact {
  private readonly sanity = inject(SanityService);
  readonly settings = resource({ loader: () => this.sanity.getSiteSettings() });
}
