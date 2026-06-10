# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Node version

**Node 26** is the default on this machine and works for both Angular 22 and Sanity Studio v5. No nvm switching needed — just use the system default.

## Repository layout

```
portfolio/        ← Angular 22 SPA (Vercel)
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

This is a single-page Angular 22 portfolio. All content is fetched from **Sanity CMS** via GROQ and rendered client-side. Deployed as a static SPA on Vercel.

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

### Routing

Three lazy-loaded routes:
- `/` → `portfolio/src/app/pages/home/` — all portfolio sections
- `/error` → `portfolio/src/app/pages/error/` — shown on Sanity fetch/validation failure
- `/**` → `portfolio/src/app/pages/not-found/` — 404

Section components live in `portfolio/src/app/sections/` (one directory per section). They are imported directly into `HomeComponent`, not routed separately. Navigation uses anchor links (`/#experience`, `/#skills`, etc.) with smooth scroll. The `SECTIONS` constant in `Navbar` (`portfolio/src/app/shared/navbar/navbar.ts`) defines which sections appear in the nav.

### Shared pieces

- **`RevealDirective`** (`portfolio/src/app/shared/directives/reveal.directive.ts`) — `[appReveal]` attribute directive; uses `IntersectionObserver` to add `.in-view` when an element scrolls into view. Accepts an optional delay string (`"1"`–`"4"`) that maps to `.reveal-delay-N` CSS classes.
- **`FilterService`** (`portfolio/src/app/core/services/filter.service.ts`) — tracks `activeSkills signal<string[]>`. Provided at `ExperienceSection` level (not root), so each section gets its own instance. The `SkillFilter` dropdown component reads from it via `inject(FilterService)`.
- **`SkillFilter`** (`portfolio/src/app/shared/components/skill-filter/`) — shared dropdown used by `ExperienceSection` to filter roles by technology.

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

## Roadmap (Stage 2)

See `.claude/requirement.md` for the full spec. Stage 1 (all sections, services, models, Navbar, Footer) is complete. Outstanding:
- `/blog` page + `post` schema (Sanity schema exists; Angular page is a stub)
- Vercel deployment + Sanity webhook
