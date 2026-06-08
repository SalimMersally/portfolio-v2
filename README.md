# Salim Al Mersally — Portfolio

Personal portfolio built with **Angular 22** and **Sanity CMS v5**. Content is managed through Sanity Studio and rendered client-side by a static Angular SPA deployed on Vercel.

## Repository structure

```
portfolio/        ← Angular 22 SPA (deployed to Vercel)
sanity-studio/    ← Sanity Studio v5 (deployed to sanity.studio)
CLAUDE.md
README.md
.gitignore
```

## Prerequisites

- **Node 26** (machine default — no switching needed)
- A [Sanity](https://sanity.io) account

---

## Local development

### Angular app

```bash
cd portfolio
npm install
npm start          # http://localhost:4200
```

### Sanity Studio

```bash
cd sanity-studio
npm install
npm run dev        # http://localhost:3333
```

---

## Seeding content

The seed script creates all documents (site settings, theme, experience, skills, education, projects, books) from a single command. Run it once after creating the Sanity project.

**1. Configure your environment**

Create `sanity-studio/.env` (already gitignored):

```
SANITY_PROJECT_ID=46kdlm0d
SANITY_TOKEN=<your-editor-token>
```

Get a write token from [sanity.io/manage](https://sanity.io/manage) → your project → **API → Tokens → Add API token** (Editor role).

**2. Run the seed**

```bash
cd sanity-studio
npm run seed
```

Expected output:
```
✔  siteSettings
✔  theme
✔  experience (4 entries)
✔  skills (5 categories)
✔  education
✔  projects (2 entries)
✔  books (5 entries)

✅  Seed complete!
```

The seed script is idempotent — running it again overwrites existing documents with the same `_id`.

---

## Deployment

### Sanity Studio → sanity.studio

```bash
cd sanity-studio
npx sanity login       # only needed once
npm run deploy
```

Studio is published to **salim-portfolio.sanity.studio**.

### Angular SPA → Vercel

**First time:**

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Set the **Root Directory** to `portfolio`
4. Vercel auto-detects Angular — no build command changes needed
5. Click **Deploy**

**Subsequent deploys:** push to `main` — Vercel deploys automatically.

**Optional — auto-redeploy on content publish:**

In Vercel → your project → **Settings → Git → Deploy Hooks**, create a hook and add it to Sanity:
```bash
# in sanity-studio/
npx sanity webhook create
```

---

## Environment variables

| File | Variable | Value |
|---|---|---|
| `sanity-studio/.env` | `SANITY_PROJECT_ID` | `46kdlm0d` |
| `sanity-studio/.env` | `SANITY_TOKEN` | Editor token (write access, seed only) |
| `portfolio/src/environments/environment.ts` | `sanityProjectId` | `46kdlm0d` |
| `portfolio/src/environments/environment.prod.ts` | `sanityProjectId` | `46kdlm0d` |

The Angular app only reads from Sanity — it never needs a token.
