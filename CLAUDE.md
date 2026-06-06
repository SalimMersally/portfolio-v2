# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Node version

Angular 22 requires **Node 22.22.3+**. Activate it before running any Angular command:

```bash
source ~/.nvm/nvm.sh && nvm use 22.22.3
```

## Commands

```bash
npm start          # dev server → http://localhost:4200
npm run build      # production build → dist/portfolio-v2/
npm run watch      # dev build in watch mode
npm test           # unit tests (Vitest)
npx ng g component src/app/sections/foo  # generate a component
```

Prettier is configured (`printWidth: 100`, `singleQuote: true`). Run `npx prettier --write .` to format.

## Architecture

This is a single-page Angular 22 portfolio. All content is fetched from **Sanity CMS** via GROQ and rendered client-side. Deployed as a static SPA on Vercel.

### Change detection

Zoneless — no `zone.js` anywhere. `provideZonelessChangeDetection()` is registered in `app.config.ts`. All components must use Signals or `markForCheck()` to trigger updates; async pipes work fine. NgModules are not used — every component is standalone.

### Data flow

```
Sanity Studio (separate repo)
  └─ GROQ queries via @sanity/client
       └─ SanityService  (src/app/core/services/sanity.service.ts)  ← to be built
            └─ Section components consume typed signals
```

`ThemeService` (`src/app/core/services/theme.service.ts`) fetches the theme document from Sanity on app init and injects CSS custom properties onto `document.documentElement`. All component styles reference `var(--color-*)` / `var(--font-*)` — never hardcoded values.

### Routing

Two routes, both lazy-loaded:
- `/` → `src/app/pages/home/` — contains all portfolio sections
- `/blog` → `src/app/pages/blog/` — Stage 2 placeholder

Section components live in `src/app/sections/` (one directory per section). They are imported directly into `HomeComponent`, not routed separately. Navigation uses anchor links (`/#experience`, `/#skills`, etc.) with smooth scroll.

### Styling

Global SCSS entry is `src/styles.scss`, which `@use`s three partials:
- `src/styles/_variables.scss` — all CSS custom property defaults (`:root { --color-accent … }`)
- `src/styles/_reset.scss`
- `src/styles/_typography.scss`

Component styles use `styleUrl` (scoped SCSS). Never add hardcoded color/font/spacing values; always reference a CSS variable.

### Environment / Sanity config

`src/environments/environment.ts` holds `sanityProjectId`, `sanityDataset`, and `sanityApiVersion`. Production builds swap it for `environment.prod.ts` via `fileReplacements` in `angular.json`. Fill in the real project ID before connecting to Sanity.

### Sanity Studio

Lives in `sanity-studio/` — a separate standalone Sanity project. Schemas go in `sanity-studio/schemas/`. It is deployed independently (`npx sanity deploy`) to a `*.sanity.studio` URL and is not part of the Angular build.

## Roadmap (Stage 1 remaining)

See `.claude/requirement.md` for the full spec. Outstanding items:
- Sanity Studio init + all schemas (theme, siteSettings, experience, skill, education, project, book)
- `SanityService` + `ThemeService` in `src/app/core/services/`
- TypeScript models in `src/app/core/models/`
- All section components + Navbar + Footer
- Vercel deployment + Sanity webhook
