import { Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.scss',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class CustomSelect {
  readonly options = input.required<SelectOption[]>();
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  readonly isOpen = signal(false);

  readonly selectedLabel = computed(
    () => this.options().find((o) => o.value === this.value())?.label ?? '—',
  );

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  select(val: string): void {
    this.valueChange.emit(val);
    this.isOpen.set(false);
  }

  onDocumentClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.isOpen.set(false);
  }
}
