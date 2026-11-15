import type { Curriculum } from "../types";
import { topic } from "../types";

export const frontend: Curriculum = {
  slug: "frontend",
  title: "Frontend Engineering",
  tagline: "From the first HTTP request to a production interface.",
  description:
    "A deliberate path through the browser, JavaScript, interface design, tooling and the production concerns that separate a demo from an interface people can trust. Every stage ends with an artifact you can show, not a checklist you can forget.",
  level: "beginner",
  icon: "layout",
  estimatedHours: 70,
  stages: [
    {
      slug: "web-foundations",
      title: "Web foundations",
      description:
        "Understand what actually happens between a URL and a painted page before reaching for a framework.",
      topics: [
        topic(
          "how-does-the-internet-work",
          "Every frontend bug eventually becomes a question about requests, DNS or the network; this is the map.",
          [
            "Clients, servers, packets and the request/response cycle",
            "DNS resolution, IP addresses and TLS handshakes",
            "Latency, bandwidth and why the network dominates perceived speed",
          ],
          "Trace one request from your browser to a site you own using DevTools and a DNS lookup tool. Write down every hop and its latency.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "what-is-http",
          "HTTP is the contract your UI speaks to every backend; you need to read it, not just consume it.",
          [
            "Methods, status codes and safe versus idempotent requests",
            "Headers, cookies and content negotiation",
            "HTTP/1.1, HTTP/2 and HTTP/3 differences that affect the frontend",
          ],
          "Use curl to inspect a page's headers and compare an HTML response with a JSON API response.",
          { difficulty: "foundation", minutes: 40 },
        ),
        topic(
          "what-is-domain-name",
          "Domains, subdomains and DNS records are part of deployment, not an infrastructure detail someone else owns.",
          [
            "Registrars, nameservers and record types",
            "Apex versus subdomain hosting",
            "Propagation, TTL and certificate validation",
          ],
          "Draw the DNS path for a subdomain you deploy and list the records needed for it.",
          { difficulty: "foundation", minutes: 30 },
        ),
        topic(
          "browsers-and-how-they-work",
          "The browser is your runtime; knowing its pipeline explains layout shifts, reflows and hydration cost.",
          [
            "Parsing, DOM, CSSOM and the render tree",
            "Layout, paint and compositing",
            "Main thread, event loop and rendering frames",
          ],
          "Open the Rendering panel in DevTools and capture a page load frame by frame. Identify one layout and one paint cost.",
          { difficulty: "foundation", minutes: 50 },
        ),
        topic(
          "html",
          "Semantic HTML is the cheapest accessibility and performance win available, and it survives every framework change.",
          [
            "Document structure, landmarks and heading order",
            "Forms, labels, validation and native controls",
            "Metadata, links and media fallbacks",
          ],
          "Rebuild a complex form with native elements only, then test it with the keyboard and a screen reader's virtual cursor.",
          { difficulty: "foundation", minutes: 60 },
        ),
        topic(
          "css",
          "Layout, cascade and responsive behavior are the difference between a screenshot and an interface that works everywhere.",
          [
            "Cascade, specificity and inheritance",
            "Flexbox, grid and intrinsic sizing",
            "Container queries, clamp and fluid typography",
          ],
          "Build one card component that adapts to its container, not the viewport, and test it in three different layout slots.",
          { difficulty: "foundation", minutes: 70 },
        ),
        topic(
          "accessibility",
          "Accessible interfaces are more resilient, easier to test and legally required in more contexts than most teams admit.",
          [
            "Perceivable, operable, understandable and robust principles",
            "Focus order, names, roles and live regions",
            "Contrast, reduced motion and keyboard-only flows",
          ],
          "Audit one page with keyboard-only navigation and axe. Fix every issue you can reproduce without guessing.",
          { difficulty: "core", minutes: 60 },
        ),
      ],
    },
    {
      slug: "javascript-in-the-browser",
      title: "JavaScript and the browser",
      description:
        "The language and platform primitives behind every framework: modules, events, async work and the Web APIs.",
      topics: [
        topic(
          "javascript",
          "Framework knowledge expires; language and platform knowledge compounds.",
          [
            "Scope, closures and the module system",
            "Prototypes, classes and value versus reference semantics",
            "Promises, async/await and error propagation",
          ],
          "Implement a small pub/sub utility with no framework, then rewrite it with classes and compare the trade-offs.",
          { difficulty: "foundation", minutes: 90 },
        ),
        topic(
          "web-apis",
          "The platform already provides storage, history, observers and workers; reaching for a library first hides the real cost.",
          [
            "Fetch, AbortController and streaming responses",
            "History, URL and navigation APIs",
            "Storage, observers and Web Workers",
          ],
          "Build a page that filters a list while a Web Worker parses a large file, and cancel the work when the query changes.",
          { difficulty: "core", minutes: 75 },
        ),
        topic(
          "dom",
          "You rarely manipulate the DOM directly in React, but you still debug it, measure it and optimize it.",
          [
            "Tree structure, nodes and traversal",
            "Events, bubbling and delegation",
            "Refs, focus and imperative escape hatches",
          ],
          "Write a focus trap for a dialog using only DOM APIs, then explain which library behavior you would keep.",
          { difficulty: "core", minutes: 60 },
        ),
        topic(
          "web-components",
          "Custom elements and shadow DOM explain the boundaries that frameworks emulate and where they leak.",
          [
            "Custom elements and lifecycle callbacks",
            "Shadow DOM encapsulation and slots",
            "When a design system benefits from platform components",
          ],
          "Build a small custom element with a slot and a property-driven state, then consume it from a plain HTML page.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "service-workers",
          "Offline behavior and caching are product decisions; a service worker is where they become real.",
          [
            "Registration, lifecycle and update flow",
            "Cache strategies and versioning",
            "Background sync and offline fallbacks",
          ],
          "Add a versioned cache to a small static site and verify that an update activates without trapping users on stale assets.",
          { difficulty: "advanced", minutes: 70 },
        ),
        topic(
          "pwas",
          "Installability and offline resilience turn a website into something people can rely on in poor conditions.",
          [
            "Manifests, icons and install prompts",
            "Offline-first data and conflict handling",
            "Push notifications and platform constraints",
          ],
          "Make one app installable and usable offline for a read-only flow, then document what still requires the network.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "web-security",
          "The frontend is an attack surface: XSS, CSRF and supply-chain risk are interface concerns, not only backend ones.",
          [
            "Same-origin policy and CORS",
            "XSS sinks, sanitization and output encoding",
            "CSRF, cookies and third-party script risk",
          ],
          "Threat-model one form and one third-party embed; write the concrete mitigation for each entry point.",
          { difficulty: "core", minutes: 60 },
        ),
      ],
    },
    {
      slug: "interfaces-and-frameworks",
      title: "Interfaces and frameworks",
      description:
        "Component thinking, state, rendering models and the design systems that keep an interface coherent.",
      topics: [
        topic(
          "react",
          "React is still the reference model for component UIs; learn the model, not only the API.",
          [
            "Components, props and composition",
            "State, reducers and derived values",
            "Effects, refs and the rules of rendering",
          ],
          "Build a filterable data table with URL-backed state and no global store. Explain every render.",
          { difficulty: "core", minutes: 90 },
        ),
        topic(
          "learn-a-framework",
          "Frameworks change; the ability to evaluate one on its trade-offs is the durable skill.",
          [
            "Rendering model and reactivity",
            "Routing, data loading and mutations",
            "Ecosystem maturity and migration cost",
          ],
          "Rebuild the same small screen in two frameworks and write a one-page decision record comparing them.",
          { difficulty: "core", minutes: 75 },
        ),
        topic(
          "css-frameworks",
          "Utility CSS and component CSS solve different coordination problems; picking one is an architecture choice.",
          [
            "Utility-first versus component-scoped styles",
            "Design tokens and theme boundaries",
            "Bundle size, purge safety and runtime cost",
          ],
          "Convert one component to a token-driven utility approach and measure the CSS shipped before and after.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "tailwind",
          "Tailwind makes the design token layer executable; used carelessly it also makes every component a one-off.",
          [
            "Theme tokens and the spacing scale",
            "Variants, composition and component APIs",
            "Arbitrary values and when they become a smell",
          ],
          "Create a button with three variants and one size scale, then use it in five places without repeating the class list.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "design-systems",
          "A design system is a contract between product, design and engineering; without the contract it is a component folder.",
          [
            "Tokens, primitives and patterns",
            "Versioning and contribution rules",
            "Accessibility and documentation as features",
          ],
          "Document one component with its states, keyboard behavior, tokens and a do/don't example.",
          { difficulty: "advanced", minutes: 70 },
        ),
        topic(
          "react-router",
          "Routing is data architecture: loaders, actions and URL state decide how much client state you actually need.",
          [
            "Nested routes and layouts",
            "Loaders, actions and revalidation",
            "Progressive enhancement and pending UI",
          ],
          "Move a client-side fetch into a route loader and add a form action that works before hydration.",
          { difficulty: "advanced", minutes: 75 },
        ),
        topic(
          "ssr",
          "Server rendering improves first paint and SEO, but only if hydration and caching are designed together.",
          [
            "Request-time rendering and streaming",
            "Hydration mismatches and serialization",
            "Caching, personalization and the edge",
          ],
          "Render a personalized page on the server, stream one slow section, and document what must never be cached.",
          { difficulty: "advanced", minutes: 70 },
        ),
      ],
    },
    {
      slug: "tooling-and-quality",
      title: "Tooling and quality",
      description:
        "The feedback loop: types, bundlers, tests, linting and the browser tools that make change safe.",
      topics: [
        topic(
          "git",
          "Version control is how you make reversible decisions; a messy history is a tax on every future change.",
          [
            "Commits, branches and rebases",
            "Conflict resolution and recovery",
            "Conventional commits and reviewable changes",
          ],
          "Rewrite a messy local branch into three reviewable commits without changing the final tree.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "package-managers",
          "Dependency resolution and lockfiles decide whether a build is reproducible six months from now.",
          [
            "Semver ranges and lockfiles",
            "Workspaces and hoisting",
            "Supply-chain risk and audit workflows",
          ],
          "Add one dependency with pnpm, inspect the lockfile diff, and remove it without leaving residue.",
          { difficulty: "foundation", minutes: 30 },
        ),
        topic(
          "vite",
          "The dev server and build pipeline shape your feedback loop more than most application code.",
          [
            "ESM dev server and dependency pre-bundling",
            "Build targets, chunks and asset handling",
            "Plugins, environments and SSR integration",
          ],
          "Profile a production build, split one route-level chunk, and compare the before/after bundle report.",
          { difficulty: "core", minutes: 60 },
        ),
        topic(
          "module-bundlers",
          "Bundling is a set of trade-offs: request count, cacheability, startup cost and dead code.",
          [
            "Graph construction and tree shaking",
            "Code splitting and chunk strategy",
            "Source maps and minification",
          ],
          "Explain why a dependency appears in the client bundle and remove it with a server-only boundary.",
          { difficulty: "core", minutes: 60 },
        ),
        topic(
          "linters--formatters",
          "Automated style and correctness checks free review attention for design and behavior.",
          [
            "Lint rules versus formatter rules",
            "Staged checks and CI parity",
            "Suppressions and rule ownership",
          ],
          "Add a rule that catches a real bug in your codebase, fix the violations, and document the exception policy.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "testing",
          "Tests are a design tool: if a behavior is hard to test, the boundary is usually in the wrong place.",
          [
            "Unit, integration and end-to-end trade-offs",
            "Testing Library and user-visible queries",
            "Determinism, fakes and flaky test diagnosis",
          ],
          "Write one test that fails for a real regression, then fix the code and keep the test.",
          { difficulty: "core", minutes: 75 },
        ),
        topic(
          "devtools-usage",
          "The browser can answer most performance and correctness questions in minutes if you know which panel to open.",
          [
            "Elements, console and network workflows",
            "Performance traces and long tasks",
            "Application storage, cookies and service workers",
          ],
          "Diagnose one slow interaction with a performance trace and one stale state bug with the Application panel.",
          { difficulty: "core", minutes: 50 },
        ),
      ],
    },
    {
      slug: "production-and-ai",
      title: "Production and AI-assisted work",
      description:
        "Ship, measure, secure and maintain an interface with AI as a tool that still needs review and evidence.",
      topics: [
        topic(
          "performance",
          "Users feel latency before they admire your architecture; performance is a product feature.",
          [
            "Core Web Vitals and field versus lab data",
            "Critical rendering path and resource priorities",
            "JavaScript cost, images and font loading",
          ],
          "Measure a real page with Lighthouse and field data, fix the largest contributor, and record the delta.",
          { difficulty: "advanced", minutes: 80 },
        ),
        topic(
          "lighthouse",
          "A repeatable audit turns vague performance work into a prioritized list.",
          [
            "Categories, budgets and throttling",
            "Accessibility and SEO checks",
            "CI budgets and regression prevention",
          ],
          "Add a performance budget to one route and fail a build when it regresses.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "cors",
          "CORS errors are often a symptom of a cookie, origin or proxy decision made somewhere else.",
          [
            "Origins, preflight and credentials",
            "Simple versus non-simple requests",
            "Development proxies and production headers",
          ],
          "Reproduce a preflight failure, explain the exact header that fixes it, and avoid disabling security to do it.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "csp",
          "A content security policy is the last line of defense when an injection slips through.",
          [
            "Directives and source allowlists",
            "Nonces, hashes and strict-dynamic",
            "Report-only rollout and violation reporting",
          ],
          "Ship a report-only CSP for one page, collect violations, then enforce the narrowest policy that works.",
          { difficulty: "advanced", minutes: 55 },
        ),
        topic(
          "deployment",
          "Deployment is part of the interface: cache headers, environments and rollbacks decide user trust.",
          [
            "Build artifacts and immutable assets",
            "Preview environments and promotion",
            "Rollbacks, migrations and cache invalidation",
          ],
          "Deploy a preview, verify headers and a rollback path, and write the on-call checklist for a bad release.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "ai-assisted-coding",
          "AI can accelerate the mechanical parts, but it cannot own the problem statement, the evidence or the review.",
          [
            "Task decomposition and context selection",
            "Verification with tests, types and diffs",
            "Security, licensing and hidden coupling",
          ],
          "Take one small feature through an AI-assisted loop: plan, generate, test, review and document the rejected output.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "how-llms-work",
          "Frontend engineers now build LLM interfaces; knowing tokens, context and failure modes prevents magical thinking.",
          [
            "Tokens, context windows and sampling",
            "Retrieval, tools and structured output",
            "Hallucination, latency and cost",
          ],
          "Build a small chat UI with streaming, cancellation and a visible citation, then test a context-overflow path.",
          { difficulty: "core", minutes: 60 },
        ),
      ],
    },
  ],
};
