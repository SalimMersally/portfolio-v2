# Blog Pages Design

**Date:** 2026-06-24  
**Scope:** Blog listing page (`/blog`) and blog reading page (`/blog/:slug`)  
**Status:** Approved, pending implementation

---

## Overview

Two new pages added to the Angular 22 portfolio:

- `/blog` — listing page with search, tag filtering, sort, date range, pagination, and series grouping
- `/blog/:slug` — reading page with Portable Text rendering, syntax-highlighted code blocks, series breadcrumb, and prev/next series navigation

Both pages are lazy-loaded routes, fetch their own data independently from Sanity, and have no connection to `PortfolioData` or `HomeComponent`.

Design reference: `.claude/design/blog.html` and `.claude/design/blog-post.html`. The reference is not an exact spec — layout, spacing and tone follow it; component structure follows Angular 22 patterns.

---

## Dependencies

Two new npm packages in `portfolio/`:

| Package | Purpose |
|---|---|
| `@portabletext/to-html` | Converts Sanity Portable Text blocks to an HTML string |
| `highlight.js` | Synchronous syntax highlighting applied to code blocks during conversion |

No other new dependencies. `DomSanitizer` (already in Angular) handles `SafeHtml` binding.

---

## Sanity Schema Changes

### New document: `series`

```ts
defineType({
  name: 'series',
  title: 'Series',
  type: 'document',
  fields: [
    defineField({ name: 'title',       type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug',        type: 'slug',   options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'description', type: 'text',   rows: 2 }),
  ],
})
```

### Extended `post` document

Three new fields added to the existing schema:

```ts
defineField({
  name: 'series',
  title: 'Series',
  type: 'reference',
  to: [{ type: 'series' }],
}),
defineField({
  name: 'seriesOrder',
  title: 'Part Number',
  type: 'number',
  description: '1-based position within the series',
}),
defineField({
  name: 'readTime',
  title: 'Read Time (minutes)',
  type: 'number',
}),
```

`series`, `seriesOrder`, and `readTime` are all optional — standalone posts leave series fields blank; `readTime` is set manually by the author in Studio.

---

## Angular Models

Two model files, independent of `PortfolioData`. All interfaces are named `Blog*` (not `Post*`).

### `blog-summary.model.ts`

Used on the listing page — no body fetched. Also exports `BlogSeries`, shared by the detail model.

`description` is a short manually-written summary (1–2 sentences) authored in Sanity Studio. It appears below the title on listing cards.

```ts
export interface BlogSeries {
  _id: string;
  title: string;
  slug: string;
}

export interface BlogSummary {
  _id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  publishedAt: string;     // ISO datetime string
  readTime?: number;
  series?: BlogSeries;
  seriesOrder?: number;
}

export function validateBlogSummary(b: unknown): b is BlogSummary {
  if (!b || typeof b !== 'object') return false;
  const blog = b as BlogSummary;
  return typeof blog._id === 'string'
    && typeof blog.title === 'string'
    && typeof blog.slug === 'string';
}
```

### `blog-detail.model.ts`

Shape of the data returned by Sanity for a single post. Contains only what Sanity provides — no Angular-computed fields.

```ts
import { BlogSeries } from './blog-summary.model';

export interface BlogNavItem {
  title: string;
  slug: string;
  seriesOrder: number;
}

export interface BlogDetail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  publishedAt: string;
  readTime?: number;
  body: unknown[];          // raw Portable Text — converted to SafeHtml in the component
  series?: BlogSeries;
  seriesOrder?: number;
  seriesTotal?: number;     // total parts in the series, for "Part N of M" breadcrumb
  prevPost?: BlogNavItem;
  nextPost?: BlogNavItem;
}
```

`htmlBody` is **not** part of this model. It is a `computed()` signal in the `BlogPost` component, derived from `body` after `@portabletext/to-html` + `highlight.js` runs.

---

## SanityService Additions

Two new methods added to `SanityService`. `getAllPortfolioData()` is unchanged.

### `getBlogs()`

Returns all blog summaries and all series documents in one GROQ call. Body is never fetched here.

```groq
{
  "blogs": *[_type == "post"] | order(publishedAt desc) {
    _id, title, "slug": slug.current,
    description, tags, publishedAt, readTime,
    "series": series-> { _id, title, "slug": slug.current },
    seriesOrder
  },
  "seriesList": *[_type == "series"] | order(title asc) {
    _id, title, "slug": slug.current, description
  }
}
```

Return type: `{ blogs: BlogSummary[]; seriesList: BlogSeries[] }`

### `getBlogBySlug(slug: string)`

Returns the full blog detail plus prev/next series navigation. Implemented as two sequential GROQ calls.

**Call 1** — fetch the blog post:
```groq
*[_type == "post" && slug.current == $slug][0] {
  _id, title, "slug": slug.current,
  description, tags, publishedAt, readTime,
  body,
  "series": series-> { _id, title, "slug": slug.current },
  seriesOrder
}
```

**Call 2** — only when the post has a `series._id`, fetch prev/next and total:
```groq
{
  "prevPost": *[_type == "post" && references($seriesId) && seriesOrder == $order - 1][0] {
    title, "slug": slug.current, seriesOrder
  },
  "nextPost": *[_type == "post" && references($seriesId) && seriesOrder == $order + 1][0] {
    title, "slug": slug.current, seriesOrder
  },
  "seriesTotal": count(*[_type == "post" && references($seriesId)])
}
```

The service method merges both results and returns `BlogDetail | null`. `prevPost`, `nextPost`, and `seriesTotal` are omitted when the post has no series.

---

## Routes

Added to `app.routes.ts` before the `**` wildcard:

```ts
{
  path: 'blog',
  loadComponent: () => import('./pages/blog/blog').then(m => m.Blog),
},
{
  path: 'blog/:slug',
  loadComponent: () => import('./pages/blog-post/blog-post').then(m => m.BlogPost),
},
```

---

## Navbar

"Blog" added as a `routerLink="/blog"` entry in `navbar.html`, alongside the existing section anchor links. `routerLinkActive="active"` handles highlighting on `/blog` and `/blog/:slug`.

`SECTIONS` array in `navbar.ts` is **not modified** — it drives home-page anchor scrolling only.

---

## Blog Listing Page (`/blog`)

**Component:** `Blog` at `portfolio/src/app/pages/blog/blog.ts`  
Existing stub converted to a full standalone component.

### State (signals)

```ts
blogs    = signal<BlogSummary[]>([])
loading  = signal(true)
error    = signal(false)

search         = signal('')
activeTags     = signal<string[]>([])
sort           = signal<'newest' | 'oldest'>('newest')
pageSize       = signal(10)
page           = signal(1)
dateFrom       = signal('')
dateTo         = signal('')
expandedSeries = signal<Set<string>>(new Set())
trayOpen       = signal(false)
```

### Computed signals

```ts
allTags   = computed(() => /* deduplicated, sorted tags from blogs() */)

filtered  = computed(() => /* filter blogs() by search (title + description + tags), activeTags, dateFrom, dateTo */)

displayed = computed(() => {
  // group filtered() into series items + standalone blog items
  // series item: { type: 'series', series, parts, matchingParts, latestDate }
  // blog item:   { type: 'blog', blog }
  // sorted by latestDate or publishedAt per sort()
})

paginated         = computed(() => /* slice displayed() by page() and pageSize() */)
totalPages        = computed(() => /* ceil(displayed().length / pageSize()) */)
activeFilterCount = computed(() => activeTags().length + (dateFrom() ? 1 : 0) + (dateTo() ? 1 : 0))
```

Page resets to 1 via an `effect()` watching the filter signals.

### Series display logic

- Blogs belonging to the same series collapse into one series card showing the series title, date range (first–last part), part count, and shared tags.
- Clicking the card header toggles expansion; state lives in `expandedSeries` signal.
- When any filter is active, all series auto-expand to reveal matching parts.
- Standalone blogs (no series) render as individual cards.

### Template structure

```
<section class="blog-hero"> title, subtitle </section>

<div class="filter-zone"> [sticky, backdrop-blur]
  search input
  Filters toggle button  [badge = activeFilterCount]
  [filter tray: sort select · page size select · date range · tag dropdown]
  [active filter chips]
</div>

<div class="results-bar"> N blogs · Clear all </div>

<div class="blog-feed">
  @for (item of paginated()) {
    @if (item.type === 'series') { series card block }
    @else                        { blog card block   }
  }
  @empty { empty state }
</div>

<div class="pagination"> ← · 1 2 … N · → </div>
```

Blog cards and series cards are template blocks inside `blog.html` — no separate component files.

### Error / loading

`loading()` true: minimal spinner. `error()` true: inline message (not the full `/error` page — a blog failure must not crash the rest of the portfolio).

---

## Blog Reading Page (`/blog/:slug`)

**New component:** `BlogPost` at `portfolio/src/app/pages/blog-post/blog-post.ts`

### State

```ts
blog      = signal<BlogDetail | null>(null)
loading   = signal(true)
wideMode  = signal(false)   // persisted in localStorage 'blog-width'
```

### Computed

```ts
htmlBody = computed(() => {
  const b = blog();
  if (!b) return null;
  return domSanitizer.bypassSecurityTrustHtml(renderBody(b.body));
})
```

`renderBody` is a standalone function (not a method) that calls `toHTML` from `@portabletext/to-html` with custom serializers:

```ts
function renderBody(body: unknown[]): string {
  return toHTML(body, {
    components: {
      types: {
        code: ({ value }) => {
          const lang = value.language ?? 'plaintext';
          const highlighted = hljs.getLanguage(lang)
            ? hljs.highlight(value.code, { language: lang }).value
            : hljs.highlightAuto(value.code).value;
          return `<pre class="code-block" data-lang="${lang}">
                    <span class="code-lang">${lang}</span>
                    <code>${highlighted}</code>
                  </pre>`;
        },
        image: ({ value }) =>
          `<figure>
             <img src="${value.asset?.url ?? ''}" alt="${value.alt ?? ''}" />
             ${value.caption ? `<figcaption>${value.caption}</figcaption>` : ''}
           </figure>`,
      },
    },
  });
}
```

### On init

1. Read `slug` from `ActivatedRoute.snapshot.params['slug']`
2. Call `SanityService.getBlogBySlug(slug)`
3. If `null` → `router.navigate(['/not-found'])`
4. `blog.set(result)` — `htmlBody` recomputes automatically

### Copy buttons on code blocks

Added in `afterNextRender()`: walk `.prose .code-block` elements, append a copy button, wire `navigator.clipboard.writeText(pre.querySelector('code').innerText)`.

### Width toggle

`wideMode` signal toggled by two buttons (Narrow / Wide). On init, restored from `localStorage['blog-width']`. Applied via `[class.wide]` on the article wrapper, controlling `max-width` in CSS (740px / 1060px).

### Series breadcrumb

Shown when `blog().series` is set:
```
[Series badge] → Series Title — Part N of M
```
`N` = `blog().seriesOrder`, `M` = `blog().seriesTotal`.

### Series navigation

Shown below the prose when `blog().prevPost` or `blog().nextPost` exists. Two-column grid (single column on narrow viewport). Each slot is either a link card or empty.

### Template structure

```
<article [class.wide]="wideMode()">
  <header class="article-header">
    ← All posts                    |  [Narrow / Wide toggle]
    [series breadcrumb — if series]
    <h1>{{ blog().title }}</h1>
    tags · date · read time
  </header>

  <div class="prose" [innerHTML]="htmlBody()"></div>

  @if (blog().prevPost || blog().nextPost) {
    <nav class="series-nav">
      [prev slot] [next slot]
    </nav>
  }
</article>
```

---

## Implementation Steps

### Step 1 — Dependencies
Install `@portabletext/to-html` and `highlight.js` in `portfolio/`.

### Step 2 — Sanity schema
- Add `sanity-studio/schemas/series.ts`
- Rename `excerpt` field to `description` in `sanity-studio/schemas/post.ts`, and add `series`, `seriesOrder`, `readTime` fields
- Register `series` in `sanity-studio/schemas/index.ts`
- Verify studio still builds: `npm run build` in `sanity-studio/`

### Step 3 — Angular models
- Create `portfolio/src/app/core/models/blog-summary.model.ts` (`BlogSeries`, `BlogSummary`, `validateBlogSummary`)
- Create `portfolio/src/app/core/models/blog-detail.model.ts` (`BlogNavItem`, `BlogDetail`)

### Step 4 — SanityService
- Add `getBlogs()` method
- Add `getBlogBySlug(slug)` method

### Step 5 — Routes
- Add `/blog` and `/blog/:slug` routes to `app.routes.ts` (before `**`)

### Step 6 — Blog listing page
- Convert `blog.ts` stub to a full standalone component
- Implement signals, computed chain, series grouping logic
- Build `blog.html` template (filter zone, feed, pagination)
- Style `blog.scss` from the design reference

### Step 7 — Blog reading page
- Create `portfolio/src/app/pages/blog-post/` directory and files
- Implement `blog-post.ts`: `getBlogBySlug`, `renderBody`, `htmlBody` computed signal, copy buttons, width toggle
- Build `blog-post.html` template (header, prose, series nav)
- Style `blog-post.scss` from the design reference (prose, code blocks, series nav)

### Step 8 — Navbar
- Add "Blog" `routerLink="/blog"` entry to `navbar.html` with `routerLinkActive`

### Step 9 — Verification
- `npm run build` in `portfolio/` passes with no errors
- Dev server smoke test:
  - Listing: search, tag filter, date range, sort, pagination, series expand/collapse
  - Reading: prose renders, code blocks highlighted, copy button works, series nav correct, width toggle persists across reload, bad slug → 404
  - Theme toggle works on both pages
  - Mobile layout usable
