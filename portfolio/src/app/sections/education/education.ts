import { Component, input, signal } from '@angular/core';
import { Education } from '../../core/models/education.model';
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
  readonly items = input.required<Education[]>();
  readonly formatDate = formatDate;
  readonly initials = initials;

  readonly activeCredential = signal<string | null>(null);

  openCredential(url: string | undefined): void {
    if (url) this.activeCredential.set(url);
  }

  closeCredential(): void {
    this.activeCredential.set(null);
  }
}
