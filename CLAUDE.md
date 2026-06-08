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
       └─ SanityService  (portfolio/src/app/core/services/sanity.service.ts)  ← to be built
            └─ Section components consume typed signals
```

`ThemeService` (`portfolio/src/app/core/services/theme.service.ts`) fetches the theme document from Sanity on app init and injects CSS custom properties onto `document.documentElement`. All component styles reference `var(--color-*)` / `var(--font-*)` — never hardcoded values.

### Routing

Two routes, both lazy-loaded:
- `/` → `portfolio/src/app/pages/home/` — contains all portfolio sections
- `/blog` → `portfolio/src/app/pages/blog/` — Stage 2 placeholder

Section components live in `portfolio/src/app/sections/` (one directory per section). They are imported directly into `HomeComponent`, not routed separately. Navigation uses anchor links (`/#experience`, `/#skills`, etc.) with smooth scroll.

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

## Roadmap (Stage 1 remaining)

See `.claude/requirement.md` for the full spec. Outstanding items:
- `SanityService` + `ThemeService` in `portfolio/src/app/core/services/`
- TypeScript models in `portfolio/src/app/core/models/`
- All section components + Navbar + Footer
- Vercel deployment + Sanity webhook
