# Sazar Roadmap

A private learning operating system on Cloudflare Workers: guided roadmaps, deliberate practice,
spaced review, goals, notes, resources, people to ask, and an AI coach grounded in the same content.
It is a personal-use layer over this repository's roadmap.sh fork; the app is behind the shared
`sazardev-auth` session and is never indexed.

Live: <https://roadmap.sazardev.stream> (private, shared session).

## What it does

- **Thirteen guided paths** — Frontend, Backend, Go, AI Engineer, Cloudflare, Flutter and Dart,
  Android, iOS, C, C# and .NET, Network Engineering, Software Architecture and Distributed System
  Design. Each path has a curated order, a specific summary and rationale per topic, key concepts,
  an evidence-producing practice prompt, real pitfalls and authoritative resources. It renders as a
  compact column map; clicking a node opens the full reading page. The topic page is a narrow reading
  column with a discreet actions menu, and selecting text lets you save it to Notes.
- **Two reference libraries** — DevOps and Full Stack — plus a preview of every other roadmap in
  the fork: 98 roadmaps, 3,293 topics and 8,444 resources in D1. The library is grouped by
  progression (start from zero, build depth, specialize) and keeps the upstream editorial order,
  not an alphabetical list.
- **Progress that means something** — a topic becomes `practice passed` only after the guided
  exercise is submitted and the AI review approves it. There is no manual “mark done”.
- **AI-reviewed practice** — write a summary, explanation or code, get rubric-based feedback,
  revise until it passes, and only then advance the roadmap. Reading time is logged separately
  from completion.
- **Spaced review** — a small, tested SM-2 variant with Again / Hard / Good / Easy intervals.
- **AI coach as a real chat** — a full-height conversation surface with a quiet message column, a
  composer that sends on Enter, code-aware Markdown, citations back to topics, page-based history
  and a deterministic fallback. Minimal chrome; no card layout or modal detour.
- **Goals** — weekly minutes, topics, cards and custom targets; automatic progress from sessions and
  reviews.
- **Notes and resources** — private notes attached to topics, a bookmarkable resource shelf,
  one-click copies to the Notes app, and a selection toolbar that sends selected text to Notes.
- **People and questions** — save the people who can help, write the question first and record the
  answer.
- **The rest of the workspace** — Tasks, Learn, News and English are read on the dashboard through
  private service bindings; missing keys hide a section instead of breaking the page.
- **Command palette** — `Ctrl/Cmd+K` searches topics, resources and notes and runs navigation.
- **Tablet and mobile first** — a full sidebar on desktop, a labelled icon rail on tablets, a
  five-item bottom bar on phones, safe-area padding, compact type and one-column reading pages.
  Search, More, Account and Coach history are pages, not modal detours.
- **Installable PWA with offline-first reading** — a manifest, generated service worker, precached
  app shell, automatic caching of visited pages, a one-tap “Save offline” action for a whole path,
  an offline library page, install controls in Account and an inline update banner. Saved pages
  remain readable on a plane or a train; writes resume when the connection returns. Signing out
  clears the page cache.
- **Clean monochrome design** — light/dark/system, Geist Sans/Mono, keyboard-first flows and a
  responsive shell with a desktop sidebar and mobile bottom navigation.

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
| Audit curriculum quality                  | `pnpm content:audit`                               |
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

- 13 guided curricula: Frontend, Backend, Go, AI Engineer, Cloudflare, Flutter and Dart, Android,
  iOS, C, C# and .NET, Network Engineering, Software Architecture and Distributed System Design.
- 638 curated topics across the guided stages, each with a unique summary, a reason to care, three
  or more precise concepts, an evidence-producing practice prompt, specific pitfalls and
  authoritative resources.
- Go Engineering is the deepest language path at 9 stages and 72 topics. Flutter and Dart (60),
  Network Engineering (54), Distributed System Design (54), C (54), iOS (54), Android (48), C# and
  .NET (48), Software Architecture (48) follow, each with its own extended reference library.
- 2 full reference libraries: DevOps, Full Stack.
- 83 catalog roadmaps with a 16-topic preview each.
- One recall flashcard per guided/reference topic, plus resources extracted from the fork.

The editorial standard is documented in [docs/CONTENT.md](docs/CONTENT.md) and enforced by
`pnpm content:audit`. The audit blocks thin summaries, missing rationale, fewer than three concepts,
non-actionable practice, generic pitfalls, duplicate summaries within a path, out-of-range study
time and topics without authoritative resources. Run it before `pnpm content:build`.

The app is a **personal-use copy** of the roadmap.sh fork. The upstream license does not allow
republishing the content outside this private workspace. Keep the app behind the shared session and
do not make the roadmap content public.

## PWA and offline

`pnpm build` runs `scripts/build-service-worker.ts`, fingerprints the emitted client assets and writes
`build/client/sw.js`. The service worker:

- precaches the app shell, fonts, icons, manifest and offline page;
- serves hashed static assets cache-first;
- uses network-first navigations with a 3.5 s timeout, then a cached page, then `offline.html`;
- keeps visited pages in a versioned page cache capped at 80 entries;
- accepts `CACHE_URLS` messages from the roadmap-level **Save offline** action;
- clears page caches on sign out and from **Account → Offline and install**.

Only same-origin GET navigations are cached. `/api/*`, `/internal/*`, `/auth/*` and `/logout` are
never cached. Practice answers and note bodies are saved as local drafts while offline and restored on return;
submission, reviews and coach calls still require a connection, and the offline banner says so
instead of failing silently. The page cache lives only on the device and is versioned with the
build, so a deployment never serves a stale shell.

The service worker is disabled in `pnpm dev`. To test the production behavior, run `pnpm build`
and `pnpm preview`, or deploy.

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
