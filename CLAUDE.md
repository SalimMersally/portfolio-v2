# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Hard rules

- **No git operations.** Never run any `git` command (commit, push, pull, branch, status, diff, log, etc.). Do not stage, commit, or push changes under any circumstances.

## Node version

**Node 24** is the default on this machine and works for both Angular 22 and Sanity Studio v5. No nvm switching needed — just use the system default.

## Repository layout

```
portfolio/        ← Angular 22 SPA (Netlify — salimalmersally.com)
sanity-studio/    ← Sanity Studio v5 (sanity.studio)
CLAUDE.md
README.md
.gitignore
```

## Commands

All Angular commands run from `portfolio/`:

```bash
cd portfolio
npm install        # first time or after pulling
npm start          # dev server → http://localhost:4200
npm run build      # production build → portfolio/dist/portfolio-v2/
npm run watch      # dev build in watch mode
npm test           # unit tests (Vitest)
npx ng g component src/app/sections/foo  # generate a component
```

Prettier is configured in `portfolio/.prettierrc` (`printWidth: 100`, `singleQuote: true`). Run `npx prettier --write .` from inside `portfolio/`.

```bash
# in sanity-studio/
npm install        # first time
npm run dev        # Studio dev server → http://localhost:3333
npm run build      # verify build
npm run deploy     # push to *.sanity.studio (requires npx sanity login first)
```

Before first `deploy`, set `projectId` in both `sanity-studio/sanity.cli.ts` and `sanity-studio/sanity.config.ts` to the real Sanity project ID.

## Architecture

This is a single-page Angular 22 portfolio. All content is fetched from **Sanity CMS** via GROQ and rendered client-side. Deployed as a static SPA on **Netlify** at `salimalmersally.com`, behind Cloudflare (CDN + SSL "Full" mode). The `public/_redirects` file (`/* /index.html 200`) handles client-side routing so deep links don't 404 on refresh. Google Search Console is set up with the sitemap at `/sitemap.xml`.

### Change detection

Zoneless — no `zone.js` anywhere. `provideZonelessChangeDetection()` is registered in `portfolio/src/app/app.config.ts`. All components must use Signals or `markForCheck()` to trigger updates; async pipes work fine. NgModules are not used — every component is standalone.

### Data flow

```
Sanity Studio (sanity-studio/)
  └─ GROQ queries via @sanity/client
       └─ SanityService.getAllPortfolioData()   (portfolio/src/app/core/services/sanity.service.ts)
            └─ HomeComponent validates + holds signal<PortfolioData>
                 └─ Section components receive data via input.required<T>()
```

`HomeComponent` fetches everything in one call, runs `validatePortfolioData()` (each model has a `validateX()` function), and navigates to `/error` on any failure. Sections only render after the data signal is set to `'ready'`.

`ThemeService` (`portfolio/src/app/core/services/theme.service.ts`) reads `localStorage` (`color-mode` key) on init, falling back to `prefers-color-scheme`. It sets / removes the `data-theme="light"` attribute on `<html>` — dark is the default (no attribute). All component styles reference `var(--color-*)` / `var(--font-*)` — never hardcoded values.

### App shell

`App` (`portfolio/src/app/app.ts`) renders `<app-navbar>` + `<router-outlet>`. `Navbar` is app-wide, not owned by any page. `ThemeService.init()` is called via `provideAppInitializer` so the theme class is set before first paint (no FOUC).

### Routing

Lazy-loaded routes (defined in `portfolio/src/app/app.routes.ts`):
- `/` → `portfolio/src/app/pages/home/` — all portfolio sections
- `/blog` → `portfolio/src/app/pages/blog/` — blog listing with filtering, sorting, pagination, and series grouping
- `/blog/:slug` → `portfolio/src/app/pages/blog-post/` — individual post rendered from Portable Text via `@portabletext/to-html` + `highlight.js`
- `/error` → `portfolio/src/app/pages/error/` — shown on Sanity fetch/validation failure
- `/**` → `portfolio/src/app/pages/not-found/` — 404

Anchor scrolling (`/#experience`, `/#skills`, etc.) is handled natively by `withInMemoryScrolling({ anchorScrolling: 'enabled' })` in the router config — no manual `scrollIntoView` needed.

Section components live in `portfolio/src/app/sections/` and are imported directly into `HomeComponent`. The `SECTIONS` constant in `Navbar` (`portfolio/src/app/shared/navbar/navbar.ts`) is `['about', 'experience', 'projects', 'skills', 'books']` — `education` and `contact` sections exist in the DOM but intentionally do not appear in the nav.

`HomeComponent` shows a `Loading` page (`portfolio/src/app/pages/loading/`) while data fetches; it switches to `'ready'` only after `validatePortfolioData()` passes.

### Shared pieces

- **`RevealDirective`** (`portfolio/src/app/shared/directives/reveal.directive.ts`) — `[appReveal]` attribute directive; uses `IntersectionObserver` to add `.in-view` when an element scrolls into view. Accepts an optional delay string (`"1"`–`"4"`) that maps to `.reveal-delay-N` CSS classes.
- **`FilterService`** (`portfolio/src/app/core/services/filter.service.ts`) — tracks `activeSkills signal<string[]>`. Declared `@Injectable()` with no `providedIn`, so it **must** appear in the `providers: []` array of any component that uses it (currently `ExperienceSection`). This gives each consuming section its own independent instance.
- **`SkillFilter`** (`portfolio/src/app/shared/components/skill-filter/`) — shared dropdown used by `ExperienceSection` to filter roles by technology.
- **`CustomSelect`** (`portfolio/src/app/shared/components/custom-select/`) — generic styled `<select>` wrapper; takes `options: SelectOption[]` and emits `valueChange`.
- **`TagFilter`** (`portfolio/src/app/shared/components/tag-filter/`) — multi-select tag chip list; takes `tags: string[]` and emits `tagsChange`.
- **`DateRangePicker`** (`portfolio/src/app/shared/components/date-range-picker/`) — from/to date inputs; emits `fromChange` / `toChange`.
- **Shared utils** (`portfolio/src/app/shared/utils/format-date.ts`) — `formatDate(dateStr)`, `initials(name)`, `groupBy(arr, keyFn)`. Import from here rather than duplicating in sections.

### Styling

Global SCSS entry is `portfolio/src/styles.scss`, which `@use`s three partials:
- `portfolio/src/styles/_variables.scss` — all CSS custom property defaults (`:root { --color-accent … }`)
- `portfolio/src/styles/_reset.scss`
- `portfolio/src/styles/_typography.scss`

Component styles use `styleUrl` (scoped SCSS). Never add hardcoded color/font/spacing values; always reference a CSS variable.

### Environment / Sanity config

`portfolio/src/environments/environment.ts` holds `sanityProjectId`, `sanityDataset`, and `sanityApiVersion`. Production builds swap it for `environment.prod.ts` via `fileReplacements` in `portfolio/angular.json`. Fill in the real project ID before connecting to Sanity.

### Sanity Studio

Lives in `sanity-studio/` — Sanity v5 + React 19, separate `npm install` and build. Schemas are in `sanity-studio/schemas/index.ts`. Has its own `sanity.cli.ts` (required by v5) and `sanity.config.ts`.

Blog schemas: `post` (individual article with Portable Text body, tags, readTime, optional `series` reference + `seriesOrder`) and `series` (a grouping document with title/slug/description). `SanityService.getBlogs()` returns `{ blogs: BlogSummary[] }` for the listing; `SanityService.getBlogBySlug(slug)` returns `BlogDetail` (includes `body`, `prevPost`, `nextPost`). Models live in `portfolio/src/app/core/models/blog-summary.model.ts` and `blog-detail.model.ts`.

## Design reference

The HTML/CSS prototype (Option A — modern style) lives in `.claude/design/`. Use it as the source of truth for layout, spacing, colours, and component structure when building or styling anything.

| File | Purpose |
|---|---|
| `.claude/design/index.html` | Main portfolio page — all sections (Navbar, Hero, Experience, Skills, Projects, Books, Footer) |
| `.claude/design/blog.html` | Blog page layout |
| `.claude/design/styles.css` | Global CSS custom properties, layout, and base styles |
| `.claude/design/sections.css` | Per-section styles |
| `.claude/design/app.js` | Interactive behaviour (nav scroll, theme toggle, etc.) |
| `.claude/design/screenshots/` | PNGs of rendered design states (`01-sections.png` … `04-sections.png`, `preview-a.png`) |

When implementing a new section or component, open the corresponding block in `index.html` and the relevant CSS files first. Never invent colours, fonts, or spacing — derive them from the prototype's CSS variables.

## Adding a new section

1. Generate: `npx ng g component src/app/sections/foo` (from `portfolio/`)
2. Add `input.required<T>()` for its data; add `T` to `PortfolioData` and `validatePortfolioData()`
3. Add a GROQ query method to `SanityService` and include it in `getAllPortfolioData()`
4. Import the component into `HomeComponent` and pass the data signal
5. If it needs a nav link, add its id to the `SECTIONS` array in `navbar.ts`