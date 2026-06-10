import { Component, inject, resource, signal } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { formatDate, initials } from '../../shared/utils/format-date';

@Component({
  selector: 'app-education',
  templateUrl: './education.html',
  styleUrl: './education.scss',
  imports: [RevealDirective],
  host: { '(document:keydown.escape)': 'closeCredential()' },
})
export class EducationSection {
  private readonly sanity = inject(SanityService);
  readonly items = resource({ loader: () => this.sanity.getEducation() });
  readonly formatDate = formatDate;
  readonly initials = initials;

  readonly activeCredential = signal<string | null>(null);

  openCredential(url: string): void {
    this.activeCredential.set(url);
  }

  closeCredential(): void {
    this.activeCredential.set(null);
  }
}
