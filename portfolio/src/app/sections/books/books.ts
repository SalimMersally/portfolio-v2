import { Component, computed, inject, resource } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { initials } from '../../shared/utils/format-date';

@Component({
  selector: 'app-books',
  templateUrl: './books.html',
  styleUrl: './books.scss',
  imports: [RevealDirective],
})
export class Books {
  private readonly sanity = inject(SanityService);
  private readonly data = resource({ loader: () => this.sanity.getBooks() });

  readonly currentlyReading = computed(() => (this.data.value() ?? []).filter((b) => b.status === 'reading'));
  readonly haveRead = computed(() => (this.data.value() ?? []).filter((b) => b.status === 'read'));

  readonly initials = initials;
}
