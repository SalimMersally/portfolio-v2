import { Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-tag-filter',
  templateUrl: './tag-filter.html',
  styleUrl: './tag-filter.scss',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class TagFilter {
  readonly tags = input.required<string[]>();
  readonly selected = input.required<string[]>();
  readonly selectedChange = output<string[]>();

  private readonly host = inject(ElementRef<HTMLElement>);
  readonly isOpen = signal(false);
  readonly search = signal('');
  readonly panelLeft = signal('0');

  readonly visibleTags = computed(() => {
    const q = this.search().toLowerCase().trim();
    return q ? this.tags().filter((t) => t.toLowerCase().includes(q)) : this.tags();
  });

  toggle(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.adjustPanel();
    } else {
      this.search.set('');
      this.panelLeft.set('0');
    }
  }

  private adjustPanel(): void {
    const PANEL_W = 240; // matches CSS width
    const rootEl = this.host.nativeElement.firstElementChild as HTMLElement;
    const rootLeft = rootEl.getBoundingClientRect().left;
    const vpWidth = window.visualViewport?.width ?? window.innerWidth;
    const overflow = rootLeft + PANEL_W - (vpWidth - 16);
    this.panelLeft.set(overflow > 0 ? `${-overflow}px` : '0');
  }

  toggleTag(tag: string): void {
    const sel = this.selected();
    this.selectedChange.emit(sel.includes(tag) ? sel.filter((t) => t !== tag) : [...sel, tag]);
  }

  clear(): void {
    this.selectedChange.emit([]);
  }

  clearAndStop(e: Event): void {
    e.stopPropagation();
    this.clear();
  }

  onDocumentClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) {
      this.isOpen.set(false);
      this.search.set('');
      this.panelLeft.set('0');
    }
  }
}
