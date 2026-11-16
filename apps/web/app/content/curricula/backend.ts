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
          {
            summary:
              "A request crosses several independent systems: recursive DNS resolution turns a name into an address, the TCP handshake establishes a connection, and TLS negotiates keys before the first byte of HTTP. Each hop adds its own latency and failure mode, so a timeout budget must cover resolution, connection and response rather than the server handler alone.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Blaming the application for a slow request without splitting DNS, connect, TLS and time-to-first-byte; instrument each phase before changing code.",
              "Setting one timeout for the whole call chain so a retry starts after the client has already given up; give each hop a deadline and pass the remaining budget.",
              "Assuming DNS changes take effect immediately; honor TTLs and lower them before a migration rather than during an incident.",
            ],
          },
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
          {
            summary:
              "HTTP is a stateless request/response protocol where methods, status codes and headers carry semantics that caches, proxies and clients act on. A GET is expected to be safe and cacheable, a 404 is not a 500, and validators such as ETag turn a full response into a 304; violating those contracts breaks intermediaries you do not control.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Returning 200 with an error body, which defeats client retry logic and monitoring; use the status class that matches the outcome.",
              "Treating POST as idempotent and retrying it blindly; give retryable writes an idempotency key that the server can deduplicate.",
              "Caching a personalized response under a shared key; add Vary or Cache-Control: private before it reaches a CDN.",
            ],
          },
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
          {
            summary:
              "A web server binds a socket, accepts connections and applies policy for TLS termination, static files, keep-alive and request limits. Because the listener, worker model and proxy layer each hold resources, a missing read timeout or an oversized connection pool turns a slow client into exhaustion of the whole process.",
            difficulty: "foundation",
            minutes: 55,
            pitfalls: [
              "Running without read, write or idle timeouts; slow clients then hold workers indefinitely, so set all three at the server and the proxy.",
              "Killing the process on SIGTERM while requests are in flight; stop accepting, drain within a deadline, close pools and then exit.",
              "Terminating TLS at a proxy but trusting forwarded headers from any source; restrict trusted proxies and rewrite client-IP headers at the edge.",
            ],
          },
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
          {
            summary:
              "The runtime model decides more than syntax: a single-threaded event loop, a thread-per-request server and a goroutine scheduler fail differently under CPU load, blocking I/O and memory pressure. Pick by measuring the workload you actually run and by whether the team can read a stack trace, profile the process and ship a dependency upgrade.",
            difficulty: "foundation",
            minutes: 60,
            pitfalls: [
              "Choosing by benchmark throughput alone while ignoring p99 latency, memory per connection and cold-start time; measure the shape of your traffic.",
              "Adopting a language whose concurrency model the team cannot debug; require one profiler and one incident runbook before committing.",
              "Treating framework popularity as language maturity; check library maintenance, release cadence and security response for the packages you need.",
            ],
            resources: [
              {
                title: "About Node.js",
                url: "https://nodejs.org/en/about",
                kind: "docs",
              },
              {
                title: "Python documentation: Concurrency",
                url: "https://docs.python.org/3/library/concurrency.html",
                kind: "docs",
              },
            ],
          },
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
          {
            summary:
              "A service is a process with a lifecycle: it reads configuration from the environment, opens files and sockets, handles signals, and exits with a status that supervisors interpret. Treating startup, shutdown and logging as framework details hides the failure path where a restart drops in-flight work or a missing variable surfaces only in production.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Parsing configuration lazily on first use; validate every required variable at startup and exit non-zero with the missing key named.",
              "Handling SIGTERM by exiting immediately; stop accepting, finish in-flight work within a deadline, close pools, then exit 0.",
              "Writing unlabeled text to stdout and relying on a shell redirect; emit structured lines with a timestamp and level so the supervisor can ship them.",
            ],
          },
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
          {
            summary:
              "DNS resolves names through a hierarchy of recursive and authoritative servers, and the answer is cached for the record's TTL at every resolver in between. Failover therefore depends on TTL, health-check behavior and client resolver caching, so a record change is a scheduled operation rather than an instant switch.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Lowering a TTL at the same moment as a failover; shorten it at least one old TTL ahead of the change.",
              "Pointing a CNAME at a host with no health check and calling it failover; use a health-checked target or a load balancer.",
              "Debugging with the local stub resolver only; query the authoritative server and a public resolver to see divergent cached answers.",
            ],
          },
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
          {
            summary:
              "Hosting choices set the failure domain: a virtual machine keeps state on local disk, a container is replaced on a node, and a serverless function has a cold start, an execution limit and no durable local filesystem. The bill and the blast radius follow from those constraints, so pick the model that matches your state, traffic shape and operational staff.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Storing uploads on the instance filesystem; move them to object storage before the next deploy replaces the host.",
              "Choosing serverless for long-running connections without checking execution and idle limits; use a runtime that keeps the connection alive.",
              "Sizing only for average traffic and ignoring scale-up latency; keep headroom or pre-warm capacity for the p99 burst.",
            ],
          },
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
          {
            summary:
              "An API contract is the set of requests, responses and failure states clients can rely on, including pagination, error codes, idempotency and retry behavior. Compatibility lives in the details: adding a required field or changing a status code breaks consumers even when the endpoint still returns 200, so version and deprecate explicitly.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Documenting only the happy path; specify validation errors, conflict responses and rate-limit headers so clients can handle them.",
              "Returning an unbounded list; add cursor pagination with a stable sort key before the table grows.",
              "Changing a field's type or nullability in place; add a new field, migrate clients, then remove the old one on a schedule.",
            ],
          },
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
          {
            summary:
              "REST constrains an interface to resources identified by URIs, manipulated through a uniform set of methods, with self-descriptive messages and stateless requests. Those constraints let caches and intermediaries act without application knowledge, at the cost of exposing more requests and larger payloads than a purpose-built RPC.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Putting verbs in paths such as /getUser and using POST for reads; model the resource and let the method carry the operation.",
              "Keeping session state on the server between requests; send credentials or a token with each request so any instance can serve it.",
              "Serving stale representations without ETag or Last-Modified; add validators and honor If-None-Match with a 304.",
            ],
          },
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
          {
            summary:
              "JSON has no integer type, no date type and no required schema, so the contract is whatever the producer and consumer agree on. Explicit schemas, string-encoded 64-bit identifiers and a single error envelope prevent precision loss and the per-endpoint parsing code that accumulates around loosely typed payloads.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Decoding identifiers into IEEE-754 doubles; keep 64-bit IDs as strings or use a decimal-aware parser.",
              "Emitting timestamps in mixed formats and zones; standardize on RFC 3339 in UTC and validate on input.",
              "Letting each handler invent its own error shape; define one envelope with a stable code, message and field-level details.",
            ],
          },
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
          {
            summary:
              "GraphQL exposes a typed schema and lets clients choose fields, so a single request can expand into nested resolver calls whose cost the client controls. Without depth limits, per-field cost analysis and batching, one query can multiply database round trips and exhaust the server while looking small on the wire.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Resolving a list's children one row at a time; batch with a dataloader or a join and assert the query count in a test.",
              "Accepting arbitrary query depth and breadth from the public internet; enforce depth, complexity and persisted-query allowlists.",
              "Making every field nullable to avoid errors; non-null boundaries expose failures early but require deliberate error propagation.",
            ],
          },
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
          {
            summary:
              "gRPC carries length-prefixed Protocol Buffers over HTTP/2, which gives typed messages, multiplexed streams and deadlines that propagate to the server. Field numbers, not names, define the wire contract, so renumbering or reusing a tag silently corrupts data across versions.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Reusing a removed field number; reserve the tag and name so old and new peers cannot misinterpret the bytes.",
              "Setting no deadline on a call and letting a stuck dependency pin a stream; pass a context deadline and propagate cancellation.",
              "Retrying a non-idempotent unary call on deadline exceeded; distinguish safe retries and attach an idempotency key.",
            ],
          },
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
          {
            summary:
              "An OpenAPI document describes paths, operations, schemas and security requirements in a machine-readable form that generators, validators and gateways consume. Generating it from code or validating it in CI turns drift into a failing check; a hand-maintained copy diverges until clients trust their own versions.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Treating the spec as documentation only; generate clients and request validation from it so drift fails a build.",
              "Marking a new required request field as optional in the spec; bump the contract and roll out compatibility before enforcement.",
              "Leaving security schemes out of operations; declare scopes per operation or generated clients will omit credentials.",
            ],
          },
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
          {
            summary:
              "A WebSocket starts as an HTTP upgrade, then switches to framed messages over a single TCP connection that stays open in both directions. Because the server holds a socket and a send buffer per client, fan-out needs backpressure through a bounded queue per connection, a slow-consumer policy and a reconnect strategy.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Broadcasting with blocking writes from one thread or goroutine; give each connection a bounded send queue and drop or close slow peers.",
              "Authenticating only during the handshake and never expiring the connection; revalidate tokens or cap session lifetime.",
              "Assuming reconnect is automatic and delivery is guaranteed; use sequence numbers and a resubscribe or replay path.",
            ],
          },
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
          {
            summary:
              "SSE keeps one HTTP response open and writes text/event-stream frames containing event, data, id and retry fields, so the browser can reconnect and resume with Last-Event-ID. Proxies that buffer responses or time out idle connections will delay or cut the stream unless heartbeats and the right headers are configured.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Forgetting Cache-Control: no-cache and leaving proxy buffering on; the client receives nothing until the buffer fills.",
              "Sending comments only when there is data; emit a heartbeat so idle-connection timeouts do not close the stream.",
              "Ignoring Last-Event-ID on reconnect; persist a cursor so a resumed client does not miss or replay events.",
            ],
          },
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
          {
            summary:
              "A relational database stores rows in tables and enforces keys, foreign keys and check constraints in the same transaction as the write. Those constraints move invariants out of application code, while normalization keeps one fact in one place and the query planner decides how each join is executed.",
            difficulty: "core",
            minutes: 70,
            pitfalls: [
              "Enforcing uniqueness only in application code; add a unique constraint so two concurrent requests cannot both pass a check.",
              "Adding an index for every foreign key without checking the read path; index the columns your queries filter and sort by.",
              "Using SELECT * in production paths; name columns so schema changes and covering indexes stay predictable.",
            ],
          },
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
          {
            summary:
              "Postgres runs each statement inside a transaction with MVCC, so readers see a snapshot instead of blocking writers, and writers can conflict at the row level. Autovacuum reclaims dead tuples, EXPLAIN ANALYZE reveals the chosen plan, and a long transaction holds back cleanup for the whole database.",
            difficulty: "core",
            minutes: 75,
            pitfalls: [
              "Leaving idle-in-transaction sessions open; set idle_in_transaction_session_timeout and keep transactions short.",
              "Adding an index without CONCURRENTLY on a busy table; it blocks writes for the duration of the build.",
              "Reading EXPLAIN estimates as facts; run EXPLAIN (ANALYZE, BUFFERS) and compare estimated with actual rows.",
            ],
          },
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
          {
            summary:
              "A B-tree index keeps keys sorted in pages, so equality, range and ordered reads touch O(log n) pages instead of scanning the table. Every index adds write amplification and storage, and a composite index only helps when the query filters on its leading columns in a usable order.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Creating single-column indexes for a multi-column predicate; use a composite index ordered by equality columns first, then the range column.",
              "Assuming an index is used because it exists; read the plan for a sequential scan on a low-selectivity predicate.",
              "Indexing a raw column when the query wraps it in a function; add an expression index or rewrite the predicate to match.",
            ],
          },
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
          {
            summary:
              "ACID is four separate guarantees: atomicity through undo or redo logs, consistency through constraints, isolation through concurrency control, and durability through a write-ahead log flushed to disk. Isolation is the adjustable one: READ COMMITTED, REPEATABLE READ and SERIALIZABLE permit different anomalies, and each stronger level costs concurrency or retries.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Assuming REPEATABLE READ prevents write skew; use SERIALIZABLE or explicit locking for invariants that span rows.",
              "Retrying a serialization failure without jitter or a limit; retry the whole transaction with backoff and a cap.",
              "Holding a transaction open across a network call; it pins locks and MVCC snapshots, so move I/O outside the transaction.",
            ],
          },
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
          {
            summary:
              "Normalization decomposes relations so each fact is stored once, driven by functional dependencies and the insert, update and delete anomalies they cause. Third normal form removes most duplication; denormalized read models then reintroduce copies with an explicit refresh path and a staleness budget.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Normalizing everything and joining ten tables per request; measure the read path and denormalize one projection with an owner.",
              "Storing a derived total with no invalidation rule; recompute it in the same transaction or rebuild from source on a schedule.",
              "Applying 3NF without listing dependencies; write the functional dependencies before choosing the split.",
            ],
          },
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
          {
            summary:
              "An ORM maps rows to objects and generates SQL from method chains, adding an identity map, lazy loading and migration tooling. The abstraction hides join strategy and transaction boundaries, so the generated SQL and query count must be inspected before the data volume grows.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Letting lazy loading run inside a response loop; fetch the relation explicitly and assert the query count.",
              "Mixing ORM writes and raw SQL without a shared transaction; pass the same transaction handle through both paths.",
              "Running automatic schema migration on deploy without review; generate the SQL and apply it as a versioned, reversible step.",
            ],
          },
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
          {
            summary:
              "The N+1 pattern issues one query for a list and then one per row for a relation, turning a constant cost into a function of result size. The fix is to change the access pattern with a join, an IN batch or a dataloader, then assert the query count so a later refactor cannot reintroduce it.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Adding a cache in front of each per-row query; it hides the pattern and leaves a cold-start stampede.",
              "Batching with an unbounded IN list; chunk the keys to stay under parameter limits and keep plans stable.",
              "Testing with three rows; seed enough rows and count SQL statements per request.",
            ],
          },
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
          {
            summary:
              "Database scaling follows the bottleneck: connection limits, then read volume, then write volume, then the size of a single primary. Read replicas add lag, sharding adds cross-shard transactions, and a connection pool larger than the server's limit makes every query slower.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Sending reads to a replica and expecting read-your-writes; route the critical read to the primary or track the replication log position.",
              "Opening a connection per request; use a bounded pool sized against server capacity and queue with a timeout.",
              "Sharding before exhausting indexes and query fixes; each shard adds routing, rebalancing and cross-shard failure modes.",
            ],
          },
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
          {
            summary:
              "Architecture is the set of boundaries that determine what can change independently, and patterns such as layered, hexagonal and event-driven describe how those boundaries are drawn. A boundary that lets domain code import the database or HTTP framework cannot be reversed cheaply, so dependency direction matters more than the pattern's name.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Choosing a pattern before naming the change you need to make; start from a concrete axis of variation.",
              "Letting domain types carry ORM or framework annotations; keep the domain package free of infrastructure imports.",
              "Drawing boxes without dependency arrows; record which module may import which and enforce it in CI.",
            ],
          },
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
          {
            summary:
              "A modular monolith compiles and deploys as one unit while separating modules by explicit interfaces and data ownership. Transactions and debugging stay local, but a module that reaches directly into another module's tables recreates the coupling that a service boundary would have prevented.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Sharing one database schema across modules with unrestricted joins; assign tables to a module and expose a query interface.",
              "Extracting a service before the module boundary is stable; make the seam explicit and measure the coupling first.",
              "Using one global package for shared helpers; it becomes a dependency sink that every module imports.",
            ],
          },
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
          {
            summary:
              "A microservice architecture gives each service its own deployable artifact and data store, and replaces in-process calls with network calls that can time out, retry or arrive twice. Independent deployment is real only when contracts are versioned, failures are contained and each service can be observed on its own.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Sharing a database between services; it couples schemas and defeats independent deploys, so split ownership or use an API.",
              "Retrying every failed call without idempotency; a duplicate write or charge is worse than a visible error.",
              "Treating a synchronous call chain as reliable; add deadlines, circuit breaking and a fallback for each hop.",
            ],
          },
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
          {
            summary:
              "A broker durably stores messages and delivers them to consumers under a visibility timeout, which hides an in-flight message from other consumers while the handler runs. Delivery is usually at-least-once, so handlers must be idempotent, retries need backoff and poison messages need a dead-letter path with an owner.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Deleting a message before the side effect commits; acknowledge after the write, or make the handler idempotent.",
              "Setting a visibility timeout shorter than the work; the message is redelivered while the first consumer still runs.",
              "Retrying a poison message forever; cap attempts and route it to a dead-letter queue with the failure reason.",
            ],
          },
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
          {
            summary:
              "A cache stores a copy closer to the reader, so the latency win comes with a second copy that can be stale. Cache-aside reads miss, load and fill; invalidation must handle concurrent writers, and a missing negative-cache or TTL rule lets one bad value outlive the request that produced it.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Caching a negative lookup without a short TTL; a later write stays invisible until the entry expires.",
              "Invalidating before the database commit; a concurrent read repopulates the old value, so invalidate after commit or use versioned keys.",
              "Letting every request rebuild an expired hot key; add a single-flight lock or stale-while-revalidate with jitter.",
            ],
          },
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
          {
            summary:
              "A circuit breaker tracks failures per dependency and moves from closed to open, then to half-open for a limited probe before closing again. It converts a queue of doomed waits into fast failures, but only when the dependency call times out inside the caller's deadline and retries are jittered and bounded.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Opening the breaker on every exception, including validation errors; count only dependency failures such as timeouts and 5xx.",
              "Sending all half-open probes at once; admit a small number and require consecutive successes before closing.",
              "Combining retries without jitter; synchronized retries create a thundering herd exactly when the dependency recovers.",
            ],
          },
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
          {
            summary:
              "Graceful degradation classifies each dependency as critical or optional and defines a response for the optional ones: cached data, a default, or an explicit partial result. The degraded path must be exercised and labeled, otherwise it silently becomes a second, untested product surface.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Returning an empty list when a recommendation service fails; label the section unavailable so clients do not read absence as truth.",
              "Serving stale data with no age or source marker; include a timestamp or header so callers can decide.",
              "Leaving the fallback unexercised; inject the dependency failure in a test and assert the degraded response.",
            ],
          },
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
          {
            summary:
              "The twelve factors describe a process that builds once, configures through the environment, runs stateless and disposes cleanly. They matter at the point of change: a build that differs between environments, a local file that survives one deploy or a log stream the platform cannot collect turns a routine restart into an incident.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Baking environment-specific config into the artifact; build once and inject config at release time.",
              "Writing state to the local filesystem and assuming it survives; use a backing service or object storage.",
              "Running migrations as an init step in every replica; make them a single ordered release job.",
            ],
          },
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
          {
            summary:
              "Authentication verifies a principal through something they know, have or are, then issues a session or token that later requests present. Password storage with a salted, deliberately slow hash, secure cookie attributes, rotation and rate limiting are part of the mechanism; a correct login form without them still leaks accounts.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Hashing passwords with a fast general-purpose digest; use Argon2id, scrypt or bcrypt with a per-user salt.",
              "Storing session tokens in localStorage and accepting them from any origin; prefer HttpOnly, Secure, SameSite cookies with CSRF protection.",
              "Allowing unlimited login attempts; rate-limit by account and source and add exponential backoff.",
            ],
          },
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
          {
            summary:
              "A JWT is a base64url header, payload and signature, verified with a key and an explicit algorithm allowlist. The signature proves integrity, not freshness or authority: expiry, audience and issuer must be checked, and a stateless token cannot be revoked without a denylist or a short lifetime.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Accepting the alg header from the token, including none; pin the expected algorithm at verification.",
              "Validating only the signature and skipping exp, aud or iss; reject tokens outside the intended scope.",
              "Putting secrets or large authorization state in claims; payloads are readable and bloat every request.",
            ],
          },
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
          {
            summary:
              "The authorization-code flow with PKCE exchanges a one-time code for a short-lived access token, binding the request to the client that started it. Exact redirect URI matching, state validation and scope minimization form the security boundary; a loose redirect or a leaked code gives an attacker the account.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Skipping PKCE for public clients; an app registered for the same custom scheme can intercept the code.",
              "Matching redirect URIs by prefix; require an exact registered URI and reject open redirects.",
              "Requesting broad scopes up front; request the minimum per operation and let consent stay meaningful.",
            ],
          },
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
          {
            summary:
              "Broken access control, injection, misconfiguration and vulnerable dependencies account for a large share of web breaches. Each has a specific control: an ownership predicate in the query, prepared statements, centralized secret management and a reachability-aware vulnerability scan.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Checking that a user is logged in but not that they own the object; enforce the ownership predicate in the query.",
              "Building SQL with string interpolation; use parameterized queries and allowlist identifiers that cannot be bound.",
              "Trusting client-side validation; repeat every check at the server boundary and test the bypass.",
            ],
          },
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
          {
            summary:
              "TLS authenticates the server with a certificate chain and encrypts the connection with negotiated keys, while HSTS tells browsers to refuse plaintext for future requests. Certificate renewal, chain completeness and proxy trust are operational work; an expired or incomplete chain makes every client fail before HTTP is reached.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Serving an incomplete intermediate chain that works in one browser and fails in another; serve the full chain and test with openssl s_client.",
              "Enabling HSTS with a long max-age before every subdomain supports TLS; start short and verify includeSubDomains.",
              "Terminating TLS at a proxy and accepting any X-Forwarded-Proto; trust the header only from known proxies.",
            ],
          },
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
          {
            summary:
              "Observability combines structured logs, metrics and traces, each answering a different question about a request. A correlation ID ties them together, histograms capture the tail instead of the mean, and an SLO turns raw counters into a decision about whether the system is healthy.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Recording only average latency; a mean hides the p99 that users feel, so use histograms.",
              "Logging unstructured prose without request or trace IDs; emit key-value fields and propagate the trace context.",
              "Creating high-cardinality metric labels such as user ID; aggregate by route and status class instead.",
            ],
          },
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
          {
            summary:
              "A pipeline builds one artifact, runs tests and migration checks against it, then promotes that same artifact through environments. Rollback and feature flags limit the blast radius, while a build that recompiles per environment or a migration that cannot run backward makes recovery slower than the deploy.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Building a different artifact for staging and production; promote the tested digest or image, not a rebuilt branch.",
              "Running a destructive migration before the old code is gone; use expand-contract steps that both versions can read.",
              "Treating rollback as redeploying the previous commit; rehearse it with the database state the new version left behind.",
            ],
          },
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
          {
            summary:
              "Tests are organized by feedback speed: unit tests isolate logic in milliseconds, integration tests exercise real boundaries such as a database or queue, and end-to-end tests prove a critical path. Flaky or slow tests at the wrong layer consume the time that would catch regressions, so each layer needs a clear scope and deterministic fixtures.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Mocking the database in integration tests and calling it coverage; exercise the real constraint and transaction behavior.",
              "Sharing one fixture across tests that mutate it; create per-test data and clean up by transaction or unique keys.",
              "Chasing a coverage percentage with assertion-free tests; assert observable behavior and delete tests that cannot fail.",
            ],
          },
        ),
      ],
    },
  ],
};
