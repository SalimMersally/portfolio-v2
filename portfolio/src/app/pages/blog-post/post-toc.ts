import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface TocItem {
  id: string;
  text: string;
  children: TocItem[];
}

export type TocSection = TocItem;

@Component({
  selector: 'app-post-toc',
  templateUrl: './post-toc.html',
  styleUrl: './post-toc.scss',
  imports: [RouterLink],
})
export class PostToc {
  readonly sections = input.required<TocSection[]>();
  readonly entryCount = input.required<number>();
  readonly postSlug = input.required<string>();
  readonly open = signal(false);

  toggle(): void {
    this.open.update((open) => !open);
  }
}
