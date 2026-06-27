import { Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';

export interface CalDay {
  iso: string;
  day: number;
  current: boolean;
  today: boolean;
}

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.scss',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class DateRangePicker {
  readonly from = input('');
  readonly to = input('');
  readonly fromChange = output<string>();
  readonly toChange = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);

  readonly isOpen = signal(false);
  readonly panelLeft = signal('0');
  readonly pendingFrom = signal('');
  readonly hovered = signal('');
  readonly viewYear = signal(new Date().getFullYear());
  readonly viewMonth = signal(new Date().getMonth());

  readonly weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  readonly hasValue = computed(() => !!this.from() || !!this.to());

  readonly activePreset = computed((): number | null => {
    const f = this.from();
    const t = this.to();
    if (!f || !t) return null;
    const today = this.isoOf(new Date());
    if (t !== today) return null;
    for (const days of [1, 7, 30]) {
      const past = new Date();
      past.setDate(past.getDate() - days);
      if (f === this.isoOf(past)) return days;
    }
    return null;
  });

  readonly label = computed(() => {
    const f = this.from();
    const t = this.to();
    if (!f && !t) return 'Date range';
    if (f && t) return `${this.fmt(f)} → ${this.fmt(t)}`;
    if (f) return `From ${this.fmt(f)}`;
    return `Until ${this.fmt(t)}`;
  });

  readonly viewLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth(), 1).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    }),
  );

  readonly calendarDays = computed((): CalDay[] => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const todayIso = this.isoOf(new Date());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Mon

    const days: CalDay[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ iso: this.isoOf(d), day: d.getDate(), current: false, today: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = this.isoOf(date);
      days.push({ iso, day: d, current: true, today: iso === todayIso });
    }

    // Fill to complete last row
    const total = Math.ceil(days.length / 7) * 7;
    let next = 1;
    while (days.length < total) {
      const d = new Date(year, month + 1, next++);
      days.push({ iso: this.isoOf(d), day: d.getDate(), current: false, today: false });
    }

    return days;
  });

  // Effective display range: pending preview takes priority over committed
  readonly effectiveRange = computed((): { start: string; end: string } => {
    const pending = this.pendingFrom();
    const hov = this.hovered();

    if (pending) {
      const other = hov && hov !== pending ? hov : '';
      if (!other) return { start: pending, end: '' };
      return pending <= other ? { start: pending, end: other } : { start: other, end: pending };
    }
    return { start: this.from(), end: this.to() };
  });

  isStart(day: CalDay): boolean {
    const { start, end } = this.effectiveRange();
    return !!start && !!end && start !== end && day.iso === start;
  }

  isEnd(day: CalDay): boolean {
    const { start, end } = this.effectiveRange();
    return !!start && !!end && start !== end && day.iso === end;
  }

  isInRange(day: CalDay): boolean {
    const { start, end } = this.effectiveRange();
    return !!start && !!end && start !== end && day.iso > start && day.iso < end;
  }

  isSingle(day: CalDay): boolean {
    const { start, end } = this.effectiveRange();
    return !!start && day.iso === start && (!end || end === start);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      const f = this.from();
      if (f) {
        const d = new Date(f + 'T00:00:00');
        this.viewYear.set(d.getFullYear());
        this.viewMonth.set(d.getMonth());
      }
      this.pendingFrom.set('');
      this.hovered.set('');
      this.adjustPanel();
      this.isOpen.set(true);
    }
  }

  private adjustPanel(): void {
    const PANEL_W = 288; // matches CSS width
    const rootEl = this.host.nativeElement.firstElementChild as HTMLElement;
    const rootLeft = rootEl.getBoundingClientRect().left;
    const vpWidth = window.visualViewport?.width ?? window.innerWidth;
    const overflow = rootLeft + PANEL_W - (vpWidth - 16);
    this.panelLeft.set(overflow > 0 ? `${-overflow}px` : '0');
  }

  prevMonth(): void {
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update((y) => y - 1);
    } else {
      this.viewMonth.update((m) => m - 1);
    }
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update((y) => y + 1);
    } else {
      this.viewMonth.update((m) => m + 1);
    }
  }

  clickDay(iso: string): void {
    const pending = this.pendingFrom();
    if (!pending) {
      this.pendingFrom.set(iso);
      this.hovered.set(iso);
    } else {
      const [f, t] = iso >= pending ? [pending, iso] : [iso, pending];
      this.fromChange.emit(f);
      this.toChange.emit(t);
      this.close();
    }
  }

  hoverDay(iso: string): void {
    if (this.pendingFrom()) this.hovered.set(iso);
  }

  selectPreset(days: number): void {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    this.fromChange.emit(this.isoOf(past));
    this.toChange.emit(this.isoOf(today));
    this.close();
  }

  clear(): void {
    this.fromChange.emit('');
    this.toChange.emit('');
    this.close();
  }

  clearAndStop(e: MouseEvent): void {
    e.stopPropagation();
    this.clear();
  }

  private close(): void {
    this.pendingFrom.set('');
    this.hovered.set('');
    this.isOpen.set(false);
    this.panelLeft.set('0');
  }

  private isoOf(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private fmt(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  }

  onDocumentClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.close();
  }
}
