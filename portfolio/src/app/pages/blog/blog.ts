import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogSeries, BlogSummary } from '../../core/models/blog-summary.model';
import { SanityService } from '../../core/services/sanity.service';
import { formatDate as formatDateShortFn, formatDateFull } from '../../shared/utils/format-date';
import { CustomSelect, SelectOption } from '../../shared/components/custom-select/custom-select';
import { TagFilter } from '../../shared/components/tag-filter/tag-filter';
import { DateRangePicker } from '../../shared/components/date-range-picker/date-range-picker';
import { LoadingDots } from '../../shared/components/loading-dots/loading-dots';

type DisplayItem =
  | {
      type: 'series';
      seriesId: string;
      series: BlogSeries;
      parts: BlogSummary[];
      matchingParts: BlogSummary[];
      latestDate: string;
    }
  | { type: 'blog'; blog: BlogSummary };

@Component({
  selector: 'app-blog',
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
  imports: [RouterLink, CustomSelect, TagFilter, DateRangePicker, LoadingDots],
})
export class Blog implements OnInit, OnDestroy {
  private readonly sanity = inject(SanityService);

  private readonly mql =
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)') : null;
  private readonly onMql = (e: MediaQueryListEvent) => this.tagLimit.set(e.matches ? 2 : 4);
  readonly tagLimit = signal(this.mql?.matches ? 2 : 4);

  constructor() {
    this.mql?.addEventListener('change', this.onMql);
  }
  ngOnDestroy() {
    this.mql?.removeEventListener('change', this.onMql);
  }

  readonly blogs = signal<BlogSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly search = signal('');
  readonly activeTags = signal<string[]>([]);
  readonly sort = signal<'newest' | 'oldest'>('newest');
  readonly pageSize = signal(10);
  readonly page = signal(1);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly expandedSeries = signal<Set<string>>(new Set());

  readonly sortOptions: SelectOption[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
  ];

  readonly pageSizeOptions: SelectOption[] = [
    { value: '5', label: '5 / page' },
    { value: '10', label: '10 / page' },
    { value: '20', label: '20 / page' },
  ];

  readonly pageSizeString = computed(() => String(this.pageSize()));

  readonly allTags = computed(() => {
    const seen = new Set<string>();
    this.blogs().forEach((b) => b.tags?.forEach((t) => seen.add(t)));
    return [...seen].sort();
  });

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const tags = this.activeTags();
    const from = this.dateFrom();
    const to = this.dateTo();
    return this.blogs().filter((b) => {
      if (
        q &&
        !b.title.toLowerCase().includes(q) &&
        !b.description?.toLowerCase().includes(q) &&
        !b.tags?.some((t) => t.toLowerCase().includes(q))
      )
        return false;
      if (tags.length && !tags.some((t) => b.tags?.includes(t))) return false;
      if (from && b.publishedAt.slice(0, 10) < from) return false;
      if (to && b.publishedAt.slice(0, 10) > to) return false;
      return true;
    });
  });

  readonly displayed = computed((): DisplayItem[] => {
    const filtered = this.filtered();
    const filteredIds = new Set(filtered.map((b) => b._id));

    const seriesMap = new Map<string, BlogSummary[]>();
    for (const blog of this.blogs()) {
      if (blog.series) {
        const key = blog.series._id;
        if (!seriesMap.has(key)) seriesMap.set(key, []);
        seriesMap.get(key)!.push(blog);
      }
    }

    const items: DisplayItem[] = [];
    const used = new Set<string>();

    for (const [seriesId, parts] of seriesMap) {
      // Sort all parts and matching parts by series order
      const sortedParts = [...parts].sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
      const matchingParts = sortedParts.filter((p) => filteredIds.has(p._id));
      if (!matchingParts.length) continue;
      const latestDate = parts.reduce((m, p) => (p.publishedAt > m ? p.publishedAt : m), '');
      items.push({
        type: 'series',
        seriesId,
        series: parts[0].series!,
        parts: sortedParts,
        matchingParts,
        latestDate,
      });
      parts.forEach((p) => used.add(p._id));
    }

    for (const blog of filtered) {
      if (!used.has(blog._id)) items.push({ type: 'blog', blog });
    }

    const s = this.sort();
    items.sort((a, b) => {
      const da = a.type === 'series' ? a.latestDate : a.blog.publishedAt;
      const db = b.type === 'series' ? b.latestDate : b.blog.publishedAt;
      return s === 'newest' ? db.localeCompare(da) : da.localeCompare(db);
    });

    return items;
  });

  readonly paginated = computed(() => {
    const size = this.pageSize();
    const p = this.page();
    return this.displayed().slice((p - 1) * size, p * size);
  });

  readonly totalPages = computed(() => Math.ceil(this.displayed().length / this.pageSize()) || 1);

  readonly activeFilterCount = computed(
    () => this.activeTags().length + (this.dateFrom() ? 1 : 0) + (this.dateTo() ? 1 : 0),
  );

  readonly hasActiveFilter = computed(() => !!this.search() || this.activeFilterCount() > 0);

  private readonly _pageReset = effect(
    () => {
      this.search();
      this.activeTags();
      this.dateFrom();
      this.dateTo();
      this.sort();
      this.pageSize();
      untracked(() => this.page.set(1));
    },
    { allowSignalWrites: true },
  );

  ngOnInit(): void {
    this.sanity
      .getBlogs()
      .then(({ blogs }) => {
        this.blogs.set(blogs);
        this.loading.set(false);
      })
      .catch(() => {
        this.error.set(true);
        this.loading.set(false);
      });
  }

  setSortValue(v: string): void {
    this.sort.set(v as 'newest' | 'oldest');
  }

  setPageSizeValue(v: string): void {
    this.pageSize.set(+v);
  }

  isSeriesExpanded(id: string): boolean {
    return this.expandedSeries().has(id) || this.hasActiveFilter();
  }

  toggleSeries(id: string): void {
    this.expandedSeries.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  removeTag(tag: string): void {
    this.activeTags.update((tags) => tags.filter((t) => t !== tag));
  }

  formatDate(iso: string): string {
    return formatDateFull(iso);
  }
  formatDateShort(iso: string): string {
    return formatDateShortFn(iso);
  }

  seriesDateRange(parts: BlogSummary[]): string {
    if (parts.length < 2) return this.formatDateShort(parts[0]?.publishedAt ?? '');
    const dates = parts.map((p) => p.publishedAt).sort();
    return `${this.formatDateShort(dates[0])} – ${this.formatDateShort(dates[dates.length - 1])}`;
  }

  seriesReadTime(parts: BlogSummary[]): number {
    return parts.reduce((sum, p) => sum + (p.readTime ?? 0), 0);
  }

  seriesAllTags(parts: BlogSummary[]): string[] {
    const seen = new Set<string>();
    parts.forEach((p) => p.tags?.forEach((t) => seen.add(t)));
    return [...seen].sort((a, b) => a.length - b.length);
  }

  tagsOf(tags: string[] | undefined): string[] {
    return [...(tags ?? [])].sort((a, b) => a.length - b.length);
  }

  readonly pageRange = computed((): (number | 'ellipsis')[] => {
    const total = this.totalPages();
    const cur = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const result: (number | 'ellipsis')[] = [1];
    if (cur > 3) result.push('ellipsis');
    const start = Math.max(2, cur - 1);
    const end = Math.min(total - 1, cur + 1);
    for (let i = start; i <= end; i++) result.push(i);
    if (cur < total - 2) result.push('ellipsis');
    result.push(total);
    return result;
  });

  trackItem(_: number, item: DisplayItem): string {
    return item.type === 'blog' ? item.blog._id : item.seriesId;
  }
}
