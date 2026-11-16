# Sazar Roadmap

A private learning operating system on Cloudflare Workers: guided roadmaps, deliberate practice,
spaced review, goals, notes, resources, people to ask, and an AI coach grounded in the same content.
It is a personal-use layer over this repository's roadmap.sh fork; the app is behind the shared
`sazardev-auth` session and is never indexed.

Live: <https://roadmap.sazardev.stream> (private, shared session).

## What it does

- **Five guided paths** — Frontend, Backend, Go, AI Engineer and Cloudflare — with curated stages,
  key concepts, practice prompts and pitfalls. Each path renders as a compact column map; clicking a node opens the full topic
  page. The topic page is a narrow reading column with a discreet actions menu, and selecting text
  lets you save it to Notes.
- **Two reference libraries** — DevOps and Full Stack — plus a preview of every other roadmap in
  the fork: 98 roadmaps, 2,162 topics and 5,485 resources in D1. The library is grouped by
  progression (start from zero, build depth, specialize) and keeps the upstream editorial order,
  not an alphabetical list.
- **Progress that means something** — a topic becomes `practice passed` only after the guided
  exercise is submitted and the AI review approves it. There is no manual “mark done”.
- **AI-reviewed practice** — write a summary, explanation or code, get rubric-based feedback,
  revise until it passes, and only then advance the roadmap. Reading time is logged separately
  from completion.
- **Spaced review** — a small, tested SM-2 variant with Again / Hard / Good / Easy intervals.
- **AI coach** — Workers AI with retrieved topic context, citations back to topics, a deterministic
  fallback and a per-user model choice.
- **Goals** — weekly minutes, topics, cards and custom targets; automatic progress from sessions and
  reviews.
- **Notes and resources** — private notes attached to topics, a bookmarkable resource shelf,
  one-click copies to the Notes app, and a selection toolbar that sends selected text to Notes.
- **People and questions** — save the people who can help, write the question first and record the
  answer.
- **The rest of the workspace** — Tasks, Learn, News and English are read on the dashboard through
  private service bindings; missing keys hide a section instead of breaking the page.
- **Command palette** — `Ctrl/Cmd+K` searches topics, resources and notes and runs navigation.
- **Monochrome design** — light/dark/system, Geist Sans/Mono, keyboard-first flows and a responsive
  shell with a desktop sidebar and mobile bottom navigation.

## Quick start

```bash
# from the repository root
pnpm install

cd apps/web
cp .dev.vars.example .dev.vars        # DEV_NO_AUTH=1 only works on loopback
pnpm content:build                    # reads ../../roadmaps and writes .generated/seed.sql
pnpm db:migrate:local
pnpm db:seed:local
pnpm dev
```

Open <http://localhost:5173>. The first request creates a development profile and sends you through
the three-step onboarding. `DEV_NO_AUTH` is ignored on every non-loopback hostname.

## Commands

| Task                                      | Command                                            |
| ----------------------------------------- | -------------------------------------------------- |
| Dev server (Workers runtime through Vite) | `pnpm dev`                                         |
| Build client and server                   | `pnpm build`                                       |
| Build the deployable production bundle    | `pnpm build:prod`                                  |
| Deploy to Cloudflare                      | `pnpm deploy`                                      |
| Typecheck both projects                   | `pnpm typecheck`                                   |
| Lint and format                           | `pnpm exec biome check .` / `pnpm format`          |
| Unit tests                                | `pnpm test`                                        |
| Coverage                                  | `pnpm coverage`                                    |
| Regenerate content seed                   | `pnpm content:build`                               |
| Apply D1 migrations (local / remote)      | `pnpm db:migrate:local` / `pnpm db:migrate:remote` |
| Seed D1 (local / remote)                  | `pnpm db:seed:local` / `pnpm db:seed:remote`       |
| Rebuild FTS5 indexes                      | `pnpm db:reindex:local` or Settings → Content      |

## Stack

| Layer        | Choice                                                                    |
| ------------ | ------------------------------------------------------------------------- |
| Framework    | React Router 7.18 in framework mode, SSR on Cloudflare Workers            |
| UI           | React 19, Tailwind CSS 4 with tokens in `app/app.css`                     |
| Data         | Cloudflare D1 + Drizzle ORM, SQL migrations in `migrations/`              |
| Auth         | Shared `sazardev-auth` ES256 JWT (`sd_session`) verified against its JWKS |
| AI           | Workers AI binding, `@cf/meta/llama-4-scout-17b-16e-instruct` by default  |
| Search       | D1 FTS5 over topics, resources and notes                                  |
| Integrations | Cloudflare service bindings to Notes, Tasks, Learn, News and English      |
| Validation   | Zod 4 at boundaries                                                       |
| Tests        | Vitest for pure domain logic                                              |
| Lint/format  | Biome 2                                                                   |
| Deploy       | Wrangler 4, Workers static assets, custom domain                          |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the boundaries and the decisions behind them,
and [docs/DEPLOY.md](docs/DEPLOY.md) for the production runbook.

## Content

`scripts/build-content.ts` reads the roadmap content in this repository and the curated curricula
in `app/content/curricula/`, then produces an idempotent SQL seed:

- 5 guided curricula: Frontend, Backend, Go, AI Engineer, Cloudflare.
- 2 full reference libraries: DevOps, Full Stack.
- 92 catalog roadmaps with a 16-topic preview each.
- One recall flashcard per guided/reference topic, plus resources extracted from the fork.

The app is a **personal-use copy** of the roadmap.sh fork. The upstream license does not allow
republishing the content outside this private workspace. Keep the app behind the shared session and
do not make the roadmap content public.

## Repository boundaries

- `app/routes/` — one route module per URL, loader/action plus component.
- `app/features/` — domain modules and server queries; `.server.ts` files never reach the client.
- `app/components/` — reusable UI and shell components.
- `app/content/` — curriculum definitions and content types.
- `app/db/schema.ts` — Drizzle schema; `migrations/` is the source of truth for D1.
- `workers/app.ts` — the Cloudflare Worker entry.
- `scripts/` — content generation and production config assembly.

The rest of the repository (the upstream fork) is content and sync tooling. This app does not modify
`roadmaps/` or the upstream scripts.
