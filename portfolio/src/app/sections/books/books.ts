import { Component, computed, input } from '@angular/core';
import { Book } from '../../core/models/book.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-books',
  templateUrl: './books.html',
  styleUrl: './books.scss',
  imports: [RevealDirective],
})
export class Books {
  readonly books = input.required<Book[]>();

  readonly currentlyReading = computed(() => this.books().filter((b) => b.status === 'reading'));
  readonly haveRead = computed(() => this.books().filter((b) => b.status === 'read'));
}
