import type { Curriculum } from "../types";
import { topic } from "../types";

export const systemDesign: Curriculum = {
  slug: "system-design",
  title: "Distributed System Design",
  tagline: "Requirements, trade-offs and failure modes at scale.",
  description:
    "A guided path through the design of systems that span machines: requirements, APIs, load balancing, data partitioning, caching, consistency, resilience, messaging and observability. Each stage forces a trade-off and asks you to defend it with numbers, failure modes and a measurement plan.",
  level: "advanced",
  icon: "waypoints",
  estimatedHours: 78,
  stages: [
    {
      slug: "design-method",
      title: "The design method",
      description:
        "Learn to turn a vague prompt into requirements, constraints and a defensible architecture. By the end you can bound a design with users, requests, data size and latency before drawing a single box.",
      topics: [
        topic(
          "what-is-system-design",
          "A design is a set of decisions about boundaries and failure; skipping them turns every later choice into an accident.",
          [
            "Component boundaries and ownership",
            "Request and data flow across trust boundaries",
            "Non-functional requirements as design constraints",
            "Architecture decision records",
          ],
          "Write a one-page design brief for a URL shortener with users, read/write ratio, storage growth, p95 latency target and one explicitly rejected architecture.",
          {
            summary:
              "System design fixes the boundaries of a system: which components exist, what each owns, how requests and data cross between them, and which failure modes are acceptable. The output is a set of decisions with constraints, not a diagram of boxes; the diagram only records the decisions.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Drawing components before stating requirements, which makes every later box arbitrary; write the load and latency numbers first.",
              "Treating the diagram as the deliverable; record each decision, the alternative rejected and the condition that would reverse it.",
              "Designing for an imagined scale instead of a measured one; size the first version for 10x current traffic, not 1000x.",
            ],
          },
        ),
        topic(
          "how-to-approach-system-design",
          "Without a repeatable method, a design session becomes a tour of technologies instead of a sequence of justified constraints.",
          [
            "Functional and non-functional requirement split",
            "Back-of-envelope capacity estimation",
            "High-level design and component deep dive",
            "Bottleneck-first review",
          ],
          "Run the method on a ride-hailing prompt: produce a requirement table, a QPS/storage estimate, a context diagram and a ranked list of three bottlenecks.",
          {
            summary:
              "A design method moves from requirements to a back-of-envelope model, then to a high-level architecture and only then to component deep dives. Each step ends with a number or a named constraint that the next step must satisfy, so the final design can be traced back to a requirement.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Jumping to a database choice before estimating write volume; estimate QPS and bytes per write first.",
              "Estimating with unknown units; state requests per second, bytes per request and retention days explicitly.",
              "Deep-diving a component that is not the bottleneck; rank components by load and failure impact first.",
            ],
          },
        ),
        topic(
          "design--implementation",
          "Patterns are compressed decisions; applying one without its preconditions creates the coupling it was meant to remove.",
          [
            "Pattern preconditions and consequences",
            "Consistency versus coherence in component design",
            "Total cost of ownership of a design choice",
            "Architecture decision records with rejected options",
          ],
          "Pick two patterns from a design you own, document the precondition each depends on, and write an ADR that rejects one pattern with measured or estimated consequences.",
          {
            summary:
              "Design and implementation patterns encode decisions that recur across systems, such as separating read and write models or isolating a dependency behind a gateway. The pattern is only valid with its preconditions: the same shape without the matching failure model becomes accidental complexity.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Applying CQRS to a CRUD workload with no read/write asymmetry; keep one model until the asymmetry is measured.",
              "Copying a pattern's diagram without its operational cost; add the extra stores, queues and on-call surface to the decision record.",
              "Letting a pattern name end the discussion; write the concrete failure it prevents and the test that shows it.",
            ],
            resources: [
              {
                title: "AWS Well-Architected — Operational excellence pillar",
                url: "https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html",
                kind: "docs",
              },
              {
                title: "Google SRE — Reliable product launches",
                url: "https://sre.google/sre-book/reliable-product-launches/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "introduction",
          "Every design argument starts with a boundary; an unscoped system hides the external dependencies that will set its availability ceiling.",
          [
            "C4 system context diagram",
            "Actors, external systems and trust boundaries",
            "In-scope versus out-of-scope responsibilities",
            "Dependency availability ceilings",
          ],
          "Draw a C4 context diagram for a payment checkout, list every external dependency with its SLA, and compute the composite availability ceiling of the scope.",
          {
            title: "System context and scope",
            summary:
              "Scoping fixes what the system owns, which actors and external services it depends on, and where trust boundaries sit. A context diagram plus an explicit out-of-scope list prevents the design from silently inheriting the availability and latency of systems it does not control.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Leaving the payment provider, DNS and identity provider outside the diagram; they still consume the error budget, so draw them and attach their SLAs.",
              "Describing internal components at context level; keep one box per system and put containers in the next diagram.",
              "Treating out-of-scope as unimportant; list the excluded responsibility and who owns it, or reviewers will assume it is missing.",
            ],
            resources: [
              {
                title: "C4 model — System context diagrams",
                url: "https://c4model.com/",
                kind: "docs",
              },
              {
                title: "Azure Architecture Center — Architecture styles",
                url: "https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "latency-vs-throughput",
          "Optimizing average latency while ignoring the tail hides the queueing collapse that users actually experience at peak load.",
          [
            "p50, p95 and p99 latency distributions",
            "Little's law: concurrency equals throughput times latency",
            "Queueing delay and utilization",
            "Coordinated omission in load generators",
          ],
          "Load test one endpoint at 25, 50, 75 and 90 percent of measured capacity; record throughput, p50, p95, p99 and queue depth, then mark the knee on the chart.",
          {
            summary:
              "Latency is the time one request takes and throughput is the rate the system completes work; they are linked by concurrency and queueing. As utilization approaches the service limit, queue wait grows non-linearly, so p99 can rise by seconds while median latency and CPU look healthy.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Reporting only the mean, which hides the tail; publish p50/p95/p99 with the request count and error rate.",
              "Closing the loop in the load generator so slow responses reduce offered load; use open-loop traffic to expose coordinated omission.",
              "Increasing concurrency to raise throughput after the knee; past saturation it only adds queue time, so add capacity or shed load.",
            ],
          },
        ),
        topic(
          "performance-vs-scalability",
          "A slow single request and a system that collapses at twice the load need different fixes; misdiagnosing one as the other wastes the optimization.",
          [
            "Latency at fixed load versus latency under growth",
            "Amdahl's law and serial fractions",
            "Universal scalability law and contention",
            "Vertical versus horizontal scaling limits",
          ],
          "Run the same endpoint at 1, 2 and 4 workers; plot throughput and p95, then write a decision record separating the performance fix from the scaling fix.",
          {
            summary:
              "Performance is the latency or cost of one request at a fixed workload; scalability is how those numbers change as load or data grows. A system can be fast for one user and unable to scale, or scale horizontally while every request remains slow, so the diagnosis must name which curve is failing.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Adding replicas to fix a slow query; profile the request first, because horizontal scaling multiplies a bad query rather than fixing it.",
              "Calling a system scalable after one load test; test at two data sizes and two concurrency levels to see the curve.",
              "Ignoring the serial fraction; measure the single-threaded portion before assuming more workers will help.",
            ],
          },
        ),
      ],
    },
    {
      slug: "network-and-apis",
      title: "Network and APIs",
      description:
        "Choose the transport and contract that fit the interaction. You will compare HTTP, TCP, UDP, REST, RPC and GraphQL by latency, failure semantics and coupling, then justify one for a real client.",
      topics: [
        topic(
          "http",
          "HTTP semantics decide cacheability, retry safety and error handling; a client that ignores them retries writes that already succeeded.",
          [
            "Methods, status codes and safe/idempotent semantics",
            "Connection reuse and keep-alive",
            "HTTP/2 streams versus HTTP/1.1 pipelining",
            "Conditional requests with ETag and If-None-Match",
          ],
          "Use curl to send a conditional GET, a POST with an Idempotency-Key, and the same request over HTTP/1.1 and HTTP/2; record status, headers and timing.",
          {
            summary:
              "HTTP is a stateless request/response protocol whose methods, status codes and headers carry the contract between client, intermediaries and origin. HTTP/1.1, HTTP/2 and HTTP/3 differ in connection multiplexing and framing, which changes head-of-line blocking and the cost of many small requests.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Retrying a POST that is not idempotent after a timeout; add an idempotency key or make the operation safe to repeat.",
              "Assuming a 200 from a proxy means the origin committed the write; require an application-level acknowledgment.",
              "Leaving keep-alive at the client but closing at the load balancer; align idle timeouts or clients hit stale connections.",
            ],
          },
        ),
        topic(
          "tcp",
          "Most tail-latency incidents in a service are transport behavior: retransmits, connection setup or a full accept queue.",
          [
            "Three-way handshake and connection state",
            "Congestion window and slow start",
            "Retransmission timeout and fast retransmit",
            "TIME_WAIT and port exhaustion",
          ],
          "Capture a request with tcpdump, identify the handshake, any retransmission and the congestion window, then repeat over a 200 ms RTT link and compare completion time.",
          {
            summary:
              "TCP provides ordered, reliable byte streams over an unreliable network using sequence numbers, acknowledgments and congestion control. Handshake cost, retransmission timers and flow-control windows set the minimum latency and the behavior when a link degrades.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Blaming the application for a 3-second stall caused by RTO backoff; check retransmits before changing code.",
              "Enabling Nagle and delayed ACK together on a small request path; set TCP_NODELAY on latency-sensitive sockets.",
              "Exhausting ephemeral ports behind a proxy; reuse upstream connections and monitor TIME_WAIT counts.",
            ],
          },
        ),
        topic(
          "udp",
          "UDP is the right base for latency-sensitive or multiplexed traffic, but only if the protocol above it supplies ordering, loss recovery and congestion control.",
          [
            "Datagram boundaries and message-oriented delivery",
            "Packet loss, duplication and reordering",
            "MTU and IP fragmentation",
            "QUIC streams over UDP",
          ],
          "Send 10,000 UDP datagrams through a lossy proxy, measure loss and reordering, then write a table mapping each observed failure to the recovery the application must add.",
          {
            summary:
              "UDP delivers independent datagrams with no handshake, ordering or retransmission, leaving reliability and congestion control to the application. That makes it suitable for DNS, telemetry and real-time media, and it is the transport under QUIC, where loss recovery and encryption move into user space.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Assuming a UDP send means delivery; add sequence numbers, acknowledgments and a retry policy where correctness matters.",
              "Sending datagrams larger than the path MTU; keep payloads below 1,200 bytes or implement path MTU discovery.",
              "Building a reliable protocol on UDP without congestion control; add a window and backoff or use QUIC instead.",
            ],
          },
        ),
        topic(
          "rest",
          "REST's constraints explain cacheability and evolvability; violating them produces APIs that need a new endpoint for every client.",
          [
            "Resources and representations",
            "Statelessness and self-descriptive messages",
            "HATEOAS and uniform interface",
            "Conditional updates with ETag and If-Match",
          ],
          "Write an OpenAPI document for one resource, implement conditional GET and PATCH with ETag, and test 200, 304, 409 and 412 responses.",
          {
            summary:
              "REST is an architectural style built on resources, representations, stateless requests and a uniform interface. The constraints make responses cacheable and intermediaries useful, but they also push complexity into representation design, pagination and conditional updates.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Putting verbs in paths such as /createOrder; model the resource and use POST on a collection.",
              "Using 200 with an error body; return the status code that intermediaries and clients can act on.",
              "Ignoring lost-update races; require If-Match and return 412 when the ETag changed.",
            ],
          },
        ),
        topic(
          "rpc",
          "RPC hides the network, which is useful until a caller treats a remote call as local and omits deadlines, retries and partial-failure handling.",
          [
            "Client stubs and interface definition languages",
            "Protocol Buffers field numbering and compatibility",
            "Deadlines and cancellation propagation",
            "Status codes and error details",
          ],
          "Define a unary RPC, generate the client, call it with a 100 ms deadline against a 300 ms handler, and record the status code and server-side cancellation behavior.",
          {
            summary:
              "RPC makes a remote function look local by generating client stubs and serializing arguments, usually over HTTP/2 with Protocol Buffers. It gives a typed, compact contract for internal services, but the network still fails independently, so deadlines, retry policy and error mapping must be explicit.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Calling a remote method in a loop without batching; measure round trips and add a batch or streaming call.",
              "Changing a protobuf field number in place; reserve the old number and add a new field.",
              "Setting no deadline and letting a failed dependency pin connections; propagate a deadline shorter than the caller's remaining budget.",
            ],
            resources: [
              {
                title: "gRPC — Core concepts",
                url: "https://grpc.io/docs/what-is-grpc/core-concepts/",
                kind: "docs",
              },
              {
                title: "Protocol Buffers — Language guide (proto3)",
                url: "https://protobuf.dev/programming-guides/proto3/",
                kind: "docs",
              },
              {
                title: "AWS Builders' Library — Timeouts, retries and backoff with jitter",
                url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "graphql",
          "GraphQL lets clients ask for exactly what they need, and that freedom turns into N+1 queries, unbounded depth and cache fragmentation unless the server enforces limits.",
          [
            "Schema types, queries and mutations",
            "Resolver execution and N+1 selection",
            "Query depth and complexity limits",
            "Persisted queries and entity caching",
          ],
          "Run a nested query against a small schema, count the SQL statements, add a DataLoader, and show the statement count and p95 before and after.",
          {
            summary:
              "GraphQL exposes one typed schema and lets clients select fields across relationships in a single request. The server must resolve each field, so query cost depends on the client's selection, and effective caching moves from URLs to persisted queries and entity-level caches.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Resolving each list item with its own query; batch with DataLoader and cap the batch size.",
              "Accepting arbitrary query depth; enforce a depth and complexity budget before execution.",
              "Caching GraphQL responses by URL; cache at the entity or persisted-query layer with explicit TTLs.",
            ],
          },
        ),
      ],
    },
    {
      slug: "edge-and-load-balancing",
      title: "Edge and load balancing",
      description:
        "Place traffic controls at the right layer. You will design an edge that terminates TLS, routes by path, balances across healthy backends and caches close to users without hiding failure.",
      topics: [
        topic(
          "load-balancers",
          "A load balancer is also a failure detector; its health-check interval and drain behavior set how long users see errors during a deploy or crash.",
          [
            "Virtual IPs and anycast frontends",
            "Active and passive health checks",
            "Connection draining and graceful shutdown",
            "Session affinity and cookie stickiness",
          ],
          "Put three backends behind HAProxy or nginx, kill one during a fixed-rate load test, and measure the error count and failover time for two health-check intervals.",
          {
            summary:
              "A load balancer spreads connections or requests across backends and removes unhealthy ones from rotation. The interesting parameters are health-check interval and threshold, connection draining, session affinity and whether the balancer itself is redundant.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Setting a health-check interval and failure threshold so high that a dead backend stays in rotation for 30 seconds; shorten the interval and lower the threshold to match the error budget.",
              "Removing a backend without draining; send SIGTERM, fail readiness, then wait for in-flight requests.",
              "Using sticky sessions to hide shared state; move session state to a shared store before scaling out.",
            ],
          },
        ),
        topic(
          "load-balancing-algorithms",
          "The algorithm determines whether one slow backend becomes a p99 incident or a small blip, especially when request costs vary.",
          [
            "Round robin and weighted round robin",
            "Least connections and least response time",
            "Power-of-two-choices selection",
            "Consistent hashing and hash rings",
          ],
          "Simulate 10 backends with two latency classes under round robin, least connections and power-of-two-choices; record max load and p99 for each in a comparison table.",
          {
            summary:
              "Load-balancing algorithms choose a backend from the healthy set using rotation, connection counts, latency estimates or hashing. Round robin assumes uniform cost, least-connections approximates queue length, and power-of-two-choices reduces tail load without global state.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Using round robin with heterogeneous request costs; adopt least-connections or P2C and measure the tail.",
              "Hashing on a key with skewed frequency; add a salt or virtual nodes and inspect the distribution.",
              "Trusting a global least-connections view that is stale; prefer local P2C or bounded load feedback.",
            ],
            resources: [
              {
                title: "Envoy — Load balancing overview",
                url: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/overview",
                kind: "docs",
              },
              {
                title: "Mitzenmacher — The power of two choices in randomized load balancing",
                url: "https://www.eecs.harvard.edu/~michaelm/postscripts/handbook2001.pdf",
                kind: "paper",
              },
              {
                title: "nginx — ngx_http_upstream_module",
                url: "https://nginx.org/en/docs/http/ngx_http_upstream_module.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "layer-4-load-balancing",
          "L4 balancing is cheap and protocol-agnostic, but it cannot route by path or retry a request, so those concerns must live elsewhere.",
          [
            "NAT and destination IP rewriting",
            "Direct server return",
            "Connection tracking tables",
            "Source IP preservation and proxy protocol",
          ],
          "Run a TCP-mode proxy in front of two services, open 20,000 idle connections, and record the conntrack table size, new-connection rate and failover behavior.",
          {
            summary:
              "A layer-4 load balancer forwards TCP or UDP flows by IP and port without parsing the application payload. It preserves protocol transparency and handles high connection rates, but routing decisions stop at the flow, and connection tracking becomes the scaling limit.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Expecting path-based routing from an L4 balancer; terminate at L7 or add a routing proxy behind it.",
              "Letting idle connections outlive the conntrack timeout; align keep-alive with the balancer's idle timeout.",
              "Losing client IPs behind NAT; enable proxy protocol or preserve source addresses and document the trust boundary.",
            ],
            resources: [
              {
                title: "AWS — Network Load Balancer overview",
                url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html",
                kind: "docs",
              },
              {
                title: "RFC 9293 — Transmission Control Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc9293.html",
                kind: "spec",
              },
            ],
          },
        ),
        topic(
          "layer-7-load-balancing",
          "L7 balancing is where retries, timeouts, path routing and TLS termination become explicit; misconfiguring them turns a backend slowdown into a retry storm.",
          [
            "Host and path-based routing",
            "Per-route timeouts and retry budgets",
            "TLS termination and re-encryption",
            "Request buffering and header limits",
          ],
          "Configure two routes with different timeouts, inject a 2-second delay on one, and record client status codes with retries disabled and with a 10 percent retry budget.",
          {
            summary:
              "A layer-7 load balancer parses HTTP and routes on path, host, headers or gRPC method. That visibility enables canaries, per-route timeouts and request-level retries, at the cost of buffering, parsing CPU and a second place where the request contract can be violated.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Retrying every 5xx by default; restrict retries to idempotent methods and cap them with a budget.",
              "Buffering large uploads in the proxy; stream the body or raise limits deliberately and monitor memory.",
              "Terminating TLS and forwarding plaintext across a shared network; re-encrypt or keep the hop inside a trusted boundary.",
            ],
            resources: [
              {
                title: "AWS — Application Load Balancer overview",
                url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
                kind: "docs",
              },
              {
                title: "Envoy — HTTP connection management",
                url: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/http/http_connection_management",
                kind: "docs",
              },
              {
                title: "RFC 9110 — HTTP Semantics",
                url: "https://www.rfc-editor.org/rfc/rfc9110.html",
                kind: "spec",
              },
            ],
          },
        ),
        topic(
          "lb-vs-reverse-proxy",
          "The same process often does both jobs, but conflating the roles hides which behavior owns health, routing and caching.",
          [
            "Traffic distribution versus origin abstraction",
            "Forward and reverse proxy direction",
            "Ingress control and shared middleware",
            "X-Forwarded-For and trusted hops",
          ],
          "Draw the request path through your ingress, label every proxy hop with the behavior it owns, and write an ADR for one behavior that could move between the balancer and the app.",
          {
            summary:
              "A load balancer distributes traffic across equivalent backends, while a reverse proxy represents an origin to clients and may add TLS, caching, compression or authentication. Modern products combine both roles, so the design question is which layer owns each behavior and where failure is detected.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Trusting X-Forwarded-For from any client; accept it only from known proxy hops and overwrite it at the edge.",
              "Caching at both proxy and application with different TTLs; make one layer authoritative for each object.",
              "Adding auth at the edge and assuming the backend is unreachable; keep service-level authorization as well.",
            ],
          },
        ),
        topic(
          "content-delivery-networks",
          "A CDN changes the failure domain and the cost model; without cache-key discipline it can serve one tenant's content to another.",
          [
            "Points of presence and anycast routing",
            "Cache keys, Vary and normalized headers",
            "Origin shield and request collapsing",
            "Signed URLs and token authorization",
          ],
          "Define a cache-key matrix for HTML, API JSON and images, estimate hit ratio and origin egress at 10 million requests per day, and record the monthly cost difference.",
          {
            summary:
              "A CDN caches responses at points of presence close to users and routes requests over a provider backbone. Hit ratio, TTL and cache-key design decide the origin load, while purge latency and stale-while-revalidate decide how quickly a change becomes visible.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Including every header or cookie in the cache key; normalize to the fields that change the representation and measure the hit ratio.",
              "Purging on every deploy instead of versioning asset URLs; use content hashes and keep HTML TTLs short.",
              "Serving private content from a shared cache key; require signed URLs or private cache-control directives.",
            ],
            resources: [
              {
                title: "RFC 9111 — HTTP Caching",
                url: "https://www.rfc-editor.org/rfc/rfc9111.html",
                kind: "spec",
              },
              {
                title: "Amazon CloudFront — Managing how long content stays in the cache",
                url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "data-and-storage",
      title: "Data and storage",
      description:
        "Pick a storage model from access patterns, not from a database logo. You will scale reads and writes with replication and sharding, and explain the query and consistency costs of each choice.",
      topics: [
        topic(
          "horizontal-scaling",
          "Adding instances only helps when the tier is stateless and the bottleneck is behind it; otherwise it multiplies contention and cost.",
          [
            "Stateless service instances",
            "Autoscaling signals and cooldown windows",
            "Shared-nothing partitioning",
            "Capacity units and headroom",
          ],
          "Run one and then three instances of a service against a fixed database, measure throughput and p95, and identify which tier saturated first in a capacity table.",
          {
            summary:
              "Horizontal scaling adds interchangeable instances behind a load balancer, turning capacity into a pool rather than a bigger machine. It requires stateless request handling or externalized session state, and it shifts the bottleneck to shared dependencies such as databases and caches.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Scaling app servers while the database is saturated; measure per-tier utilization before adding instances.",
              "Storing sessions on local disk; externalize them or use signed tokens before horizontal scaling.",
              "Autoscaling on CPU alone with a 5-minute cooldown; add request concurrency or queue depth and tune the warm-up.",
            ],
            resources: [
              {
                title: "Azure Architecture Center — Autoscaling guidance",
                url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/auto-scaling",
                kind: "docs",
              },
              {
                title: "Amazon EC2 Auto Scaling — User guide",
                url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html",
                kind: "docs",
              },
              {
                title: "Google SRE — Handling overload",
                url: "https://sre.google/sre-book/handling-overload/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "replication",
          "Replication is the main lever for read capacity and durability, and its lag defines the staleness users can observe.",
          [
            "Single-leader, multi-leader and leaderless replication",
            "Synchronous versus asynchronous commit",
            "Replication lag and read-your-writes",
            "Failover promotion and data loss window",
          ],
          "Run a primary and replica, drive writes under load, measure replication lag at p50 and p99, promote the replica, and record measured RPO and RTO.",
          {
            summary:
              "Replication keeps copies of data on multiple nodes, usually through a single leader that orders writes and followers that apply its log. Synchronous replication bounds data loss but adds write latency; asynchronous replication is fast but exposes stale reads and a nonzero RPO on failover.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Sending all reads to replicas immediately after a write; route the user's own reads to the leader or track a log position.",
              "Assuming asynchronous replicas are current during failover; measure lag and state the data-loss window.",
              "Promoting a lagging replica automatically without fencing the old leader; require quorum or a lease before promotion.",
            ],
          },
        ),
        topic(
          "sharding",
          "A shard key is a long-lived contract; choosing one for today's query pattern creates hotspots and cross-shard joins that are expensive to undo.",
          [
            "Range, hash and directory sharding",
            "Hot partitions and key skew",
            "Cross-shard queries and distributed transactions",
            "Resharding and virtual shards",
          ],
          "Load 10 million synthetic keys under two candidate shard keys, chart shard size and p99 by key frequency, then write the resharding plan for the winner.",
          {
            summary:
              "Sharding partitions rows across independent databases by a shard key, giving each shard its own CPU, storage and failure domain. The key must spread writes and match the dominant query, because cross-shard joins, transactions and rebalancing are the costs that decide whether the design holds.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Sharding by a low-cardinality field such as country; add a high-cardinality suffix or choose a better key.",
              "Using a monotonic timestamp as the hash key; writes land on one shard, so hash the entity id instead.",
              "Planning resharding after launch; use many logical shards and move them between physical nodes.",
            ],
          },
        ),
        topic(
          "sql-vs-nosql",
          "The decision is about access patterns and transaction boundaries, not about SQL versus JSON; the wrong model shows up as fan-out reads and manual joins.",
          [
            "Normalized schemas and join cost",
            "Multi-item transactions and isolation",
            "Access-pattern-first data modeling",
            "Secondary indexes and query flexibility",
          ],
          "Model the same order-history feature in PostgreSQL and DynamoDB, list every query and its index, and write a decision record with latency and cost estimates.",
          {
            summary:
              "Relational stores provide a schema, joins and multi-row transactions; NoSQL stores optimize a narrow access pattern for horizontal scale or flexible documents. The choice should follow the queries and consistency requirements, because a store that fits writes but not reads pushes joins and transactions into application code.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Choosing NoSQL for schema flexibility while needing ad-hoc joins; keep a relational store until the access pattern is fixed.",
              "Choosing SQL and then denormalizing every table; measure join cost and index usage before duplicating data.",
              "Ignoring operational maturity; count the backups, failover and observability features the team must run.",
            ],
          },
        ),
        topic(
          "key-value-store",
          "A key-value store is the simplest useful database, and its limits appear at scan, range and multi-key transaction boundaries.",
          [
            "Consistent hashing and partition placement",
            "Read and write quorums",
            "TTL and eviction policy",
            "Single-key atomicity",
          ],
          "Benchmark Redis or DynamoDB Local at 1,000 concurrent clients, record p50/p95/p99 for get and put, and compute the memory or RCU cost of a 10 GB working set.",
          {
            summary:
              "A key-value store maps opaque keys to opaque values with get, put and delete, partitioning and replication handled by the service. It scales predictably when the key is known, but range scans, secondary indexes and cross-key transactions are either absent or expensive.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Storing a large value under one key and hitting item-size limits; split the value or store a pointer to object storage.",
              "Assuming scan is cheap; design an index key or a secondary index for access patterns that need ranges.",
              "Using TTL as a correctness mechanism for locks; add a fencing token and verify ownership on release.",
            ],
          },
        ),
        topic(
          "document-store",
          "Documents make reads cheap by co-locating related fields, and make updates expensive when the document grows or is written concurrently.",
          [
            "Embedded versus referenced documents",
            "Document size limits and update cost",
            "Secondary and compound indexes",
            "Optimistic concurrency with document versions",
          ],
          "Model an order with embedded and referenced line items, load 1 million orders, and compare document size, query p95 and update cost in a decision table.",
          {
            summary:
              "A document store keeps each entity as a self-contained JSON or BSON document, so a read can return the whole aggregate without joins. That locality helps read-heavy workloads, but document size limits, index coverage and cross-document consistency constrain how the model can evolve.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Embedding an unbounded array such as every order line; reference the lines or cap the array and measure document growth.",
              "Updating one field by rewriting a large document under contention; use targeted updates and optimistic version checks.",
              "Assuming schema-free means no validation; enforce a schema at the write boundary and version stored documents.",
            ],
            resources: [
              {
                title: "MongoDB — Data modeling and schema design",
                url: "https://www.mongodb.com/docs/manual/",
                kind: "docs",
              },
              {
                title: "Apache CouchDB — Documentation",
                url: "https://docs.couchdb.org/en/stable/",
                kind: "docs",
              },
              {
                title: "Azure Cosmos DB — Introduction",
                url: "https://learn.microsoft.com/en-us/azure/cosmos-db/introduction",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "caching",
      title: "Caching",
      description:
        "Add a cache without losing correctness. You will choose a cache-aside or write-through design, set TTLs and negative caching, and write the invalidation and stampede policy before the first request.",
      topics: [
        topic(
          "caching",
          "A cache is a second copy of the source of truth; without an invalidation rule and a stampede policy it converts a slow path into a wrong or unavailable one.",
          [
            "Hit ratio and origin load reduction",
            "TTL, freshness and staleness bounds",
            "LRU, LFU and eviction policies",
            "Cache stampede and request collapsing",
          ],
          "Instrument a read path with hits, misses and load latency, then calculate origin QPS at 80, 90 and 95 percent hit ratio and compare with the measured baseline.",
          {
            summary:
              "A cache stores a copy of a value closer to the reader than the source of truth, trading memory and staleness for latency and origin load. Hit ratio, TTL and eviction determine the benefit, while invalidation and miss handling determine whether the copy stays correct.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Reporting a hit ratio without weights; weight by bytes or origin cost, because a 90 percent hit ratio on cheap keys can hide expensive misses.",
              "Using one TTL for hot and cold keys; add jitter and tier TTLs by change frequency.",
              "Letting every miss rebuild the same entry; use singleflight or a per-key lock with a short timeout.",
            ],
            resources: [
              {
                title: "RFC 9111 — HTTP Caching",
                url: "https://www.rfc-editor.org/rfc/rfc9111.html",
                kind: "spec",
              },
              {
                title: "AWS Builders' Library — Caching challenges and strategies",
                url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
                kind: "docs",
              },
              {
                title: "Azure Architecture Center — Caching guidance",
                url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "application-caching",
          "An in-process cache is the fastest option and the easiest way to give different replicas different answers.",
          [
            "Per-instance cache coherence",
            "Heap sizing and GC pressure",
            "TTL jitter and refresh-ahead",
            "Singleflight and per-key locking",
          ],
          "Add a bounded in-process cache with TTL jitter and singleflight to one endpoint, measure p99, hit ratio and heap growth, and compute the per-instance memory budget.",
          {
            summary:
              "Application caching keeps computed values in process memory, avoiding a network hop and serialization on every read. Each instance has its own copy, so invalidation becomes a broadcast problem, and the cache competes with the heap that the runtime needs for request handling.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Leaving the cache unbounded; set a maximum weight and an eviction policy, then alert on eviction rate.",
              "Invalidating only the local instance after a write; publish an invalidation event or use a short TTL with a versioned key.",
              "Caching large objects per request thread; cap entry size and measure allocation rate before and after.",
            ],
            resources: [
              {
                title: "Caffeine — Benchmarks and design",
                url: "https://github.com/ben-manes/caffeine/wiki",
                kind: "docs",
              },
              {
                title: "Redis — Client-side caching",
                url: "https://redis.io/docs/latest/develop/clients/client-side-caching/",
                kind: "docs",
              },
              {
                title: "Azure Architecture Center — Caching guidance",
                url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "database-caching",
          "The database already caches pages and plans; adding another cache without measuring the buffer pool hit ratio duplicates work and hides the real bottleneck.",
          [
            "Buffer pool hit ratio",
            "Materialized views and refresh cost",
            "Query result caching and invalidation",
            "Read replicas as a cache tier",
          ],
          "Measure a dashboard query with and without a materialized view, record refresh time, staleness window and p95 read latency, and write the refresh schedule.",
          {
            summary:
              "Database caching uses buffer pools, materialized views, query result caches or a shared cache tier to avoid repeated disk reads and computation. Each layer has a different invalidation scope, so the design must state which layer owns freshness and how a refresh affects read latency.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Refreshing a materialized view inside the request path; refresh on a schedule or incrementally and serve the previous version.",
              "Caching a query result without its parameters; include every parameter and the schema version in the key.",
              "Adding a cache in front of a buffer pool that already has a 99 percent hit ratio; profile disk reads before adding a layer.",
            ],
          },
        ),
        topic(
          "cdn-caching",
          "The edge is the cache layer that can absorb a traffic spike before it reaches your network, but a wrong cache key can leak or misroute content.",
          [
            "Edge TTL and Cache-Control directives",
            "Cache key normalization",
            "Origin shield and request collapsing",
            "Purge latency and stale-while-revalidate",
          ],
          "Build a cache-control matrix for HTML, API responses and images, simulate 10 million daily requests, and record hit ratio, origin requests and egress cost per row.",
          {
            summary:
              "CDN caching stores responses at edge locations and serves them without contacting the origin when the cache key matches and the entry is fresh. TTLs, Vary, purge and origin shielding control freshness and origin load; signed URLs and private directives control who may share an entry.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Caching personalized HTML under a shared key; split public shells from private fragments or mark the response private.",
              "Setting a one-year TTL on unversioned assets; use content-hashed filenames so a deploy changes the URL.",
              "Purging the whole distribution for one object; purge by URL or tag and measure propagation time.",
            ],
            resources: [
              {
                title: "RFC 9111 — HTTP Caching",
                url: "https://www.rfc-editor.org/rfc/rfc9111.html",
                kind: "spec",
              },
              {
                title: "Amazon CloudFront — Managing how long content stays in the cache",
                url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "cache-aside",
          "Cache-aside is the default read pattern, and its write path has a race that silently restores stale data unless the invalidation order is deliberate.",
          [
            "Read-through on miss and lazy population",
            "Delete-after-commit invalidation",
            "Stale set race and versioned keys",
            "Negative caching and TTL jitter",
          ],
          "Implement cache-aside for one entity, reproduce the stale-set race with two concurrent clients, then fix it with delete-after-commit and a versioned key and rerun the test.",
          {
            summary:
              "Cache-aside loads data into the cache on a miss and lets the application read the cache before the database. Writes usually update the database and delete the key, because a concurrent read can repopulate stale data between the update and the delete, so the ordering and a short TTL both matter.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Writing the cache before committing the database transaction; commit first, then delete, and accept a bounded stale window.",
              "Caching a miss without a separate short TTL; a later write stays invisible until the negative entry expires.",
              "Deleting the key before the write commits; a concurrent read can repopulate the old value, so delete after commit.",
            ],
            resources: [
              {
                title: "Azure Architecture Center — Cache-Aside pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
                kind: "docs",
              },
              {
                title: "AWS Builders' Library — Caching challenges and strategies",
                url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
                kind: "docs",
              },
              {
                title: "Scaling Memcache at Facebook",
                url: "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf",
                kind: "paper",
              },
            ],
          },
        ),
        topic(
          "write-through",
          "Write-through makes the cache a synchronous part of the write path, so a cache outage becomes a write outage unless the design defines a fallback.",
          [
            "Synchronous dual writes",
            "Write-behind flush and durability window",
            "Partial failure between cache and database",
            "Write amplification and batching",
          ],
          "Measure write p95 for write-through, write-behind and write-around on the same workload, then write a failure table for cache and database failures in each mode.",
          {
            summary:
              "Write-through updates the cache and the database in the same operation, keeping the cached value fresh at the cost of two writes. Write-behind acknowledges after the cache and flushes asynchronously, which lowers latency but creates a data-loss window if the cache fails.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Treating a cache write as durable; write-behind data can be lost, so require a durable log or acknowledge only after the database commit.",
              "Ignoring partial failure; define whether a cache failure fails the write or falls back to the database.",
              "Using write-through for write-heavy keys that are rarely read; write-around avoids filling the cache with cold data.",
            ],
            resources: [
              {
                title: "Azure Architecture Center — Cache-Aside pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
                kind: "docs",
              },
              {
                title: "AWS — Database caching strategies using Redis",
                url: "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/welcome.html",
                kind: "docs",
              },
              {
                title: "Azure Architecture Center — Caching guidance",
                url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "availability-and-consistency",
      title: "Availability and consistency",
      description:
        "Reason about what a partition does to your system. You will calculate availability from dependencies, apply CAP and PACELC honestly, and choose a consistency model that matches the product promise.",
      topics: [
        topic(
          "availability",
          "Availability is a property of the whole dependency graph, so a service cannot be more available than the path users actually traverse.",
          [
            "SLI, SLO and SLA",
            "Serial and parallel availability",
            "MTTR and MTBF",
            "Graceful degradation and partial availability",
          ],
          "Model a request path with five dependencies, compute composite availability from each SLA, and rank the two dependencies whose improvement raises the total most.",
          {
            summary:
              "Availability is the fraction of time a system can serve its users, usually expressed as a percentage over a window and tied to an SLA or SLO. Serial dependencies multiply their availability, so each additional hop lowers the ceiling; redundancy and graceful degradation can raise the composite above any single component.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Multiplying SLA percentages for redundant replicas without accounting for shared dependencies; include the load balancer and database.",
              "Reporting uptime from a single probe; measure from multiple regions and weight by traffic.",
              "Treating 100 percent as a target; state the cost and error budget of each additional nine.",
            ],
            resources: [
              {
                title: "Google SRE — Service level objectives",
                url: "https://sre.google/sre-book/service-level-objectives/",
                kind: "docs",
              },
              {
                title: "Google SRE — Embracing risk",
                url: "https://sre.google/sre-book/embracing-risk/",
                kind: "docs",
              },
              {
                title: "AWS Builders' Library — Static stability using Availability Zones",
                url: "https://aws.amazon.com/builders-library/static-stability-using-availability-zones/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "availability-in-numbers",
          "Nines are only meaningful when converted into minutes and error budget; the arithmetic changes which architecture is worth its cost.",
          [
            "Nines-to-downtime conversion",
            "Error budgets and burn rate",
            "Composite availability across serial dependencies",
            "Measurement window and exclusion policy",
          ],
          "Build a table of 99, 99.9, 99.95, 99.99 and 99.999 percent with monthly, weekly and daily budgets, then compute the budget for a three-service chain.",
          {
            summary:
              "Availability percentages map to concrete downtime: 99.9 percent allows about 43 minutes of downtime per 30-day month, while 99.99 percent allows about 4.3 minutes. Error budgets turn those minutes into a shared limit for releases, retries and experiments, and dependency math shows how quickly a chain of 99.9 percent services falls below 99 percent.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Quoting annual downtime for a monthly SLO; convert to the same window before comparing.",
              "Spending the error budget on every deploy without a burn-rate policy; set a freeze threshold at 50 percent consumed.",
              "Counting planned maintenance as uptime; state exclusions in the SLO and measure user-visible requests.",
            ],
          },
        ),
        topic(
          "cap-theorem",
          "CAP is a statement about behavior during a partition, not a menu; treating it as a three-way choice produces designs that are neither consistent nor available when the network splits.",
          [
            "Linearizability and its cost",
            "Partition as the operating condition",
            "Per-operation availability semantics",
            "PACELC: latency versus consistency",
          ],
          "Take a cart and a balance service, write a failure table for each under a partition, and record whether the operation rejects, queues or accepts-and-reconciles with a stated staleness bound.",
          {
            summary:
              "CAP says that when a network partition prevents some replicas from communicating, a system must choose between linearizable consistency and availability for the affected operations. Partitions are an operating condition rather than an option, so the real decision is what each operation does while the partition lasts, and PACELC extends the same trade-off to latency when the network is healthy.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Saying a system is CA; a partition still happens, so state the behavior during it.",
              "Applying one CAP choice to every operation; checkout and product browsing can make different trade-offs.",
              "Confusing consistency with the C in ACID; name linearizability or the specific consistency model.",
            ],
          },
        ),
        topic(
          "availability-vs-consistency",
          "The choice during a partition is a product decision: rejecting a write is visible, while accepting it creates a reconciliation obligation.",
          [
            "Quorum intersection with R plus W greater than N",
            "Read and write availability during a partition",
            "Conflict detection and reconciliation",
            "Staleness bounds per operation",
          ],
          "Build a quorum table for N=3 and N=5 across R/W combinations, choose one for a cart and one for an account balance, and write the decision record.",
          {
            summary:
              "During a partition, a replica set can reject writes to preserve a single authoritative value, or accept writes locally to stay available and reconcile later. Quorums make the trade-off tunable through R and W, but the product must still define which stale reads and conflicting writes are acceptable.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Assuming R plus W greater than N gives linearizability; it gives quorum intersection, not ordering or conflict resolution.",
              "Using the same quorum for every read; route balance checks through a stronger quorum and browsing through a weaker one.",
              "Accepting writes during a partition without a reconciliation owner; assign the merge rule and the user-visible outcome.",
            ],
          },
        ),
        topic(
          "eventual-consistency",
          "Eventual consistency is a convergence promise, not a freshness promise; the product still needs a bound on how stale a read can be.",
          [
            "Convergence and anti-entropy",
            "Read-your-writes and monotonic reads",
            "Last-write-wins versus vector clocks",
            "Tombstones and delete propagation",
          ],
          "Simulate three replicas with 50, 200 and 800 ms lag, issue conflicting writes, and produce a table of read anomalies, merge outcomes and time to convergence.",
          {
            summary:
              "Eventual consistency guarantees that replicas converge once writes stop, but says nothing about when a given read sees a given write. Session guarantees such as read-your-writes and monotonic reads, plus anti-entropy and conflict resolution, turn the vague promise into behavior a product can use.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Promising eventual consistency without a staleness bound; measure replication lag and expose a maximum age.",
              "Using last-write-wins on concurrent edits without a clock guarantee; use version vectors or a domain merge rule.",
              "Forgetting tombstone retention; deletes resurrect when a stale replica returns, so keep tombstones longer than the maximum lag.",
            ],
            resources: [
              {
                title: "Vogels — Eventually consistent",
                url: "https://www.allthingsdistributed.com/2008/12/eventually_consistent.html",
                kind: "article",
              },
              {
                title: "Amazon's Dynamo paper",
                url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
                kind: "paper",
              },
              {
                title: "MongoDB — Read concern",
                url: "https://www.mongodb.com/docs/manual/reference/read-concern/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "fail-over",
          "Failover is a race between detection and promotion; without fencing, the old primary can keep accepting writes and split the data.",
          [
            "Active-passive and active-active topologies",
            "Health-check detection and failure timeout",
            "Fencing tokens and quorum leases",
            "RTO and RPO measurement",
          ],
          "Kill the primary in a PostgreSQL primary/standby pair, time detection and promotion, measure lost transactions, then add a fencing check and repeat the drill.",
          {
            summary:
              "Failover detects an unhealthy primary or zone and promotes a standby, shifting traffic and write leadership. Detection time, promotion time and replication lag determine RTO and RPO, and fencing or quorum is required to stop the old leader from serving writes after the switch.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Promoting a standby on a single missed health check; require consecutive failures and a lease or quorum.",
              "Leaving the old primary reachable after promotion; fence it at the network or storage layer before reopening writes.",
              "Reporting a failover as successful without measuring RPO; count the transactions lost to replication lag.",
            ],
          },
        ),
      ],
    },
    {
      slug: "resilience",
      title: "Resilience",
      description:
        "Design for the failure that is already happening. You will add bounded retries, circuit breakers, bulkheads, back-pressure, throttling and queue-based leveling, then prove each one changes a failure curve.",
      topics: [
        topic(
          "retry",
          "Retries convert a transient blip into a sustained outage when every caller retries at once without a budget or jitter.",
          [
            "Exponential backoff with full jitter",
            "Retry budgets and amplification factor",
            "Idempotency keys for unsafe operations",
            "Retryable versus terminal error classes",
          ],
          "Simulate 10,000 clients against a dependency with 10 percent errors and 500 ms latency under three retry policies; record success rate, amplification and p99, then choose one.",
          {
            summary:
              "A retry repeats a failed operation in the hope that the failure was transient, usually with exponential backoff and jitter. Retries improve success for isolated faults, but they amplify load during congestion, so the policy needs a budget, a cap and idempotent operations.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Retrying every error including 400 and 409; classify terminal errors before the retry loop.",
              "Using fixed delays across all clients; add full jitter or they retry in synchronized waves.",
              "Budgeting retries per request instead of per dependency; cap retries as a fraction of total calls and monitor the ratio.",
            ],
            resources: [
              {
                title: "AWS Builders' Library — Timeouts, retries and backoff with jitter",
                url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
                kind: "docs",
              },
              {
                title: "Azure Architecture Center — Retry pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/retry",
                kind: "docs",
              },
              {
                title: "Google SRE — Handling overload",
                url: "https://sre.google/sre-book/handling-overload/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "circuit-breaker",
          "A breaker stops calls to a dependency that is already failing, converting a long timeout into a fast fallback and giving the dependency room to recover.",
          [
            "Closed, open and half-open states",
            "Failure-rate threshold and minimum volume",
            "Half-open probe limits",
            "Fallback and degraded responses",
          ],
          "Wrap a flaky dependency in a breaker, drive 200 requests at 50 percent failure, and record state transitions, rejected calls and p95 with and without the breaker.",
          {
            summary:
              "A circuit breaker tracks failures per dependency and moves from closed to open when a threshold is crossed, rejecting calls without attempting them. After a cool-down it admits a limited number of half-open probes, closing only if they succeed, which bounds both caller latency and dependency load.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Opening on a single failure; require a minimum request volume and a failure-rate window.",
              "Sending all traffic through the half-open state; admit a small fixed number of probes and keep the rest rejected.",
              "Hiding the fallback's own failure; instrument fallback latency and correctness, and fail closed when it is unsafe.",
            ],
          },
        ),
        topic(
          "bulkhead",
          "One saturated dependency can consume every shared worker; isolation caps the blast radius before the whole service stalls.",
          [
            "Thread-pool and semaphore isolation",
            "Per-dependency connection pools",
            "Cell-based architecture",
            "Pool sizing from Little's law",
          ],
          "Give two dependencies separate connection pools, saturate one with slow calls, and show that the other's p95 and error rate stay within baseline in a before-and-after table.",
          {
            summary:
              "A bulkhead partitions resources such as threads, connections or memory so that one workload cannot exhaust capacity used by another. The isolation can be per dependency, per tenant or per cell, and the pool size must be derived from the latency and concurrency the dependency needs.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Sizing a pool from average latency only; use p99 and Little's law, then add headroom.",
              "Putting a queue in front of a full bulkhead; reject or shed instead of hiding saturation.",
              "Isolating at the thread level but sharing a connection pool; isolate every constrained resource on the path.",
            ],
          },
        ),
        topic(
          "back-pressure",
          "Without back-pressure, an overloaded consumer accepts work until memory or disk fills, then fails all requests instead of the excess.",
          [
            "Bounded queues and admission control",
            "Credit-based flow control",
            "Load shedding with 429 and Retry-After",
            "Queue depth as a saturation signal",
          ],
          "Run a producer at twice consumer capacity with an unbounded queue and then a bounded one; record queue depth, p99, memory and dropped work, and write the shedding policy.",
          {
            summary:
              "Back-pressure signals upstream producers to slow down when a downstream stage cannot keep up, using bounded queues, credits or flow-control windows. It keeps latency and memory bounded under overload by making the limit visible early, rather than hiding it behind an unbounded buffer.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Adding an unbounded queue to absorb spikes; bound it and shed or block at the entrance.",
              "Shedding random requests without a priority rule; protect interactive traffic and drop batch work first.",
              "Returning 503 without Retry-After; clients retry immediately and re-create the overload.",
            ],
            resources: [
              {
                title: "Google SRE — Handling overload",
                url: "https://sre.google/sre-book/handling-overload/",
                kind: "docs",
              },
              {
                title: "AWS Builders' Library — Using load shedding to avoid overload",
                url: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/",
                kind: "docs",
              },
              {
                title: "Reactive Streams — Specification",
                url: "https://www.reactive-streams.org/",
                kind: "spec",
              },
            ],
          },
        ),
        topic(
          "throttling",
          "Throttling protects a shared service from one noisy tenant and turns capacity limits into a predictable contract instead of a crash.",
          [
            "Token bucket and leaky bucket",
            "Per-tenant quotas and fairness",
            "Distributed rate limiting with Redis",
            "429 semantics and Retry-After",
          ],
          "Implement a token bucket at 100 requests per second with a 200-request burst, run a 10x burst test, and record allowed, rejected and p99 latency with and without the limiter.",
          {
            summary:
              "Throttling limits the rate at which a client, tenant or workload may consume a resource, usually with a token bucket or leaky bucket. A good limit is expressed in requests per second and burst size, enforced close to the resource, and returned with a clear 429 and Retry-After.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Enforcing only a per-second average with no burst limit; add bucket capacity or the first second still floods.",
              "Keeping counters in process memory across replicas; use a shared store or partition limits by instance.",
              "Throttling after the expensive work; reject at the edge before the database or model call.",
            ],
            resources: [
              {
                title: "Azure Architecture Center — Throttling pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling",
                kind: "docs",
              },
              {
                title: "Amazon API Gateway — Throttling",
                url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html",
                kind: "docs",
              },
              {
                title: "Google SRE — Handling overload",
                url: "https://sre.google/sre-book/handling-overload/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "queue-based-load-leveling",
          "A queue absorbs a burst, but it also converts overload into latency; without a drain-time calculation the backlog outlives the spike.",
          [
            "Arrival rate versus service rate",
            "Little's law and queue drain time",
            "Visibility timeout and redelivery",
            "Dead-letter queues and poison messages",
          ],
          "Send a 10x burst for 60 seconds into a queue with fixed consumers, measure peak depth and drain time, then add consumers and record the new cost and latency table.",
          {
            summary:
              "Queue-based load leveling puts a durable buffer between producers and a rate-limited consumer so that spikes become backlog instead of errors. The design must bound queue depth and compute drain time from arrival rate, service rate and consumer concurrency, or the queue becomes an outage with a delay.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Letting the queue grow without a maximum; alert on age of oldest message, not only depth.",
              "Scaling consumers without checking the downstream limit; more consumers can overwhelm the database.",
              "Retrying a poison message forever; bound receive count and route it to a dead-letter queue.",
            ],
            resources: [
              {
                title: "Azure Architecture Center — Queue-Based Load Leveling pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
                kind: "docs",
              },
              {
                title: "AWS Builders' Library — Avoiding insurmountable queue backlogs",
                url: "https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/",
                kind: "docs",
              },
              {
                title: "Amazon SQS — Developer guide",
                url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "messaging-and-workflows",
      title: "Messaging and workflows",
      description:
        "Move work off the request path without losing it. You will choose queues or streams, make consumers idempotent, and design a compensating transaction for a workflow that cannot be atomic.",
      topics: [
        topic(
          "message-queues",
          "A queue turns a remote call into a durable handoff, and its acknowledgment semantics decide whether work is lost or duplicated.",
          [
            "Point-to-point delivery and competing consumers",
            "Visibility timeout and acknowledgment",
            "At-least-once versus at-most-once",
            "Dead-letter queues and retention",
          ],
          "Produce 1,000 messages, kill a consumer mid-batch, and record redelivery count, duplicate processing and dead-letter depth under a 30-second visibility timeout.",
          {
            summary:
              "A message queue stores messages until a consumer acknowledges them, decoupling producer latency from consumer availability. Delivery is usually at-least-once, so visibility timeouts, redelivery and dead-letter handling determine whether duplicate or stuck work reaches production.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Acknowledging before the work completes; a crash then loses the message, so ack after the durable effect.",
              "Setting a visibility timeout shorter than the job; the message redelivers while the first worker is still running.",
              "Using one queue for priority and batch work; separate queues so a backlog cannot starve interactive traffic.",
            ],
          },
        ),
        topic(
          "task-queues",
          "Task queues move slow work off the request path, but retries, timeouts and worker concurrency decide whether the user ever gets the result.",
          [
            "Producer, broker and worker lifecycle",
            "Task acknowledgment and late acknowledgment",
            "Retry policies and dead-letter routing",
            "Scheduled and delayed tasks",
          ],
          "Build a task that takes 30 seconds, set a 10-second visibility timeout, and show the duplicate execution; then fix the timeout and add an idempotency key with a result table.",
          {
            summary:
              "A task queue holds units of work for worker processes, with scheduling, retries and result storage around the task. The queue decouples request latency from job duration, but it also adds a second state machine that must handle duplicate execution, long-running tasks and partial failure.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Setting a timeout shorter than the job; derive it from p99 duration and renew a heartbeat for long tasks.",
              "Storing large payloads in the task body; use object storage and pass a claim check.",
              "Retrying a non-idempotent task; key the side effect on the task id and store the result.",
            ],
            resources: [
              {
                title: "Celery — Distributed task queue",
                url: "https://docs.celeryq.dev/en/stable/",
                kind: "docs",
              },
              {
                title: "Sidekiq — Wiki",
                url: "https://github.com/sidekiq/sidekiq/wiki",
                kind: "docs",
              },
              {
                title: "Azure Architecture Center — Competing Consumers pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "publishersubscriber",
          "Fan-out is cheap to add and expensive to operate: one publish becomes many deliveries, each with its own lag and failure mode.",
          [
            "Topics, subscriptions and fan-out",
            "Consumer groups and offset tracking",
            "At-least-once delivery and duplicates",
            "Replay and retention windows",
          ],
          "Publish one event to three subscriptions, make one consumer 10x slower, and record per-subscription lag, duplicate count and retention headroom in a table.",
          {
            summary:
              "Publish/subscribe delivers one event to every interested subscription, so the publisher does not know the consumer set. The decoupling lets teams add consumers independently, but delivery guarantees, ordering and per-subscription lag become separate operational contracts.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Assuming one slow subscriber blocks the others; isolate subscriptions and monitor lag per consumer.",
              "Publishing before the database commit; the event can describe a state that never became durable, so use an outbox or publish after commit.",
              "Depending on global ordering across partitions; order only within a partition key and document it.",
            ],
            resources: [
              {
                title: "Azure Architecture Center — Publisher/Subscriber pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/publisher-subscriber",
                kind: "docs",
              },
              {
                title: "Google Cloud Pub/Sub — Overview",
                url: "https://cloud.google.com/pubsub/docs/overview",
                kind: "docs",
              },
              {
                title: "Apache Kafka — Documentation",
                url: "https://kafka.apache.org/documentation/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "idempotent-operations",
          "At-least-once delivery and client retries make duplicate execution normal; idempotency is the property that keeps the side effect single.",
          [
            "Idempotency keys and request fingerprints",
            "Unique constraints and conditional writes",
            "Deduplication windows and key retention",
            "Exactly-once as an application property",
          ],
          "Add an Idempotency-Key table with a unique constraint to a payment endpoint, replay the same request ten times, and record side effects, response codes and storage growth.",
          {
            summary:
              "An idempotent operation produces the same observable state when applied more than once with the same input. In distributed systems this is enforced with idempotency keys, unique constraints or conditional writes, because the transport may duplicate a request and the client cannot always know whether the first attempt succeeded.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Generating a new key on every retry; reuse the key for the logical operation and store the response.",
              "Deduplicating only in memory; a restart or another replica loses the record, so persist the key and result.",
              "Hashing the whole payload without canonicalization; reordered JSON breaks dedupe, so define a stable fingerprint.",
            ],
          },
        ),
        topic(
          "compensating-transaction",
          "Distributed workflows cannot hold a lock across services, so a failed step needs an explicit undo with its own failure modes.",
          [
            "Saga orchestration and choreography",
            "Compensation semantics and ordering",
            "Non-compensable steps and pivots",
            "Idempotent compensation and retries",
          ],
          "Design a three-step booking saga, fail the third step, and produce a state diagram plus a failure table naming each compensation, its owner and its own retry policy.",
          {
            summary:
              "A compensating transaction reverses the observable effect of an earlier step when a later step fails, because no single ACID transaction spans the services. The workflow is a saga: each step has a compensation, compensations must be idempotent, and some effects such as an email cannot be truly undone.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Compensating a step that never committed; track step state and compensate only confirmed effects.",
              "Assuming compensation restores the exact prior state; design for a business-acceptable reversal and record the difference.",
              "Letting compensation run without idempotency; a retried undo can double-refund or double-release.",
            ],
          },
        ),
        topic(
          "event-sourcing",
          "An event log preserves history and enables replay, but it also makes schema evolution and projection rebuilds part of the production contract.",
          [
            "Append-only event log",
            "Projections and read models",
            "Snapshots and replay time",
            "Event schema versioning and upcasting",
          ],
          "Implement a small account aggregate as events, rebuild a balance projection from zero, measure replay time at 10,000 events, then add a snapshot and record the improvement.",
          {
            summary:
              "Event sourcing stores every state change as an immutable event and derives current state by replaying them. The log becomes the source of truth, so projections can be rebuilt and audited, while event schema versioning, snapshots and replay time become the operational constraints.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Publishing events before the append is durable; append and commit first, then publish from the log.",
              "Changing an event schema in place; add a version and an upcaster, and keep old events replayable.",
              "Replaying the entire log for every projection change; snapshot and bound the replay window.",
            ],
          },
        ),
      ],
    },
    {
      slug: "observability-and-operations",
      title: "Observability and operations",
      description:
        "Make the system explain itself in production. You will define SLIs, instrument a request path, expose health checks and build an alert that fires on a user-visible symptom rather than a noisy cause.",
      topics: [
        topic(
          "monitoring",
          "Monitoring is only useful when it answers a user-facing question; a wall of host metrics can be green while checkout is failing.",
          [
            "Four golden signals: latency, traffic, errors, saturation",
            "Metrics, logs and traces",
            "Cardinality and retention budgets",
            "SLIs tied to user-facing request paths",
          ],
          "Define six SLIs for one service, map each to a metric and a query, and write a one-page monitoring plan with retention and cardinality limits.",
          {
            summary:
              "Monitoring collects metrics, logs and traces to answer whether the system is healthy and why it is not. The design starts from service-level indicators and the four golden signals, then chooses retention and cardinality budgets so the data remains queryable during an incident.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Monitoring only CPU and memory; add request rate, errors and latency from the user's perspective.",
              "Putting user IDs or request IDs in metric labels; cardinality explodes, so keep identifiers in logs or traces.",
              "Keeping raw metrics forever; downsample and set retention by the question each window answers.",
            ],
            resources: [
              {
                title: "Google SRE — Monitoring distributed systems",
                url: "https://sre.google/sre-book/monitoring-distributed-systems/",
                kind: "docs",
              },
              {
                title: "Prometheus — Instrumentation practices",
                url: "https://prometheus.io/docs/practices/instrumentation/",
                kind: "docs",
              },
              {
                title: "OpenTelemetry — Observability primer",
                url: "https://opentelemetry.io/docs/concepts/observability-primer/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "instrumentation",
          "Without instrumentation the system cannot distinguish a slow dependency from a slow query, and every incident becomes guesswork.",
          [
            "OpenTelemetry spans and context propagation",
            "Histogram buckets and percentiles",
            "RED and USE metric sets",
            "Exemplars and trace-linked metrics",
          ],
          "Instrument one request path with a server span, two client spans and a latency histogram, then measure p99 overhead with tracing at 1 and 100 percent sampling.",
          {
            summary:
              "Instrumentation adds spans, metrics and structured logs to the request path with consistent names and context. Trace context propagates across service boundaries, histograms preserve the tail, and the overhead must be measured so observability does not become the bottleneck.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Recording only averages; use histograms and publish p50/p95/p99 from the same buckets.",
              "Starting a span but not ending it on the error path; defer the end and record the error status.",
              "Sampling 100 percent in production; use head or tail sampling and keep error traces.",
            ],
          },
        ),
        topic(
          "health-endpoint-monitoring",
          "A health check that fails on a dependency outage removes every healthy instance at once, turning a degraded dependency into a total outage.",
          [
            "Liveness, readiness and startup probes",
            "Shallow versus deep health checks",
            "Health-check interval and failure threshold",
            "Dependency failure and blast radius",
          ],
          "Add /livez and /readyz, break a dependency in a test environment, and record which endpoint the load balancer removes and whether the process restarts.",
          {
            summary:
              "A health endpoint reports whether an instance can serve traffic, usually split into liveness, readiness and startup checks. Liveness should test only the process, readiness should test the ability to serve, and deep dependency checks belong in a separate diagnostic endpoint to avoid cascading removal.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Putting a database ping in liveness; a database blip restarts every healthy process, so keep liveness local.",
              "Marking readiness true before warm-up finishes; gate it on cache, connection pool and config readiness.",
              "Using the same threshold for liveness and readiness; readiness can fail fast, liveness needs consecutive failures.",
            ],
          },
        ),
        topic(
          "performance-monitoring",
          "Averages hide the tail and dashboards hide regressions; performance monitoring needs percentiles, saturation and a baseline to compare against.",
          [
            "Percentile latency and histograms",
            "Throughput and error-rate correlation",
            "USE method for resource saturation",
            "Baseline comparison and regression detection",
          ],
          "Load test a service before and after a deploy, chart p50/p95/p99 and saturation, and write a regression note that identifies the deploy and the affected endpoint.",
          {
            summary:
              "Performance monitoring tracks request latency, throughput, error rate and resource saturation over time, with percentiles rather than averages. It distinguishes a regression from normal variance by comparing against a baseline and by correlating the change with deploys, traffic mix and dependency latency.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Comparing p95 across different traffic mixes; segment by endpoint, status and client type.",
              "Using CPU as the only saturation signal; include run queue, connection pools and queue depth.",
              "Alerting on a single slow minute; require a sustained window and a baseline deviation.",
            ],
            resources: [
              {
                title: "Google SRE — Monitoring distributed systems",
                url: "https://sre.google/sre-book/monitoring-distributed-systems/",
                kind: "docs",
              },
              {
                title: "Brendan Gregg — The USE method",
                url: "http://www.brendangregg.com/usemethod.html",
                kind: "docs",
              },
              {
                title: "Prometheus — Histograms and summaries",
                url: "https://prometheus.io/docs/practices/histograms/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "visualization--alerts",
          "An alert that fires on a cause rather than a symptom wakes someone for an outage users have not noticed, or misses one they have.",
          [
            "SLO burn-rate alerts",
            "Multi-window and multi-burn-rate policies",
            "Dashboard hierarchy from SLO to component",
            "Runbooks and alert ownership",
          ],
          "Build a two-window burn-rate alert for a 99.9 percent SLO, inject errors to consume 2 percent of the monthly budget per hour, and record detection time and false-positive behavior.",
          {
            summary:
              "Dashboards show current and historical behavior at the resolution needed for diagnosis, while alerts page only when a user-visible SLO is at risk. Multi-window burn-rate alerts combine a fast window for detection with a slow window for confidence, reducing both missed incidents and alert fatigue.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Alerting on a single threshold crossing; use burn rate over a window and require sustained consumption.",
              "Putting every metric on one dashboard; build an SLO overview then drill into service and instance views.",
              "Paging without a runbook or owner; attach the first diagnostic query and the escalation path.",
            ],
            resources: [
              {
                title: "Google SRE — Practical alerting from time-series data",
                url: "https://sre.google/sre-book/practical-alerting/",
                kind: "docs",
              },
              {
                title: "Google SRE Workbook — Alerting on SLOs",
                url: "https://sre.google/workbook/alerting-on-slos/",
                kind: "docs",
              },
              {
                title: "Prometheus — Alerting practices",
                url: "https://prometheus.io/docs/practices/alerting/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "security-monitoring",
          "Security monitoring needs a baseline of normal behavior and a retention window long enough to investigate an incident that is discovered weeks later.",
          [
            "Audit logs and immutable retention",
            "Authentication anomaly detection",
            "Least-privilege change monitoring",
            "Detection, triage and response workflow",
          ],
          "Define five detections for one service, simulate failed logins and a privilege change, and record the signal, threshold, false-positive rate and first response step.",
          {
            summary:
              "Security monitoring collects authentication, authorization, configuration and network events to detect behavior that violates policy. Detection is a trade-off between coverage and false positives, so signals are ranked by impact and paired with an investigation path and a retention period that matches the threat model.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Logging authentication failures without the source IP and user agent; the alert cannot distinguish a password spray from a typo.",
              "Retaining audit logs only 7 days; a breach found in week three has no evidence, so set retention from the threat model.",
              "Alerting on every blocked request; rank detections by impact and tune thresholds against a baseline.",
            ],
            resources: [
              {
                title: "OWASP — Logging cheat sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html",
                kind: "docs",
              },
              {
                title: "NIST SP 800-92 — Guide to computer security log management",
                url: "https://csrc.nist.gov/pubs/sp/800/92/final",
                kind: "docs",
              },
              {
                title: "MITRE ATT&CK",
                url: "https://attack.mitre.org/",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
  ],
};
