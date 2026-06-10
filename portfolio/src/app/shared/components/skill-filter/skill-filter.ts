import { Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { FilterService } from '../../../core/services/filter.service';

@Component({
  selector: 'app-skill-filter',
  templateUrl: './skill-filter.html',
  styleUrl: './skill-filter.scss',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class SkillFilter {
  readonly skills = input.required<string[]>();

  protected readonly filter = inject(FilterService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly isOpen = signal(false);
  protected readonly search = signal('');

  protected readonly visibleSkills = computed(() => {
    const q = this.search().toLowerCase().trim();
    return q ? this.skills().filter((s) => s.toLowerCase().includes(q)) : this.skills();
  });

  protected toggleDropdown(): void {
    this.isOpen.update((v) => !v);
    if (!this.isOpen()) this.search.set('');
  }

  protected onDocumentClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) {
      this.isOpen.set(false);
      this.search.set('');
    }
  }
}
