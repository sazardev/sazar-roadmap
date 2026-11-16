import type { Curriculum } from "../types";
import { topic } from "../types";

export const cloudflare: Curriculum = {
  slug: "cloudflare",
  title: "Cloudflare Platform",
  tagline: "Ship at the edge with Workers, data and AI services.",
  description:
    "A hands-on path through the Cloudflare developer platform: the Workers runtime, bindings, D1, R2, Queues, Workers AI and the security model that ties them together. Build small services that use the platform honestly instead of treating the edge as a smaller region.",
  level: "intermediate",
  icon: "cloud",
  estimatedHours: 65,
  stages: [
    {
      slug: "edge-foundations",
      title: "Edge foundations",
      description:
        "The runtime model, the request lifecycle and the primitives that make Workers different from a Node server.",
      topics: [
        topic(
          "edge-computing-fundamentals",
          "The edge changes where code runs and what failure looks like; design for short-lived, distributed execution.",
          [
            "Points of presence and request routing",
            "Cold starts, locality and data gravity",
            "When the edge helps and when it adds latency",
          ],
          "Measure a Worker from three regions and compare latency with a single-region origin.",
          {
            summary:
              "Every proxied request terminates TLS at a nearby point of presence, so a Worker runs close to the client instead of crossing an ocean to one origin region. The shorter network path does not move the data: a query to a centralized primary still pays the wide-area round trip, and that leg usually dominates. Put computation next to the data or replicate the data, and measure both legs separately before claiming an edge win.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Benchmarking only Worker CPU next to an origin in the same region; the wide-area round trip is the cost that decides the design. Measure client to Worker and Worker to origin as separate legs.",
              "Assuming every point of presence runs every product; Workers AI, D1 replicas and Browser Rendering exist in a subset of locations. Check the product's location table before designing around local execution.",
              "Putting the only database in one region and calling the result global; reads still cross an ocean. Replicate reads or move the write path next to the data.",
            ],
          },
        ),
        topic(
          "isolates-architecture",
          "V8 isolates explain the startup profile, memory model and the constraints you feel in production.",
          [
            "Isolates versus containers",
            "Memory limits and CPU time",
            "Shared runtime and security boundaries",
          ],
          "Write down which Node APIs your workload needs and which platform APIs replace them.",
          {
            summary:
              "A Worker runs inside a V8 isolate, a heap and execution context that shares one engine process with many other tenants instead of owning a container. Startup takes milliseconds because no operating system boots, but the isolate has no Node globals and enforces a memory cap and a CPU time budget per invocation. The result is fast scale-out with hard per-request limits: blocking loops and large in-memory buffers fail at the platform boundary, not in your load test.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Treating CPU time as wall-clock time; waiting on fetch or a database does not consume CPU, but a tight parse or crypto loop does. Profile CPU separately from total latency.",
              "Caching large objects in module scope to avoid recomputation; isolates are evicted and memory is capped, so module globals are a best-effort cache, not storage.",
              "Porting a Node library that assumes `process`, `Buffer` or a native addon; check the compatibility flags or replace the dependency with a Web API.",
            ],
          },
        ),
        topic(
          "workers-runtime-environment",
          "The runtime is Web-standard first; knowing what is missing avoids painful bundling surprises.",
          [
            "Fetch, Request, Response and streams",
            "Web Crypto, URL and encoding APIs",
            "Node compatibility flags and limits",
          ],
          "Port a small handler from Node to Workers and document each compatibility decision.",
          {
            summary:
              "The runtime implements Web APIs such as fetch, Request, Response, streams, Web Crypto and URL, with Node built-ins available only through the `nodejs_compat` flag. The bundle is evaluated per isolate, so module-scope code runs once per isolate rather than once per request. A handler that depends on module state therefore behaves differently across isolates, and an import that pulls in `fs` or `net` fails at deploy time.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Importing a package that requires `fs` or `net` and enabling `nodejs_compat` as a blanket fix; the flag exposes a subset and does not provide native addons. Replace the dependency or isolate it behind an API.",
              "Reading `process.env` at runtime; vars and secrets arrive through the `env` argument unless the compatibility flag that populates `process.env` is enabled and configured.",
              "Doing work at module scope, such as opening a connection, assuming it runs once per request; it runs once per isolate, and isolates start on demand.",
            ],
          },
        ),
        topic(
          "workers-lifecycle",
          "Requests, waitUntil and Cron Triggers have different lifetimes; background work must fit inside them.",
          [
            "Fetch handler and execution context",
            "waitUntil and response streaming",
            "Scheduled handlers and invocation limits",
          ],
          "Move a non-critical write into waitUntil and verify it completes after the response.",
          {
            summary:
              "A fetch handler returns a Response while its execution context keeps running until every promise passed to `waitUntil` settles, up to the post-response limit. Streaming bodies hold the invocation open while chunks are written, and scheduled handlers run with no client connection at all. A fire-and-forget promise that is not registered with `waitUntil` is cancelled when the response finishes, which loses the write without an error.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Calling an async function without awaiting it or passing the promise to `waitUntil`; the isolate can be torn down first. Await it or register it.",
              "Buffering a whole response before returning it, which raises time to first byte and can exhaust the CPU budget. Return a `ReadableStream` and write as data arrives.",
              "Assuming `waitUntil` work can run for minutes; it has a post-response limit. Move long jobs to a Queue or a Workflow.",
            ],
          },
        ),
        topic(
          "bindings",
          "Bindings are the platform's dependency injection: typed, local in development and explicit in deployment.",
          [
            "D1, KV, R2, Queues, AI and service bindings",
            "wrangler configuration and environments",
            "Local simulation and remote resources",
          ],
          "Add one binding of each data type to a Worker and read it through a typed environment.",
          {
            summary:
              "A binding is a named capability injected into the `env` argument by deployment configuration: a D1 database, KV namespace, R2 bucket, Queue producer, AI model or another Worker. The runtime wires it into the script without a public endpoint or a credential in code, and `wrangler dev` simulates it against local storage or proxies to the remote resource. Access is explicit per environment, so a missing binding fails on the first call instead of falling back to a shared API client.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Hard-coding a resource ID or account ID instead of declaring a binding per environment; preview and production then share the wrong database. Bind both and let `env` choose.",
              "Treating a binding as a global; it exists only on the request's `env` argument, so helpers must receive it explicitly.",
              "Assuming local simulation matches production for every binding; remote-only behavior needs `--remote` or a preview deployment. Test the path against the deployed resource.",
            ],
          },
        ),
        topic(
          "wrangler",
          "Wrangler is the build, dev and deployment interface; configuration drift is a production risk.",
          [
            "wrangler.jsonc, vars and secrets",
            "Dev, preview and production configs",
            "Migrations, types and dry runs",
          ],
          "Create separate dev and production configs with no secret in either file and a dry-run gate.",
          {
            summary:
              "Wrangler reads `wrangler.jsonc` to build the bundle, start a local runtime, apply D1 migrations and upload a version with its bindings. That configuration is the deployment contract: routes, compatibility date, vars and bindings travel with the artifact. A compatibility date or binding that differs between the laptop and the deployed config creates behavior you cannot reproduce, so the file belongs in review like code.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Putting secrets in `vars`; they are stored in plaintext in the config and the deployment. Use `wrangler secret put` and keep values out of the repository.",
              "Skipping `--dry-run` and discovering a bundling or binding error only after upload. Add the dry run to CI before `deploy`.",
              "Letting the compatibility date drift for months, then bumping it in one step and changing runtime behavior. Move it deliberately and test the diff.",
            ],
          },
        ),
        topic(
          "http-and-web-protocols",
          "The edge sees the raw request; understanding headers, caching and protocol versions prevents mystery behavior.",
          [
            "Request headers added by Cloudflare",
            "Cache-Control, ETag and conditional requests",
            "HTTP/2, HTTP/3 and WebSocket upgrades",
          ],
          "Inspect the headers a Worker receives and returns, then implement a correct conditional GET.",
          {
            summary:
              "A Worker receives a `Request` carrying client headers plus Cloudflare values such as `CF-Connecting-IP`, `CF-Ray` and `CF-IPCountry`, while `X-Forwarded-For` can be client-supplied and is not trustworthy. HTTP/2 and HTTP/3 terminate at the edge, so the script sees a normalized request regardless of the client's protocol version. Cache validators and `Vary` then decide reuse, and a conditional GET that ignores `If-None-Match` turns every revalidation into a full body transfer.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Reading `X-Forwarded-For` for the client address when a client can set the header. Use `CF-Connecting-IP` at the edge.",
              "Serving a personalized response under a shared cache key without `Vary` or `private`; another user's data gets cached. Key on the varying input or forbid shared storage.",
              "Returning 200 with an empty body for `HEAD` and ignoring `If-None-Match`; handle both so caches and clients keep correct state.",
            ],
          },
        ),
      ],
    },
    {
      slug: "workers-and-apis",
      title: "Workers and APIs",
      description:
        "Routing, middleware, validation and the local feedback loop for a real HTTP service.",
      topics: [
        topic(
          "any-frontend-framework",
          "Workers can serve any frontend; the deployment shape depends on rendering and asset strategy.",
          [
            "Static assets and SPA fallbacks",
            "SSR frameworks and server bundles",
            "Caching and preview environments",
          ],
          "Deploy one SSR route and one static asset from the same Worker and verify cache headers.",
          {
            summary:
              "A Worker can serve a built frontend from the assets binding and run SSR in the same script, with `ASSETS.fetch()` handling a miss when `run_worker_first` is false. The asset layer answers matching files before the Worker runs, so precedence is a configuration decision as much as a code decision. SPA fallbacks, cache headers and the SSR boundary must be declared explicitly, or deep links return 404 while the index page works.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Adding an SPA fallback that rewrites every 404 to `index.html`, including missing API routes and assets. Scope the fallback to navigation requests.",
              "Serving hashed assets with a short TTL and the HTML entry point with a long one; users keep stale shells that point at deleted bundles. Reverse the two.",
              "Running SSR for requests that only need a static file; check the assets binding first or set `run_worker_first` deliberately.",
            ],
          },
        ),
        topic(
          "hono",
          "A small router with typed middleware is a good fit for the runtime and keeps handlers readable.",
          [
            "Routes, params and typed context",
            "Middleware composition and error handling",
            "Validation and response helpers",
          ],
          "Build a three-route API with validation, a request ID and a consistent error envelope.",
          {
            summary:
              "Hono matches routes with a router that ranks static segments above parameters and passes a typed `Context` through middleware, with `c.env` holding bindings and `c.set` and `c.get` holding request-scoped values. Middleware runs in registration order and can short-circuit by returning a Response before `next()`. Validation and error handling become composable, but the app must declare its `Bindings` type once or every handler loses binding checks.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Forgetting to call `await next()` in middleware, which stops the chain and returns an empty response. Return the downstream response or await it.",
              "Typing `env` as `any` to avoid generics; every binding access then loses checking. Declare a `Bindings` type and pass it to `Hono<{ Bindings: ... }>`.",
              "Throwing plain errors and letting them become 500s; register `app.onError` to map known failures to status codes.",
            ],
          },
        ),
        topic(
          "routing",
          "Routing is a contract: method, path, precedence and 404 behavior should be explicit and testable.",
          [
            "Static, parameterized and wildcard routes",
            "Method handling and HEAD/OPTIONS",
            "Route precedence and asset fallbacks",
          ],
          "Write a route table test that covers precedence and method mismatch cases.",
          {
            summary:
              "The router resolves a request to one handler by method and path, ranking static segments above parameters and parameters above wildcards. A path that matches but a method that does not should return 405 with an `Allow` header instead of falling through to a 404. Precedence and method handling are observable API behavior, so they need a route table test rather than ad hoc string checks.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Registering `/users/:id` before `/users/me` with a first-match router; the parameter swallows the literal route. Rank static segments first or test the collision.",
              "Returning 404 for a path that exists under another method, which hides a client bug and breaks retry logic. Return 405 with an `Allow` header.",
              "Letting a catch-all route handle API paths so JSON clients receive HTML. Scope the fallback by path prefix or `Accept`.",
            ],
            resources: [
              {
                title: "Cloudflare Workers: Routes and domains",
                url: "https://developers.cloudflare.com/workers/configuration/routing/",
                kind: "docs",
              },
              {
                title: "Hono: Routing",
                url: "https://hono.dev/docs/api/routing",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "middleware-patterns",
          "Cross-cutting behavior belongs in composable middleware, but hidden control flow is a debugging tax.",
          [
            "Auth, logging, CORS and rate limits",
            "Ordering and short-circuiting",
            "Typed context and error boundaries",
          ],
          "Implement auth and request logging as middleware, then prove their order with a test.",
          {
            summary:
              "Middleware receives the request context and `next`, performs work before or after the downstream handler, and may return early. The chain is ordered, so authentication must run before handlers that assume an identity, and logging must wrap `next()` to observe the final status. Hidden ordering and context mutation create bugs that appear only on specific route combinations, which is why the order belongs in a test.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Reading the request body in logging middleware before the handler; the stream is consumed and the handler sees an empty body. Clone the request before reading it twice.",
              "Setting CORS headers only on success responses; error paths then fail in the browser. Apply headers in a wrapper that runs for every response.",
              "Doing auth inside a single handler because middleware was inconvenient; the next route forgets it. Enforce at the router or route-group level.",
            ],
          },
        ),
        topic(
          "requestresponse-handling",
          "Streams, compression and body limits determine how the Worker behaves under real payloads.",
          [
            "Reading JSON, forms and streams",
            "Response streaming and backpressure",
            "Size limits and early rejection",
          ],
          "Stream a large response and reject an oversized upload before buffering it.",
          {
            summary:
              "A `Request` body is a stream that can be read once, and a `Response` can stream back through a `ReadableStream` so bytes reach the client before the full payload exists. Parsing JSON, enforcing size limits and negotiating compression all happen at the handler boundary, not after the body is materialized. Buffering an upload with `arrayBuffer()` multiplies memory across concurrent requests, while counting bytes during the stream keeps the isolate inside its cap.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Calling `request.json()` and then `request.text()` on the same request; the second read fails because the stream is consumed. Clone once or parse a single representation.",
              "Trusting `Content-Length` for size enforcement when it can be absent or wrong under chunked encoding; count bytes while streaming.",
              "Building a large response in memory so a header can be set afterwards; stream it and set headers before the first write.",
            ],
          },
        ),
        topic(
          "testing-frameworks",
          "The runtime is testable; a fast local suite is the difference between confidence and deploy-and-pray.",
          [
            "Vitest with the Workers pool",
            "Unit tests for pure logic",
            "Integration tests with bindings",
          ],
          "Write one unit test and one integration test that exercises a D1 binding.",
          {
            summary:
              "`@cloudflare/vitest-pool-workers` runs tests inside the real `workerd` runtime, so `fetch`, bindings and `waitUntil` behave as they do in production instead of being reshaped by Node. Storage is isolated per test by default, and `SELF.fetch()` exercises the script through its deployed entry point. A suite that passes in plain Node but fails here is usually relying on a Node API or on state shared between tests.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Mocking `fetch` globally and never exercising the real binding; integration behavior stays unverified. Use the pool's bindings and a local D1 for at least one test.",
              "Assuming storage persists between tests; storage is rolled back unless `isolatedStorage` is disabled. Seed the data inside the test.",
              "Testing internal functions only, so router, middleware and serialization never run. Add one `SELF.fetch()` test through the entry point.",
            ],
          },
        ),
        topic(
          "cicd-pipelines",
          "Edge deployments are fast enough to automate safely, but migrations and rollbacks need a real sequence.",
          [
            "Build once and deploy the same artifact",
            "D1 migrations before code",
            "Preview deployments and smoke checks",
          ],
          "Write a deploy sequence with a migration gate, a smoke check and a rollback command.",
          {
            summary:
              "A deployment uploads a Worker version and then shifts traffic, so the pipeline must build once, apply D1 migrations, deploy and verify the new version serves requests. `wrangler d1 migrations apply` runs before the code that depends on the new schema, and the previous version remains available for rollback. A pipeline that deploys code before migrations, or rebuilds separately per environment, cannot reproduce or roll back what reached production.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Running migrations and deploy in parallel; new code queries a column that does not exist yet. Serialize migration before deploy.",
              "Storing a long-lived account-wide API token in CI; one leak reaches every resource. Scope the token to the Worker and the required permissions.",
              "Skipping a post-deploy smoke check; a bad binding appears as a 500 for users. Fetch one known route and assert the status.",
            ],
          },
        ),
      ],
    },
    {
      slug: "storage-and-data",
      title: "Storage and data",
      description:
        "Choose the right storage primitive and understand its consistency, query and cost model.",
      topics: [
        topic(
          "workers-kv",
          "KV is a globally distributed cache with eventual consistency, not a transactional database.",
          [
            "Key design and value size limits",
            "Cache TTL and propagation",
            "Read-heavy and configuration workloads",
          ],
          "Store a feature flag in KV and measure how long an update takes to appear in another region.",
          {
            summary:
              "KV stores values in a namespace whose contents are cached at every point of presence, so reads are served locally while writes go to a central store and propagate, usually within about 60 seconds. Values are capped at 25 MiB, keys at 512 bytes, and writes to one key are limited to roughly one per second. KV fits configuration and read-heavy caches, but it fails as a counter or lock because two regions can read different values after the same write.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Using KV as a counter or lock; read-modify-write races and eventual consistency lose updates. Use a Durable Object for coordination.",
              "Writing on every request; writes are billed, rate-limited per key and propagate slowly. Cache in the isolate or use the Cache API.",
              "Storing a large JSON document that is read whole on every request; value size and transfer cost add up. Split the keys or move structured queries to D1.",
            ],
          },
        ),
        topic(
          "d1",
          "D1 is SQLite at the edge with the query and transaction model that implies; it is excellent for read-heavy app data.",
          [
            "Tables, indexes and foreign keys",
            "Prepared statements and batch writes",
            "Read replication and consistency",
          ],
          "Model a small domain, add indexes for two queries and measure rows read.",
          {
            summary:
              "D1 is managed SQLite with a primary that accepts writes and read replicas that answer queries through the same binding; `withSession()` pins a sequence of statements to a consistency level instead of letting a replica return stale rows. Statements use prepared queries, and `batch()` executes several in one transaction. Read-heavy endpoints scale because replicas serve them, while a multi-statement invariant needs an explicit session or a single statement.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Assuming every read sees the latest write; a replica can be behind. Pin the session to the primary or route that read to it.",
              "Splitting a transaction across separate `prepare().run()` calls; each is its own implicit transaction. Use `batch()` or one session-scoped unit.",
              "Using `SELECT *` for a list endpoint on a wide table; rows read drive latency and billing. Project only the columns the response uses.",
            ],
          },
        ),
        topic(
          "migrations",
          "Schema changes are the riskiest part of deployment; migrations must be ordered, reviewed and reversible by plan.",
          [
            "Forward-only migrations",
            "Backfills and online changes",
            "Rollback strategy and backups",
          ],
          "Write a migration that adds a column, backfills it and keeps the previous code working during rollout.",
          {
            summary:
              "D1 migrations are ordered SQL files recorded in `d1_migrations` and applied by `wrangler d1 migrations apply`; an applied file is never edited. A change that must survive a rolling deploy is split into expand (add a nullable column and dual-write), migrate (backfill in batches), and contract (drop the old column in a later release). Forward-only files plus a backfill plan let old and new code run against the same schema during rollout.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Editing a migration that has already been applied; the tracking table says it ran, so the change never reaches production. Add a new migration instead.",
              "Adding a `NOT NULL` column without a default to a populated table; the statement fails or forces a rewrite. Add it nullable, backfill, then enforce.",
              "Backfilling millions of rows in one statement; it holds a write transaction and times out. Batch by key and report progress.",
            ],
          },
        ),
        topic(
          "query-optimization",
          "D1 bills and limits by rows read; an unbounded query is both a latency and a cost bug.",
          [
            "EXPLAIN and index usage",
            "Pagination and covering indexes",
            "N+1 queries and batch reads",
          ],
          "Reduce one endpoint's rows read by adding an index and a projection, then show the numbers.",
          {
            summary:
              "SQLite picks an access path from the indexes it has, and `EXPLAIN QUERY PLAN` shows whether a query scans a table or seeks an index; a composite index only helps when the leading columns match the predicate. D1 bills and limits by rows read, so a missing index is a cost defect as well as a latency defect. The usual fix is a narrower projection plus an index ordered to the filter, verified by comparing rows read before and after.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Adding one index per column instead of a composite index in filter order; SQLite still scans or does several seeks. Match the index to the equality columns first.",
              "Wrapping a column in a function such as `date(created_at)` and expecting an index seek; the expression defeats it. Filter a range or index the expression.",
              "Paginating with a large `OFFSET`; the engine reads and discards every skipped row. Use keyset pagination on an indexed column.",
            ],
            resources: [
              {
                title: "Cloudflare D1: Query best practices",
                url: "https://developers.cloudflare.com/d1/best-practices/query-d1/",
                kind: "docs",
              },
              {
                title: "SQLite: EXPLAIN QUERY PLAN",
                url: "https://www.sqlite.org/eqp.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "drizzle",
          "A typed query builder keeps schema and application code aligned without hiding SQL entirely.",
          [
            "Schema definitions and inferred types",
            "Joins, transactions and batch queries",
            "Migration generation versus handwritten SQL",
          ],
          "Build a typed repository with one join and one transaction, then inspect the generated SQL.",
          {
            summary:
              "Drizzle defines tables in TypeScript, infers row and insert types from them, and compiles a typed query builder into SQL you can log. `drizzle-kit generate` diffs the schema into SQL migrations, while the D1 driver executes prepared statements through the binding. Types catch column drift at build time, but the generated SQL still goes through SQLite's planner, so an unindexed join stays slow however well it is typed.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Assuming a relational query emits one statement; a naive relation load becomes N+1. Log the SQL and count the round trips.",
              "Editing generated migration SQL after Drizzle has recorded a snapshot; the next diff is wrong. Change the schema or add a handwritten migration.",
              "Calling `db.select()` without a `where` on a large table; typed code still scans. Add the predicate and the matching index.",
            ],
          },
        ),
        topic(
          "r2-storage",
          "R2 gives object storage without egress fees; the access pattern and lifecycle rules still decide the design.",
          [
            "Buckets, keys and metadata",
            "Signed URLs and public access",
            "Lifecycle, versioning and backups",
          ],
          "Upload a file through a Worker, serve it privately and add a lifecycle rule.",
          {
            summary:
              "R2 stores objects by key in a bucket and exposes S3-compatible and binding APIs, with reads and writes carried over Cloudflare's network and no egress charge. Large objects use multipart upload, which splits a file into parts, uploads them in parallel and completes with a manifest of ETags. A single `put()` of a multi-gigabyte file exhausts isolate memory or times out, while multipart leaves incomplete uploads to abort.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Uploading a large file with one `put()`; the Worker buffers it and hits memory or duration limits. Use multipart upload with parts of 5 MiB or more.",
              "Leaving incomplete multipart uploads behind; stored parts are billed until aborted. Add an abort path and a lifecycle rule.",
              "Making a bucket public to serve private files; use signed URLs or a Worker that checks authorization before `get()`.",
            ],
          },
        ),
        topic(
          "durable-objects",
          "Durable Objects provide a single coordination point per key, which is powerful and easy to overuse.",
          [
            "Object identity and storage",
            "Transactions and alarms",
            "WebSocket hibernation and scaling limits",
          ],
          "Build a counter or presence room with a Durable Object and test concurrent updates.",
          {
            summary:
              "A Durable Object is a class whose instances are addressed by a derived ID, run in one location, and own transactional storage plus alarms that survive eviction. The runtime routes every request for a key to the same instance and gates concurrent storage operations, so read-modify-write inside a transaction stays consistent without an external lock. Coordination is correct per object, but throughput is bounded by that single instance, which makes a hot key a scaling limit rather than a database problem.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Putting every tenant in one object because it is convenient; every request queues behind the same instance. Shard by tenant or room.",
              "Holding a value only in memory between requests; the object can be evicted. Write to storage before returning.",
              "Awaiting a slow external call inside a critical section; it blocks progress for every request to that object. Move the call out or bound it with a timeout.",
            ],
            resources: [
              {
                title: "Cloudflare Durable Objects: What are Durable Objects",
                url: "https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/",
                kind: "docs",
              },
              {
                title: "Cloudflare Durable Objects: Storage API",
                url: "https://developers.cloudflare.com/durable-objects/api/storage-api/",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "ai-and-messaging",
      title: "AI and messaging",
      description:
        "Workers AI, Vectorize and asynchronous work: the platform pieces behind an AI product.",
      topics: [
        topic(
          "workers-ai",
          "Workers AI puts inference behind a binding, but model choice, token limits and cost still drive the design.",
          [
            "Model catalog and task types",
            "Binding calls and streaming",
            "Neuron usage and quotas",
          ],
          "Build a text endpoint with a model binding, a token limit and a graceful fallback.",
          {
            summary:
              "Workers AI exposes models through an `AI` binding, so inference runs on Cloudflare GPUs without an API key stored in the Worker. Each model has a task shape, such as text generation or embeddings, a context limit and a Neuron price, and supported models stream tokens. Model choice is a latency, quality and quota decision, and a prompt above the context limit fails before producing any output.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Sending an unbounded prompt; long input exceeds the model's context window and returns an error. Truncate or chunk before the call.",
              "Assuming a model that worked in a demo is available to every account or location; check the catalog and the quota.",
              "Buffering a streamed response into a string to post-process it; time to first token is lost and memory grows. Transform the stream chunk by chunk.",
            ],
          },
        ),
        topic(
          "ai-gateway",
          "A gateway centralizes caching, logging and provider fallback across AI calls.",
          [
            "Provider routing and fallbacks",
            "Caching and rate limits",
            "Logs, cost and request metadata",
          ],
          "Route one request through AI Gateway and compare latency and cache behavior with a direct call.",
          {
            summary:
              "AI Gateway sits between the Worker and a model provider, recording requests, caching responses by prompt and falling back to another provider when the first fails. It works with Workers AI through `env.AI.gateway()` and with external APIs through a gateway URL, and a cache hit skips the provider call. The gateway gives cost and latency data without changing model code, but its cache key must include every input that changes the answer.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Caching a request whose answer depends on user context the key ignores; one user's answer reaches another. Include those inputs in the key or disable caching.",
              "Assuming fallback preserves streaming and tool-call semantics across providers; the APIs differ. Test the fallback path with the same assertions.",
              "Sending secrets in prompts that the gateway logs; redact them before the call or keep them out of the prompt.",
            ],
          },
        ),
        topic(
          "vectorize",
          "Vector search is a retrieval component; the embedding model, chunking and metadata filter decide its usefulness.",
          [
            "Index creation and dimensions",
            "Upsert, query and metadata filters",
            "Recall, latency and reindexing",
          ],
          "Index twenty documents, query with a filter and compare results with a keyword baseline.",
          {
            summary:
              "Vectorize stores vectors with IDs and metadata and answers nearest-neighbor queries by cosine, dot-product or Euclidean distance, against an index built for one fixed dimension and metric. Vectors come from an embedding model, so chunking and that model set retrieval quality before the index does. Changing the embedding model requires re-embedding and reindexing every vector, and metadata filters can exclude the true nearest neighbor before ranking begins.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Mixing vectors from two embedding models in one index; the distances are meaningless. Pin the model and dimension, then reindex on change.",
              "Chunking by character count across sentence and section boundaries; the embedding loses meaning. Chunk by structure and keep a small overlap.",
              "Returning top-k with no score threshold; irrelevant neighbors still reach the prompt. Threshold the scores and rerank.",
            ],
          },
        ),
        topic(
          "ai-powered-search",
          "Hybrid search usually beats pure vectors because exact terms, names and codes still matter.",
          [
            "Lexical plus semantic candidates",
            "Reranking and snippet generation",
            "Citations and permissions",
          ],
          "Build a hybrid search endpoint and measure recall on queries with exact identifiers.",
          {
            summary:
              "Hybrid retrieval runs a lexical query and a vector query, merges both candidate lists with rank fusion, and optionally reranks the top results before an answer is generated. Exact identifiers, error codes and names favor lexical matching, while paraphrases favor embeddings. The merge and the reranker decide quality more than the embedding model, and citations must be filtered by the caller's permissions before they enter the prompt.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Replacing keyword search entirely with vectors; SKUs and error codes stop matching. Keep a lexical branch and fuse the ranked lists.",
              "Letting generated citations include documents the caller cannot read; filter candidates by permission before reranking. Retrieval is part of authorization.",
              "Evaluating on a handful of friendly queries; recall looks fine until real identifiers appear. Build a labeled query set with expected documents.",
            ],
          },
        ),
        topic(
          "queues",
          "Queues absorb bursts and isolate failure, but delivery is at-least-once and consumers must be idempotent.",
          [
            "Producers, consumers and batches",
            "Retries and dead-letter queues",
            "Consumer concurrency and backpressure",
          ],
          "Build a producer and an idempotent consumer, then force a retry and inspect the dead letter.",
          {
            summary:
              "A producer sends messages to a Queue, and a consumer Worker receives a batch and decides per message to acknowledge or retry; a pull consumer must ack before its visibility timeout expires or the message is delivered again. Delivery is at-least-once, so a retry can repeat work that already had a side effect. Consumers must be idempotent and cap batch size, or one poison message cycles until it reaches the dead-letter queue.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Acknowledging the batch before the work finishes; a crash loses the messages. Ack each message after its side effect succeeds.",
              "Retrying a non-idempotent write; the retry duplicates a charge or row. Key the write by message ID and make it conditional.",
              "Raising `max_batch_size` for throughput without checking CPU time; a batch can exceed the invocation limit. Measure the batch and cap it.",
            ],
          },
        ),
        topic(
          "workflows",
          "Durable multi-step work needs checkpoints, retries and visibility that a single request cannot provide.",
          [
            "Steps, sleeps and durable state",
            "Retries and error handling",
            "Long-running human approvals",
          ],
          "Model a three-step workflow with one retryable step and inspect its state after a failure.",
          {
            summary:
              "A Workflow is a sequence of steps whose results the platform persists, so a retry resumes at the failed step instead of replaying completed work. `step.do` wraps a unit of work with a retry policy, `step.sleep` suspends without holding compute, and instances expose their status through the binding. Long approvals and multi-minute jobs become possible, but every side effect must sit inside a step and tolerate at-least-once execution.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Doing work outside `step.do`; it is not checkpointed, so a retry re-runs it or skips it. Put every side effect inside a step.",
              "Returning a huge object from a step; it is persisted in instance state and counts against limits. Store the body in R2 and return the key.",
              "Treating `step.sleep` as a timer that fires exactly once; wake-ups are scheduled and can run later. Design for at-least-once execution.",
            ],
          },
        ),
        topic(
          "webhook-handling",
          "Webhooks are untrusted, duplicated and out of order; verification and idempotency are not optional.",
          [
            "Signature verification and replay windows",
            "Idempotency keys and ordering",
            "Fast acknowledgement and async processing",
          ],
          "Implement a verified webhook that acknowledges quickly and processes through a queue.",
          {
            summary:
              "A webhook is a third-party POST whose signature must be verified over the raw body before parsing, with a timestamp check that bounds replay. The receiver should persist the event ID, acknowledge with a 2xx quickly and move processing to a Queue, because the sender retries on timeout and may deliver out of order. Verification without idempotency produces duplicate side effects, and asynchronous processing without an event ID produces them twice under retry.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Verifying the signature after `await request.json()`; re-serialization changes the bytes and the HMAC never matches. Read the raw body once and verify before parsing.",
              "Ignoring the timestamp in the signature; a captured request can be replayed later. Reject events outside a short window.",
              "Doing the full job before returning 200; the sender times out and retries. Enqueue the work and acknowledge.",
            ],
            resources: [
              {
                title: "GitHub: Validating webhook deliveries",
                url: "https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries",
                kind: "docs",
              },
              {
                title: "Standard Webhooks: Specification",
                url: "https://www.standardwebhooks.com/",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "security-and-operations",
      title: "Security and operations",
      description:
        "Headers, rate limits, caching and the observability needed to run an edge service responsibly.",
      topics: [
        topic(
          "workers-security-model",
          "The platform isolates execution, but your bindings, secrets and authorization decisions remain your responsibility.",
          [
            "Least-privilege bindings and tokens",
            "Secrets and environment separation",
            "Input validation and output encoding",
          ],
          "Audit one Worker's bindings and remove every permission the request path does not need.",
          {
            summary:
              "The runtime isolates scripts and secrets, and a binding grants only the capability it names, so a Worker without a D1 binding cannot query that database even with valid account credentials. Secrets arrive as encrypted values on `env`, and outbound fetch reaches any host unless the account restricts it. Authorization stays application logic: D1 has no row-level security (RLS), so a missing tenant predicate in one query is a data breach.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Relying on the runtime to enforce tenancy; D1 has no RLS, so every query needs the tenant filter. Test with a second tenant's ID.",
              "Giving CI an account-wide API token; a leak reaches every resource. Scope tokens per Worker and per permission.",
              "Logging the whole `env` object while debugging; secrets end up in the log pipeline. Log binding names only.",
            ],
          },
        ),
        topic(
          "web-security-headers",
          "Security headers are cheap, visible and frequently forgotten at the edge.",
          [
            "CSP, HSTS and frame protections",
            "Referrer and permissions policy",
            "Report-only rollout",
          ],
          "Add a strict header set to one route and verify it with an external scanner.",
          {
            summary:
              "Response headers such as `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options` and `Referrer-Policy` move enforcement into the browser, where a missing directive is silently permissive. A CSP nonce must be generated per response and inserted into both the header and the HTML, which rules out serving the document as a shared static asset. Headers added at the edge are cheap, but a strict CSP deployed without report-only data breaks inline scripts on the first request.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Deploying a strict CSP straight to production; blocked inline scripts and widgets appear only in the browser. Run `Content-Security-Policy-Report-Only` first and read the reports.",
              "Setting `Strict-Transport-Security` with a long max-age before every subdomain is HTTPS; the browser pins the failure. Start with a short max-age.",
              "Adding headers only to HTML responses; JSON and error paths stay unprotected. Set them in one response wrapper.",
            ],
          },
        ),
        topic(
          "rate-limiting",
          "Rate limits protect availability and cost; a limit without a key and a budget is theater.",
          [
            "Per-user, per-IP and per-token limits",
            "Burst versus sustained limits",
            "429 responses and retry hints",
          ],
          "Add a rate limit to one write endpoint and test the boundary with concurrent requests.",
          {
            summary:
              "A rate limit counts requests per key over a window, and the key decides who is protected: IP for anonymous traffic, user or token for an authenticated API. WAF rate limiting rules run at the zone before the Worker and can block or challenge, while a Worker-level limiter needs shared state from the Rate Limiting binding or a Durable Object. An in-isolate counter is per-instance and nearly useless under load, and a 429 without `Retry-After` teaches clients to hammer.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Counting in module scope; each isolate has its own counter and the effective limit multiplies by instance count. Use the Rate Limiting binding or a Durable Object.",
              "Keying only on IP behind a proxy; many users share one address. Key on the authenticated subject when one exists.",
              "Returning 429 without `Retry-After` or a reset header; clients retry immediately. Send the wait time.",
            ],
          },
        ),
        topic(
          "caching-patterns",
          "The edge cache is powerful because it is shared; that also makes cache keys and personalization dangerous.",
          [
            "Cache keys and vary headers",
            "Stale-while-revalidate and tags",
            "Private data and bypass rules",
          ],
          "Design a cache policy for a mixed public/private API and test a personalized response.",
          {
            summary:
              "The Cache API stores responses per data center under an explicit key, and `caches.default` only caches GET responses with cacheable status codes and headers. `Cache-Control`, `s-maxage`, `ETag` and `Vary` decide reuse, while `stale-while-revalidate` serves stale content during a background refresh. A key that omits a personalization input serves one user's response to another, and a purge must target the same key the write path used.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Caching an authenticated response in the shared cache; another user receives it. Mark it `private` or key on the identity and keep it out of `caches.default`.",
              "Purging by URL when the cache key includes headers or a transform; the stale entry survives. Use cache tags or purge the exact key.",
              "Setting a long TTL with no validator; a deploy serves old HTML for hours. Add an `ETag` and a short TTL for documents.",
            ],
          },
        ),
        topic(
          "logging-and-monitoring",
          "Workers Logs and analytics answer different questions; structured events make both useful.",
          [
            "Structured logs and request IDs",
            "Workers Logs and tail consumers",
            "Error rates, latency and cost alerts",
          ],
          "Emit one structured event per request and build a query for the slowest route.",
          {
            summary:
              "`console.log` in a Worker emits a log event that Workers Logs indexes, and a tail Worker receives those events plus exceptions through its `tail()` handler. Each invocation reports CPU time, wall time and outcome, so latency and CPU are separate signals in analytics. Prose logs cannot be grouped by route, while a structured event with a request ID, route and status supports an alert and a trace across services.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Logging every item in a large batch; log volume grows with payload size and the tail consumer falls behind. Log one summary per invocation.",
              "Using `Date.now()` deltas as CPU time; wall time includes waiting on I/O. Read the invocation's CPU metric instead.",
              "Shipping logs with an awaited `fetch()` before responding; logging becomes a latency dependency. Use `waitUntil` or a tail Worker.",
            ],
          },
        ),
        topic(
          "service-bindings",
          "Private service-to-service calls avoid public latency and exposure, but need their own authentication and contracts.",
          [
            "Binding configuration and environments",
            "Shared secrets and request validation",
            "Failure isolation and timeouts",
          ],
          "Call one internal service through a binding with a shared key and a timeout.",
          {
            summary:
              "A service binding lets one Worker call another through `env.SERVICE.fetch()`, resolving inside Cloudflare's network without a public hostname or an extra TLS handshake. The callee receives a normal `Request`, and the platform adds no authentication beyond what the caller sends. Private calls remove exposure and a network hop, but the callee must validate a shared secret or signed header because any Worker holding the binding can reach it.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Assuming a service binding authenticates the caller; the callee sees only what the caller sends. Pass and verify a signed token.",
              "Calling the public URL from a Worker in the same account; traffic leaves and re-enters the edge. Bind the service instead.",
              "Sharing one binding across environments; a preview Worker can call production. Declare bindings per environment.",
            ],
            resources: [
              {
                title: "Cloudflare Workers: Service bindings RPC",
                url: "https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "browser-rendering",
          "Headless browsers unlock screenshots and scraping at the edge, with a real cost and abuse surface.",
          [
            "Session lifecycle and concurrency",
            "Screenshots, PDFs and page evaluation",
            "Timeouts, SSRF and content limits",
          ],
          "Capture a screenshot through Browser Rendering and block private network targets.",
          {
            summary:
              "Browser Rendering runs headless Chromium sessions through a `BROWSER` binding, and each open session consumes account concurrency until it closes or times out. A Worker can navigate, evaluate script and capture a screenshot or PDF, within limits on session duration and concurrent browsers. A session leaked on an error path exhausts concurrency for later requests, and rendering a user-supplied URL without blocking private ranges turns the Worker into an SSRF proxy.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Not closing the browser in a `finally` block; a failed navigation leaks the session and blocks later requests. Always close it.",
              "Passing a user-supplied URL without validating the host; private addresses and metadata endpoints become reachable. Allowlist schemes and hosts, and resolve DNS before navigating.",
              "Rendering on every request; Chromium startup dominates latency. Cache the screenshot or PDF in R2 with a TTL.",
            ],
          },
        ),
      ],
    },
  ],
};
