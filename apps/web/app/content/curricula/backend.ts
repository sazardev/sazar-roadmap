import type { Curriculum } from "../types";
import { topic } from "../types";

export const backend: Curriculum = {
  slug: "backend",
  title: "Backend Engineering",
  tagline: "Contracts, data and failure modes at the center of the system.",
  description:
    "Learn to build servers that stay understandable under load and honest under failure: HTTP, APIs, persistence, architecture, security and the operational feedback loop. The path favors small systems that are measured, not large systems that are only described.",
  level: "beginner",
  icon: "server",
  estimatedHours: 80,
  stages: [
    {
      slug: "http-and-servers",
      title: "HTTP and servers",
      description:
        "What a server actually receives, how it responds and where latency and failure enter the picture.",
      topics: [
        topic(
          "how-does-the-internet-work",
          "A backend is a participant in a network, not an isolated program; the network explains most production surprises.",
          [
            "Packets, routing and the request/response cycle",
            "DNS, TCP/TLS and connection reuse",
            "Latency, timeouts and retries",
          ],
          "Trace a request to a service you control and record DNS, connect, TLS and response timings.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "what-is-http",
          "HTTP semantics are the API contract users and browsers already understand; work with them instead of around them.",
          [
            "Methods, status codes and caching semantics",
            "Headers, content types and compression",
            "HTTP versions and connection behavior",
          ],
          "Implement one endpoint by hand and verify its status codes, headers and caching behavior with curl.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "learn-about-web-servers",
          "A web server is a process, a socket and a policy; knowing the layers makes configuration choices intelligible.",
          [
            "Listeners, workers and connection limits",
            "Reverse proxies, TLS termination and static files",
            "Timeouts, keep-alive and graceful shutdown",
          ],
          "Put a reverse proxy in front of a small app and measure how it changes headers, TLS and static asset behavior.",
          { difficulty: "foundation", minutes: 55 },
        ),
        topic(
          "pick-a-backend-language",
          "The language is less important than the runtime, the ecosystem and the team's ability to debug it at 3 a.m.",
          [
            "Type systems and runtime models",
            "Concurrency and memory behavior",
            "Library maturity and operational tooling",
          ],
          "Build the same JSON endpoint in two languages and write a decision record covering performance, ergonomics and deployability.",
          { difficulty: "foundation", minutes: 60 },
        ),
        topic(
          "learn-the-basics",
          "Before frameworks, you need a mental model of processes, files, environment and logs.",
          [
            "Processes, signals and exit codes",
            "Configuration and environment variables",
            "Filesystem, permissions and logs",
          ],
          "Run a service without a framework, send it a signal, and verify that it shuts down without dropping in-flight requests.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "dns-and-how-it-works",
          "DNS is the first dependency of every request and a common source of outages that look like application bugs.",
          [
            "Records, zones and resolvers",
            "TTL, caching and propagation",
            "Health checks and failover",
          ],
          "Set up a subdomain with a health-checked target and document what happens when the origin disappears.",
          { difficulty: "foundation", minutes: 35 },
        ),
        topic(
          "what-is-hosting",
          "Where code runs determines its failure model, cost shape and security boundary.",
          [
            "Virtual machines, containers and serverless",
            "Managed databases and network boundaries",
            "Cost, scaling and operational ownership",
          ],
          "Compare two hosting models for the same workload and write the failure and cost assumptions for each.",
          { difficulty: "foundation", minutes: 40 },
        ),
      ],
    },
    {
      slug: "apis-and-contracts",
      title: "APIs and contracts",
      description:
        "Design interfaces that clients can trust: resources, errors, versioning and real-time transport.",
      topics: [
        topic(
          "learn-about-apis",
          "An API is a promise; the shape of that promise determines how easily clients evolve.",
          [
            "Resources, operations and naming",
            "Errors, pagination and idempotency",
            "Versioning and compatibility",
          ],
          "Design an API for a small domain, write its error model, and review it against three client use cases.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "rest",
          "REST is a set of constraints, not a URL style; the constraints explain when it helps and when it does not.",
          [
            "Statelessness and uniform interfaces",
            "Resource design and hypermedia",
            "Caching and conditional requests",
          ],
          "Add ETag and conditional GET support to one resource and verify the 304 path with a client.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "json-apis",
          "Most APIs are JSON-over-HTTP; the details of serialization and error shape become the client's daily experience.",
          [
            "Schema design and nullable fields",
            "Timestamps, money and identifiers",
            "Error envelopes and validation messages",
          ],
          "Define a JSON schema for one endpoint and generate a typed client from it.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "graphql",
          "GraphQL moves composition to the client, which is powerful and expensive if the server does not bound the work.",
          [
            "Schemas, resolvers and nullability",
            "N+1 queries and batching",
            "Query depth, cost and persisted queries",
          ],
          "Implement a small schema, then add a dataloader and a query cost limit before exposing it.",
          { difficulty: "advanced", minutes: 70 },
        ),
        topic(
          "grpc",
          "Typed RPC with streaming is a strong fit for internal services where HTTP JSON overhead matters.",
          [
            "Protocol buffers and service definitions",
            "Unary, server-streaming and bidirectional calls",
            "Deadlines, retries and load balancing",
          ],
          "Build one unary and one streaming RPC and test behavior under a short deadline.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "open-api-specs",
          "A machine-readable contract keeps documentation, validation and clients from drifting apart.",
          [
            "Paths, schemas and reusable components",
            "Validation and generated clients",
            "Contract tests and breaking-change detection",
          ],
          "Write an OpenAPI spec for one resource, generate a client, and fail CI when the spec breaks compatibility.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "websockets",
          "Some product behavior is genuinely bidirectional; choosing the wrong transport creates invisible complexity.",
          [
            "Handshake, frames and connection lifecycle",
            "Backpressure and fan-out",
            "Authentication, reconnection and presence",
          ],
          "Build a small presence channel with reconnect and a message rate limit, then test a dropped connection.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "server-sent-events",
          "One-way streaming is often enough for progress, notifications and AI output, with far less machinery than WebSockets.",
          [
            "Event stream format and reconnection",
            "Proxies, buffering and heartbeats",
            "When SSE is a better fit than polling",
          ],
          "Stream a long-running job's progress over SSE and verify behavior through a proxy that buffers.",
          { difficulty: "core", minutes: 45 },
        ),
      ],
    },
    {
      slug: "data-and-persistence",
      title: "Data and persistence",
      description:
        "Model data honestly, index it deliberately and understand what transactions and replication actually guarantee.",
      topics: [
        topic(
          "relational-databases",
          "Relational modeling is still the default for business data because constraints are cheaper than application bugs.",
          [
            "Tables, keys and referential integrity",
            "Normalization and intentional denormalization",
            "Query planning and indexes",
          ],
          "Model a small domain in third normal form, then add one deliberately denormalized read path with a measured reason.",
          { difficulty: "core", minutes: 70 },
        ),
        topic(
          "postgresql",
          "Postgres is a deep default: extensions, JSON, full-text search and strong transactional guarantees in one system.",
          [
            "Types, constraints and indexes",
            "EXPLAIN ANALYZE and query tuning",
            "Transactions, isolation and locking",
          ],
          "Find a slow query, read its plan, add the right index and prove the improvement with measurements.",
          { difficulty: "core", minutes: 75 },
        ),
        topic(
          "database-indexes",
          "An index is a write-time bet on a read pattern; the wrong one makes both sides slower.",
          [
            "B-tree, hash, GIN and partial indexes",
            "Composite column order and selectivity",
            "Covering indexes and write cost",
          ],
          "Create three candidate indexes for one query, compare plans and writes, and keep only the one that pays for itself.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "acid",
          "ACID is a set of guarantees with implementation costs; knowing which one you need prevents cargo-cult architecture.",
          [
            "Atomicity, consistency, isolation and durability",
            "Isolation levels and anomalies",
            "Distributed transactions and sagas",
          ],
          "Reproduce a lost update and a phantom read at two isolation levels, then choose the correct fix.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "normalization",
          "Normalization removes update anomalies; denormalization buys read speed with synchronization debt.",
          [
            "Functional dependencies and normal forms",
            "Update, insert and delete anomalies",
            "Read models and materialized projections",
          ],
          "Take a duplicated table, normalize it, and write the query that reconstructs the original view.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "orms",
          "An ORM is a convenience layer, not a replacement for SQL or query plans.",
          [
            "Identity maps, lazy loading and N+1",
            "Migrations and schema ownership",
            "When to drop to raw SQL",
          ],
          "Implement one query with an ORM and with SQL, compare the generated plans, and document the boundary.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "n1-problem",
          "The N+1 query is the most common performance bug in application code and the easiest to miss in development.",
          [
            "Detecting repeated queries",
            "Eager loading, joins and dataloaders",
            "Caching without hiding staleness",
          ],
          "Instrument a list endpoint, count its queries, and reduce them to a constant number without changing the response.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "scaling-databases",
          "Scaling is a sequence of bottlenecks; adding replicas to a write-bound system just spreads the pain.",
          [
            "Read replicas and replica lag",
            "Connection pooling and admission control",
            "Partitioning and sharding",
          ],
          "Measure reads versus writes in a workload, then propose the first scaling step and its failure mode.",
          { difficulty: "advanced", minutes: 70 },
        ),
      ],
    },
    {
      slug: "architecture-and-reliability",
      title: "Architecture and reliability",
      description:
        "Boundaries, asynchronous work and the failure handling that keeps a system useful when dependencies degrade.",
      topics: [
        topic(
          "architectural-patterns",
          "Architecture is the set of decisions that are expensive to reverse; patterns are tools, not identities.",
          [
            "Layered, hexagonal and event-driven shapes",
            "Boundaries and dependency direction",
            "Trade-offs and decision records",
          ],
          "Draw the dependency graph of one service and identify a boundary that leaks infrastructure into domain code.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "monolith",
          "A modular monolith is often the fastest and most reliable way to find real boundaries.",
          [
            "Modules, interfaces and ownership",
            "Deployment simplicity and shared resources",
            "Extraction signals and seams",
          ],
          "Split one feature into a module with an explicit public interface and measure the coupling you removed.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "microservices",
          "Distribution buys independent deployment and costs you every network failure you did not have before.",
          [
            "Service boundaries and data ownership",
            "Synchronous versus asynchronous contracts",
            "Observability, retries and idempotency",
          ],
          "Design a two-service workflow and list every new failure mode compared with the monolith version.",
          { difficulty: "advanced", minutes: 70 },
        ),
        topic(
          "message-brokers",
          "Asynchronous work decouples producers from consumers but makes ordering, duplication and visibility explicit problems.",
          [
            "Queues, topics and delivery semantics",
            "Idempotency and dead letters",
            "Backpressure and consumer lag",
          ],
          "Build a job consumer that is idempotent under duplicate delivery and verify the dead-letter path.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "caching",
          "Caching is a consistency decision disguised as a performance optimization.",
          [
            "Cache keys, TTL and invalidation",
            "Cache-aside, write-through and stampedes",
            "Stale-while-revalidate and user-specific data",
          ],
          "Add a cache to one read path, then write the invalidation rule and a test for the stale case.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "circuit-breaker",
          "A failing dependency should fail fast and recover gradually, not consume every worker while it times out.",
          [
            "Closed, open and half-open states",
            "Timeouts, retries and jitter",
            "Fallbacks and user-visible degradation",
          ],
          "Wrap one dependency in a breaker and demonstrate the difference under a 5-second failure.",
          { difficulty: "advanced", minutes: 55 },
        ),
        topic(
          "graceful-degradation",
          "A useful partial response beats a perfect timeout; design the degraded state before the incident.",
          [
            "Critical versus optional dependencies",
            "Cached and synthetic fallbacks",
            "Communicating partial failure to clients",
          ],
          "Take one page, remove a non-critical dependency and make it render a clearly labeled degraded state.",
          { difficulty: "advanced", minutes: 50 },
        ),
        topic(
          "twelve-factor-apps",
          "The twelve factors are a checklist for deployability, not a religion; most incidents trace back to one of them.",
          [
            "Config, dependencies and build/release/run",
            "Stateless processes and disposability",
            "Logs, admin processes and port binding",
          ],
          "Audit one service against the factors and fix the two that would make a rollback or restart unsafe.",
          { difficulty: "core", minutes: 45 },
        ),
      ],
    },
    {
      slug: "security-and-operations",
      title: "Security and operations",
      description:
        "Identity, authorization, secure defaults and the observability that turns production into evidence.",
      topics: [
        topic(
          "authentication",
          "Authentication answers who is calling; getting it wrong invalidates every authorization decision above it.",
          [
            "Sessions, tokens and passkeys",
            "Password storage and rotation",
            "Account recovery and rate limiting",
          ],
          "Threat-model one login flow and add rate limiting, secure cookies and session revocation.",
          { difficulty: "core", minutes: 65 },
        ),
        topic(
          "jwt",
          "A JWT is a signed claim, not a session store; treating it as both creates revocation and leakage problems.",
          [
            "Signing, verification and algorithm confusion",
            "Claims, expiry and audience",
            "Revocation and short-lived tokens",
          ],
          "Implement verification with an explicit algorithm allowlist and test an expired and a wrong-audience token.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "oauth",
          "OAuth delegates access; misunderstanding the grant type is how tokens end up in the wrong place.",
          [
            "Authorization code with PKCE",
            "Scopes, consent and token exchange",
            "Client types and redirect URI safety",
          ],
          "Trace an authorization-code flow end to end and list every secret and redirect validation point.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "owasp-risks",
          "Most breaches are boring: broken access control, injection, misconfiguration and vulnerable dependencies.",
          [
            "Broken access control and object-level checks",
            "Injection and parameterized queries",
            "Misconfiguration, secrets and supply chain",
          ],
          "Run a threat-model session on one endpoint and write a test for each authorization boundary.",
          { difficulty: "core", minutes: 60 },
        ),
        topic(
          "https",
          "TLS is table stakes, but certificate lifecycle, HSTS and mixed content are still operational work.",
          [
            "Certificates, chains and renewal",
            "TLS termination and proxy trust",
            "HSTS, secure cookies and mixed content",
          ],
          "Verify a deployment's certificate chain and HSTS behavior with an external TLS check.",
          { difficulty: "core", minutes: 35 },
        ),
        topic(
          "observability",
          "You cannot debug what you did not record; logs, metrics and traces answer different questions.",
          [
            "Structured logs and correlation IDs",
            "Metrics, histograms and SLOs",
            "Traces and dependency latency",
          ],
          "Instrument one request path with a correlation ID, a latency histogram and one useful error metric.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "ci--cd",
          "A deployment pipeline is the safety system for every other engineering decision.",
          [
            "Build once, promote the same artifact",
            "Tests, migrations and approval gates",
            "Rollback, feature flags and post-deploy checks",
          ],
          "Build a pipeline that fails on a type error, runs a migration check and supports a one-command rollback.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "testing",
          "The test pyramid is a feedback-speed strategy: catch cheap failures close to the code and reserve end-to-end tests for trust.",
          [
            "Unit, integration and contract tests",
            "Test data, isolation and determinism",
            "Coverage as a signal, not a target",
          ],
          "Add one integration test against a real dependency and one contract test for a consumer boundary.",
          { difficulty: "core", minutes: 60 },
        ),
      ],
    },
  ],
};
