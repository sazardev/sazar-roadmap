# Architecture

## Request lifecycle

```
Browser
  │  sd_session JWT (.sazardev.stream)
  ▼
Cloudflare Worker (workers/app.ts)
  │  React Router createRequestHandler
  ├── root loader: theme cookie
  ├── app-shell loader: verify JWT, ensure profile, learning stats
  ├── route loader: D1 queries
  └── route action: validate form, mutate D1, call services/AI
        │
        ├── D1 (sazardev-roadmap)
        ├── Workers AI (coach)
        └── service bindings (Notes, Tasks, Learn, News, English)
```

Every page under `app/routes/app-shell.tsx` requires a valid session. The app fails closed: without
`AUTH_URL` or a valid JWT, it redirects to the shared login or returns 403. `DEV_NO_AUTH=1` is only
honored on loopback hostnames and is never set in production.

## Layers

- `app/routes/` — HTTP delivery. Loaders read, actions write, components render. A route may not
  contain domain rules that belong in `features/`.
- `app/features/` — application and domain logic:
  - `roadmaps/` — roadmap, stage, topic and resource queries.
  - `progress/` — sessions, status changes, streaks, weekly activity, daily plans.
  - `flashcards/` — SM-2 variant (pure) and deck/review persistence.
  - `goals/` — goals and milestones, including automatic progress from sessions and reviews.
  - `coach/` — thread persistence, retrieval, prompt construction and Workers AI calls.
  - `search/` — FTS5 query sanitization and cross-entity search.
  - `notes/` — private notes stored inside this app.
  - `resources/` — resource shelf and bookmarks.
  - `people/` — contacts and questions.
  - `integrations/` — the outbound `/internal/*` client for the other sazardev apps.
- `app/components/` — presentation only. Tokens come from `app/app.css`; no raw palette colors.
- `app/lib/` — cross-cutting infrastructure: D1/Drizzle client, JWT/JWKS verification, security
  headers, SQL helpers, formatting.
- `app/db/schema.ts` — Drizzle schema. `migrations/0001_initial.sql` is the executable source of
  truth for D1, including FTS5 tables and triggers.
- `workers/app.ts` — Cloudflare entry. It passes `env` and `ctx` into React Router's load context.

Dependency direction: `routes → features → lib → db/schema`. A feature never imports a route.
`.server.ts` modules are not imported by client-only components (React Router strips loader/action
imports from the client build).

## Authentication

`auth.sazardev.stream` owns the only user record and issues a one-hour ES256 `sd_session` JWT in a
cookie scoped to `.sazardev.stream`. This app:

1. Reads `sd_session`.
2. Fetches auth's public JWKS (cached for an hour, forced refresh on a bad signature).
3. Verifies the algorithm, issuer, audience (`sazardev-apps`), expiry and signature with WebCrypto.
4. Upserts a local `profiles` row keyed by the JWT `sub` and returns the user.

There are no passwords, sessions or passkeys in this app. Revoking a session in auth stops refresh
immediately; an already-issued JWT remains valid until it expires (at most one hour).

The auth Worker's `APP_ORIGINS` must include `https://roadmap.sazardev.stream`, or the login flow
will fall back to another app after authentication.

## Data model

| Group       | Tables                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| Identity    | `profiles`, `user_settings`                                                      |
| Content     | `roadmaps`, `roadmap_stages`, `topics`, `topic_edges`, `resources`, `flashcards` |
| Learning    | `user_topic_progress`, `study_sessions`, `daily_plans`, `activity_events`        |
| Review      | `flashcard_reviews`, `flashcard_attempts`                                        |
| Planning    | `goals`, `goal_milestones`                                                       |
| Coach       | `coach_threads`, `coach_messages`                                                |
| Personal    | `notes`, `bookmarks`, `people`, `questions`                                      |
| Integration | `integrations` (metadata only, never secrets)                                    |

Content is seeded, never edited through the UI. User data is per `user_id`; every query that returns
user data filters by it. The app is designed for one owner but the schema is not hard-coded to one
profile.

`0001_initial.sql` also creates FTS5 tables for topics, resources and notes, with triggers that keep
them in sync. Search sanitizes user input into prefix terms (`react* AND hooks*`) before `MATCH`;
invalid syntax falls back to parameterized `LIKE` queries.

## Spaced review

`features/flashcards/algorithm.ts` is a deliberately small SM-2 variant:

- **Again** — relearning in 10 minutes, repetitions reset, lapse recorded.
- **Hard** — interval grows by 1.2x, ease drops by 0.15.
- **Good** — interval grows by the ease factor.
- **Easy** — interval grows by ease × 1.3, ease rises by 0.15.

Ease is clamped to `[1.3, 3.0]`. The function is pure, returns the next due date and a human label,
and is covered by unit tests. The database stores one review row per (user, card) and an append-only
attempt log.

## AI coach

The coach is retrieval-augmented, not a general chatbot:

1. The user message is sanitized into FTS terms.
2. Up to five relevant topics are retrieved, plus the topic in context.
3. A system prompt contains the learner snapshot, the retrieved summaries, concepts and practice.
4. Workers AI receives the last ten messages plus the system prompt.
5. The assistant message is stored with the retrieved topic IDs as citations.
6. If the model fails, times out or is disabled, a deterministic fallback builds a useful answer
   from the retrieved context.

The model is configurable per user in Settings. The default is
`@cf/meta/llama-4-scout-17b-16e-instruct`; no secret reaches the browser. A per-thread rate limit of
eight user messages per ten minutes protects cost.

Vectorize is configured for a future semantic retrieval pass. The current retrieval path is FTS5 so
the app works without an indexing job.

## Integrations

Outbound calls use `features/integrations/integrations.server.ts`. In production, service bindings
are declared in `wrangler.prod.jsonc`; in local development, the app can fall back to the public URL
with `INTEGRATION_KEY`. A missing key returns `null`, and the UI shows the section as unavailable.

Used endpoints (see the hub contract in the Notes repository):

- Notes: `POST /internal/notes`
- Tasks: `GET /internal/today`, `POST /internal/tasks`
- Learn: `GET /internal/reading`
- News: `GET /internal/top?limit=3`
- English: `GET /internal/today`

Inbound endpoints for the Notes hub:

- `GET /internal/today` — due reviews, minutes, streak, next topic, active goals.
- `GET /internal/search?q=` — topics and resources as hub results.

Both require `x-integration-key: INTEGRATION_KEY`.

## Design system

Tokens live in `app/app.css` as CSS custom properties and are exposed to Tailwind 4 through
`@theme inline`. The palette is monochrome: hierarchy comes from the gray ramp, weight and spacing,
not color. Status colors are reserved for state and always come with a label or icon. The accent is
the text color; the focus ring is the only saturated color.

Components use tokens (`bg-canvas`, `text-muted`, `border-line`) and never hard-code a palette value.
Motion uses the `--duration-*` and `--ease-*` tokens and is disabled by the reduced-motion setting.
The shell collapses from a 240 px sidebar to a five-destination bottom bar; the command palette is
the “More” destination on mobile.

## Decisions and deviations from STACK.md

| Decision                                      | Why                                                                                                                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 + Drizzle instead of Prisma/Postgres       | The app runs on Workers next to the existing sazardev apps; D1 removes a network hop, a service and a bill. Drizzle keeps schema and queries typed without a bundling-heavy client. Migrations are plain SQL and reviewed like code. |
| Shared `sazardev-auth` instead of Better Auth | The ecosystem already has a passkey/QR session with a public JWKS. Adding a second identity system would fragment the workspace and duplicate account recovery.                                                                      |
| React Router 7.18, TypeScript 6               | This is the version range React Router 7 declares support for. TypeScript 7 is not yet inside the framework's peer range, so the app stays on 6 until React Router supports it.                                                      |
| Biome + Vitest                                | They match STACK.md and are fast enough to run on every change.                                                                                                                                                                      |
| Tailwind 4 without a config file              | Tokens live in `@theme` in `app/app.css`; one source of truth for design and utilities.                                                                                                                                              |
| Static content seeded into D1                 | The Worker must stay small. Content is a build artifact, not a runtime import; the seed is idempotent and can be regenerated.                                                                                                        |

## Known follow-ups

- Promote more catalog previews to full guided curricula.
- Add the Vectorize indexing job and hybrid (FTS + vector) retrieval.
- Add streaming coach responses.
- Add Roadmap tiles to the Notes hub dashboard and global search by extending the hub contract.
- Add an end-to-end browser test once the shared auth flow can be exercised in CI.
