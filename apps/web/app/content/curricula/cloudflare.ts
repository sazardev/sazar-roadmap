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
          { difficulty: "foundation", minutes: 45 },
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
          { difficulty: "foundation", minutes: 40 },
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
          { difficulty: "foundation", minutes: 50 },
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
          { difficulty: "core", minutes: 40 },
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
          { difficulty: "core", minutes: 50 },
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
          { difficulty: "core", minutes: 45 },
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
          { difficulty: "core", minutes: 45 },
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
          { difficulty: "core", minutes: 50 },
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
          { difficulty: "core", minutes: 50 },
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
          { difficulty: "core", minutes: 40 },
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
          { difficulty: "core", minutes: 45 },
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
          { difficulty: "core", minutes: 45 },
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
          { difficulty: "core", minutes: 55 },
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
          { difficulty: "advanced", minutes: 50 },
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
          { difficulty: "core", minutes: 40 },
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
          { difficulty: "core", minutes: 60 },
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
          { difficulty: "advanced", minutes: 50 },
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
          { difficulty: "advanced", minutes: 55 },
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
          { difficulty: "core", minutes: 50 },
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
          { difficulty: "core", minutes: 50 },
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
          { difficulty: "advanced", minutes: 65 },
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
          { difficulty: "core", minutes: 55 },
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
          { difficulty: "advanced", minutes: 45 },
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
          { difficulty: "advanced", minutes: 55 },
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
          { difficulty: "advanced", minutes: 60 },
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
          { difficulty: "core", minutes: 55 },
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
          { difficulty: "advanced", minutes: 60 },
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
          { difficulty: "advanced", minutes: 50 },
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
          { difficulty: "core", minutes: 50 },
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
          { difficulty: "core", minutes: 35 },
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
          { difficulty: "core", minutes: 45 },
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
          { difficulty: "advanced", minutes: 50 },
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
          { difficulty: "core", minutes: 45 },
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
          { difficulty: "advanced", minutes: 45 },
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
          { difficulty: "advanced", minutes: 45 },
        ),
      ],
    },
  ],
};
