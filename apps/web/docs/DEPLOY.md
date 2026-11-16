# Deploy runbook

Production host: `https://roadmap.sazardev.stream`
Cloudflare account: `92b877a97b5acbd48f6d7dcf60129130`
Worker: `sazardev-roadmap`
D1: `sazardev-roadmap` (`3d68c2fc-8c95-460a-bb8a-b98f23765aeb`)
Vectorize: `sazardev-roadmap` (1024 dimensions, cosine)

## 1. Prerequisites

- Wrangler logged in to the account above (`npx wrangler whoami`).
- `apps/web/node_modules` installed from the repository root (`pnpm install`).
- The content seed generated (`pnpm content:build`).

## 2. First-time resources

```bash
npx wrangler d1 create sazardev-roadmap
npx wrangler vectorize create sazardev-roadmap --dimensions=1024 --metric=cosine
```

Copy the D1 `database_id` into `wrangler.jsonc` and `wrangler.prod.jsonc`. The current IDs are
already committed.

## 3. Database

Apply migrations before deploying code that depends on them:

```bash
cd apps/web
pnpm db:migrate:remote
pnpm db:seed:remote
```

`db:seed:remote` regenerates the seed and applies it with `wrangler d1 execute --remote`. The
upserts carry a `WHERE` guard, so rows whose content did not change are not rewritten and D1 only
bills real changes. FTS5 stays in sync through database triggers; the seed never rebuilds the
index. User progress is preserved, and stale content rows are not deleted. Migration
`0004_drop_topic_edges` removes the unused edge table.

D1's free plan allows 100,000 rows written per day. If Cloudflare returns error `7500`, stop: wait
until 00:00 UTC before retrying. Re-running the same import only burns the quota again. The seed is
safe to run when the quota resets, and a no-change seed should write almost nothing.

To update only roadmap metadata (level and progression order) without touching the 3,293 topics:

```bash
pnpm content:build
npx wrangler d1 execute sazardev-roadmap --remote -c wrangler.prod.jsonc \
  --file=.generated/roadmaps.sql
```

Verify:

```bash
npx wrangler d1 execute sazardev-roadmap --remote -c wrangler.prod.jsonc --command \
  "SELECT (SELECT count(*) FROM roadmaps) roadmaps, (SELECT count(*) FROM topics) topics, (SELECT count(*) FROM resources) resources, (SELECT count(*) FROM flashcards) cards;"
```

## 4. Secrets

The app needs one secret for the other apps:

```bash
npx wrangler secret put INTEGRATION_KEY -c wrangler.prod.jsonc
```

Use the **same value** already configured in Notes, Tasks, Learn, News and English. Rotating it
requires updating every app at the same time. Never put it in `wrangler.prod.jsonc`, `.dev.vars` in
the repository, a workflow file or a commit.

There is no auth secret in this Worker: only the public JWKS is read. `AUTH_URL`, `AUTH_AUD` and
`PUBLIC_URL` are non-secret vars.

If the key is missing, the app still works; integration sections show as unavailable.

## 5. Build and deploy

```bash
cd apps/web
pnpm build:prod
pnpm exec wrangler deploy -c build/server/wrangler.prod.json
```

`pnpm deploy` does both. The Vite plugin writes `build/server/wrangler.json`; `build:prod` merges it
with `wrangler.prod.jsonc`, points `main` at the built `index.js`, keeps the client assets directory
and removes any `.dev.vars` copied into the build output. Never deploy `workers/app.ts` directly:
Wrangler cannot resolve `virtual:react-router/server-build` outside Vite.

The first deploy creates the custom domain `roadmap.sazardev.stream` automatically. `workers_dev`
and preview URLs are disabled.

## 6. Auth origin

`https://roadmap.sazardev.stream` must be present in the auth Worker's `APP_ORIGINS`
(`sazardev-auth/wrangler.prod.jsonc`). Without it, `auth.sazardev.stream/login?next=…` rejects the
Roadmap URL and redirects to the first allowed app instead. The auth change is a one-line var update
and does not rotate sessions or secrets.

Deploy auth after changing it:

```bash
cd sazardev-auth
npx wrangler deploy -c wrangler.prod.jsonc
```

## 7. Verify

```bash
# public health, no data
curl -s https://roadmap.sazardev.stream/api/health

# unauthenticated page redirects to the shared login
curl -sI https://roadmap.sazardev.stream/ | grep -i location

# internal routes reject requests without the integration key
curl -s -o /dev/null -w "%{http_code}\n" https://roadmap.sazardev.stream/internal/today

# JWKS is reachable and stable
curl -s https://auth.sazardev.stream/.well-known/jwks.json
```

Then open the site in a browser with an active sazardev session and walk through onboarding.

## 8. Rollback

- **Code**: `npx wrangler rollback -c build/server/wrangler.prod.json` (or redeploy a previous
  version from the Cloudflare dashboard).
- **Database**: D1 Time Travel can restore to a bookmark. Take a bookmark before destructive
  changes:

  ```bash
  npx wrangler d1 time-travel info sazardev-roadmap --remote -c wrangler.prod.jsonc
  npx wrangler d1 export sazardev-roadmap --remote -c wrangler.prod.jsonc --output backups/roadmap-$(date +%F).sql
  ```

- **Content**: regenerate and reseed. Content upserts do not touch user tables.
- **Auth origin**: revert the line and redeploy auth; sessions continue to work.

## 9. Hub integration

Outbound, the dashboard reads Tasks, Learn, News and English. Inbound, Roadmap exposes:

- `GET /internal/today`
- `GET /internal/search?q=`

To show Roadmap on the Notes hub and in its global search, add the service binding in Notes and the
corresponding internal call. That change lives in the Notes repository, not here.

## 10. Cost notes

- Workers: static assets cached at the edge; SSR requests are small.
- D1: the seed is about 22.8 MB with 14,037 guarded upserts; a no-change seed writes almost nothing.
  Normal use reads a few hundred rows per page.
- Workers AI: the coach is the only model call. A per-thread rate limit and a 28-second timeout bound
  the cost; the deterministic fallback runs when the model is unavailable.
- Vectorize: configured but not yet used by the request path. Add indexing only with a tracked
  `topic_embeddings` table and a batched admin job.
- No R2, no KV, no cron, no third-party analytics.
