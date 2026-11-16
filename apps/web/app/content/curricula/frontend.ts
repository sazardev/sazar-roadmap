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
          {
            summary:
              "A URL resolves through DNS to an IP address, then a TCP or QUIC connection and a TLS handshake carry HTTP requests and responses as packets. Each stage adds round trips, so a page that opens four new origins can pay four resolutions and handshakes before useful bytes arrive.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Measuring only bandwidth and ignoring round-trip time; a 200 ms RTT makes twenty sequential requests slow regardless of throughput. Count round trips before optimizing payload size.",
              "Assuming DNS and TLS are one-time costs; every new origin repeats resolution, connection setup and often a TLS handshake. Consolidate origins when latency matters.",
              "Testing only on localhost, where DNS and TLS costs are near zero. Throttle the network in DevTools and compare against a remote host.",
            ],
          },
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
          {
            summary:
              "HTTP is a stateless request/response protocol: a method, target, headers and optional body produce a status code, headers and response body. Semantics such as safe and idempotent methods decide whether caches, proxies and retries may repeat a request safely.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Retrying a failed POST because the connection dropped; the server may have committed twice. Retry only idempotent methods or send an idempotency key.",
              "Returning 200 with an error body; caches, monitors and client libraries now treat failure as success. Use 4xx for request faults and 5xx for server faults.",
              "Putting session data in a cookie without `Secure`, `HttpOnly` and a scoped `SameSite`; the browser sends it to every matching request. Scope attributes to what the endpoint needs.",
            ],
          },
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
          {
            summary:
              "DNS maps a hostname to resource records, commonly an A or AAAA address, a CNAME alias, or MX and TXT records used by mail and certificate validation. The TTL on each record decides how long resolvers may cache it, which sets the delay between a DNS change and global cutover.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Placing a CNAME at the zone apex, which the DNS standard forbids alongside NS and SOA records. Use an ALIAS or ANAME record, or a provider that flattens CNAMEs.",
              "Leaving a 24-hour TTL until the day of a migration; resolvers keep the old address. Lower the TTL at least one old TTL before the cutover.",
              "Changing nameservers without recreating TXT validation records, which silently breaks certificate issuance. Diff the zone before delegation.",
            ],
          },
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
          {
            summary:
              "The browser parses HTML into the DOM and CSS into the CSSOM, combines them into a render tree, then runs layout, paint and compositing for each frame. Scripts, stylesheets and long tasks on the main thread delay those stages, so a blocked main thread shows up as a late first paint or a dropped frame.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              'Putting a synchronous script in `<head>`; it blocks HTML parsing and delays the DOM. Use `defer`, `type="module"`, or preload the resource.',
              "Animating `width`, `top` or `left` every frame, forcing layout before each paint. Animate `transform` and `opacity`, which can be handled by the compositor.",
              "Reading `offsetHeight` after every DOM write; each read forces a synchronous layout. Batch reads first and writes second.",
            ],
          },
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
          {
            summary:
              "HTML elements become DOM nodes with implicit roles, and native controls carry keyboard behavior, form validation and accessibility semantics without script. A `div` with a click handler has none of those defaults, so the page must rebuild focus, activation and error reporting itself.",
            difficulty: "foundation",
            minutes: 60,
            pitfalls: [
              "Using a clickable `div` instead of `button`; it is not focusable and does not respond to Enter or Space. Use the native element unless a custom widget is unavoidable.",
              "Using `placeholder` as the only label; it disappears as soon as the user types and is not a reliable accessible name. Add a persistent `<label>`.",
              "Choosing heading levels by font size and skipping from `h1` to `h4`; screen readers lose the outline. Keep levels sequential and style with CSS.",
            ],
          },
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
          {
            summary:
              "The cascade chooses a winning declaration from origin, importance, specificity and source order, then layout computes a box for each element from the CSSOM. Declarations that change geometry trigger layout, while color and opacity can skip to paint or compositing, which is why property choice matters as much as selector choice.",
            difficulty: "foundation",
            minutes: 70,
            pitfalls: [
              "Fighting specificity with `!important`; the next change needs another `!important`. Use cascade layers or flatter selectors.",
              "Using fixed heights with `overflow: hidden` so long text is clipped instead of wrapping. Prefer `min-height` and intrinsic sizing.",
              "Assuming viewport media queries are enough for a reusable component; it breaks in a narrow sidebar. Use container queries.",
            ],
          },
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
          {
            summary:
              "The accessibility tree is computed from DOM roles, names and states, and assistive technology navigates that tree rather than the pixels. Focus order, live-region announcements and visible focus come from markup and keyboard behavior, so a visual-only fix can leave the page unusable without a mouse.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Removing the focus outline and replacing it with nothing; keyboard users lose their position. Supply a visible `:focus-visible` style.",
              'Adding `aria-hidden="true"` to a container that still holds focusable elements; focus lands on invisible controls. Use `inert` or remove those elements from the tab order.',
              "Trusting an automated axe score as complete coverage; it misses focus order and announcement quality. Run a keyboard pass and a screen-reader pass.",
            ],
          },
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
          {
            summary:
              "JavaScript runs on a single main thread: the event loop takes one task at a time and drains all microtasks after each task, while rendering waits for the thread to yield. A long synchronous task therefore delays input and paint, and promise chains that never yield can starve the next task.",
            difficulty: "foundation",
            minutes: 90,
            pitfalls: [
              "Parsing a large JSON payload synchronously; the main thread cannot paint or handle clicks. Move parsing to a Web Worker or split the work.",
              "Expecting `setTimeout(fn, 0)` to run before a resolved promise; microtasks drain first. Order work by queue type, not by timer delay.",
              "Capturing a mutable `var` in a loop; every closure reads the final value. Use `let` per iteration or a factory function.",
            ],
          },
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
          {
            summary:
              "The platform exposes fetch with `AbortController`, URL and history, storage, performance observers and Web Workers, each with its own lifecycle and failure mode. A wrapper library can hide those details, but it cannot remove the abort, quota or main-thread costs they represent.",
            difficulty: "core",
            minutes: 75,
            pitfalls: [
              "Starting a fetch on every keystroke without aborting the previous one; a slow response can overwrite newer results. Abort on change and ignore aborted errors.",
              "Treating `localStorage` as free; reads and writes are synchronous and block the main thread. Keep large data in IndexedDB and cache in memory.",
              "Creating an `IntersectionObserver` per element and never disconnecting; callbacks keep running after the node is gone. Observe once and disconnect on cleanup.",
            ],
          },
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
          {
            title: "The DOM",
            summary:
              "The DOM is a live tree of nodes, and every query, mutation and style read runs against the current document rather than a snapshot. Mutating it can invalidate style, layout and focus state, while events travel through capture, target and bubble phases, which is what makes delegation possible.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Rebuilding a container with `innerHTML`; it destroys focus, scroll position and listeners on descendants. Update the smallest nodes or use a keyed diff.",
              "Attaching a listener to every row; memory and setup grow with the list. Delegate from the container and use `closest()` to find the row.",
              "Writing to the DOM and then reading layout inside the same loop; each read forces synchronous layout. Batch writes, then measure.",
            ],
            resources: [
              {
                title: "Document Object Model (DOM)",
                url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
                kind: "docs",
              },
              {
                title: "Document",
                url: "https://developer.mozilla.org/en-US/docs/Web/API/Document",
                kind: "docs",
              },
            ],
          },
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
          {
            summary:
              "A custom element is upgraded when its definition registers, and shadow DOM gives its internals a separate tree with scoped styles and slots for light-DOM children. Events cross the boundary retargeted to the host, while external CSS cannot reach internals without custom properties or `::part`.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Reaching into shadow DOM from page CSS; the selector silently matches nothing. Expose custom properties or `part` attributes as the styling contract.",
              "Treating shadow DOM as a security boundary; page script can still access the host and its internals. Sanitize untrusted content before it enters the tree.",
              "Registering the same element name twice, which throws; guard registration or load the definition once.",
            ],
          },
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
          {
            summary:
              "A service worker is a script registered for an origin and scope that sits between the page and the network, handling `fetch` events even when no tab is open. The browser starts and stops it at will, and a new version waits until old clients release it, so cache versioning and activation policy decide whether users see stale assets.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Serving `index.html` cache-first forever; a deploy is invisible until the cache is cleared. Use network-first or stale-while-revalidate for documents.",
              "Calling `skipWaiting()` unconditionally while old tabs are open; they can request chunks that no longer exist. Coordinate activation or keep hashed assets available.",
              "Assuming the worker stays alive between events; global state disappears when it is terminated. Persist state in IndexedDB or the Cache API.",
            ],
          },
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
          {
            summary:
              "An installed web app combines a manifest, a service worker and HTTPS, which lets the browser launch it in a standalone window and serve cached navigations. Offline writes still need a queue and a conflict rule, because the network can return after the user has already moved on.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Shipping a manifest whose `start_url` falls outside the service worker scope; installability checks fail. Align scope, start URL and registration path.",
              "Caching reads but not queueing writes; an offline edit is lost on reload. Persist mutations in IndexedDB and replay them with an idempotency key.",
              "Assuming `beforeinstallprompt` exists in every browser; Safari does not expose it. Provide install instructions that do not depend on the event.",
            ],
          },
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
          {
            summary:
              "The same-origin policy lets a document read only resources from its own scheme, host and port, and CORS is the server's opt-in header response that relaxes it for browsers. XSS defeats that model by running script inside the trusted origin, so output encoding, CSP and cookie scope all matter at the boundary.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Sanitizing input on write and then inserting it with `innerHTML`; stored payloads execute on read. Encode or sanitize at the output sink.",
              "Treating CORS as API authorization; non-browser clients ignore it and same-origin server code can call the API directly. Enforce authentication and authorization on the server.",
              "Putting an API secret in a `VITE_` variable; the bundler inlines it into client JavaScript. Keep secrets server-side and proxy the call.",
            ],
          },
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
          {
            summary:
              "React renders components into an element tree, reconciles it against the previous tree by type and key, then commits DOM changes and runs effects after paint. Keys that change between renders remount a subtree, while state updates batched inside an event are applied together before the next render.",
            difficulty: "core",
            minutes: 90,
            pitfalls: [
              "Using an array index as the key for a reorderable list; row state follows the position, not the item. Use a stable identifier.",
              "Copying props into state and syncing with an effect; the copy goes stale. Derive the value during render or reset with a key.",
              "Omitting effect dependencies to avoid re-runs; the effect closes over old values. Include dependencies or use a ref for the latest callback.",
            ],
          },
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
          {
            summary:
              "Frameworks differ in how they turn state into DOM: virtual-DOM diffing, compile-time reactivity or signals, plus their own routing and data-loading model. The migration cost sits in those boundaries, not in the template syntax, so evaluate a framework by rebuilding one representative screen with real data and forms.",
            difficulty: "core",
            minutes: 75,
            pitfalls: [
              "Comparing starter templates or hello-world benchmarks; they skip data loading, forms and error states. Measure a representative screen end to end.",
              "Choosing by GitHub stars alone; check release cadence, breaking-change policy and server-rendering support. Match the project's lifetime.",
              "Rewriting the whole product in one step; the old and new stacks diverge during migration. Ship a vertical slice first.",
            ],
          },
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
          {
            summary:
              "Utility frameworks generate a class per declaration and let markup compose them, while component-scoped systems keep selectors near the component and rely on a build step to hash or scope names. The trade is between naming decisions in CSS and repetition in markup, with bundle size and purge safety decided by the build.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Building class names at runtime, such as appending a size to `text-`; the scanner cannot see them and drops the rule. Map full class strings.",
              "Mixing a utility scale with hand-written pixel values; spacing drifts. Route both through design tokens.",
              "Configuring purge globs that exclude a package or template directory; its classes disappear in production. Include every source path that emits class names.",
            ],
          },
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
          {
            summary:
              "Tailwind reads theme tokens from configuration, scans source files for complete class strings, and emits only the utilities it finds, with variants compiled into state and media-query selectors. Because extraction is textual, dynamically assembled class names never reach the stylesheet, and arbitrary values bypass the scale that keeps the interface consistent.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Composing classes with string interpolation; Tailwind never generates them. Use a lookup of complete class names.",
              "Solving every spacing or color exception with arbitrary values; the scale stops meaning anything. Promote repeated values into theme tokens.",
              "Pasting the same long class list into many components; a variant change becomes a search-and-replace. Extract a component or a small variant map.",
            ],
          },
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
          {
            summary:
              "A design system turns visual decisions into tokens and encodes interaction rules in versioned primitives, so product teams compose instead of reimplementing. The contract includes states, keyboard behavior, accessibility semantics and a deprecation path; without those, consumers fork the component and drift returns.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Publishing a component with only its default state; every team invents hover, focus, disabled and error handling. Specify and test all states.",
              "Changing a token as a visual tweak; every consumer inherits the change. Treat tokens as a versioned API.",
              "Building new components before inventorying duplicates; the system grows faster than adoption. Audit existing patterns first.",
            ],
          },
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
          {
            summary:
              "React Router maps the URL to a nested route tree; loaders run before the route renders, actions handle mutations, and revalidation refreshes the affected loaders. Because the URL is the source of truth, forms and links can work before hydration, and pending or error states belong to the route rather than a component effect.",
            difficulty: "advanced",
            minutes: 75,
            pitfalls: [
              "Fetching in `useEffect` while the route already has a loader; the request starts after render and creates a waterfall. Move reads into the loader.",
              "Ignoring `useNavigation` state; a slow action looks like a dead button. Render pending UI from the router state.",
              "Putting tokens or personal data in path parameters; URLs reach logs and referrer headers. Keep sensitive values out of the URL.",
            ],
          },
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
          {
            summary:
              "Server rendering produces HTML for the first paint, then hydration attaches event handlers by matching the client tree to the existing DOM. A mismatch forces React to discard and re-render that subtree, and any personalized HTML must bypass shared caches or it leaks one user's data to another.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Calling `Date.now()` or `Math.random()` during render; server and client markup differ and hydration warns. Serialize the value or render it after mount.",
              "Caching personalized HTML at the CDN with one key for all users; the next visitor sees someone else's account. Split cache keys or render personalization on the client.",
              "Serializing an entire database result into the hydration payload; the HTML carries data the page never uses. Send only what the client renders.",
            ],
          },
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
          {
            summary:
              "Git stores snapshots as content-addressed commits, and branches are just movable refs, so a rebase replays patches onto a new base and produces new commit hashes. Rewriting is harmless on unpublished commits and disruptive on shared ones, because collaborators still point at the old hashes.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Rebasing and force-pushing a branch others have pulled; their next pull recreates duplicate commits. Rewrite only unmerged local work.",
              "Resolving a conflict by taking one side wholesale; the other side's intent disappears. Re-read both diffs and run the tests afterward.",
              "Committing `.env` or build output; secrets and noise enter history. Add ignore rules before the first commit.",
            ],
          },
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
          {
            summary:
              "A package manager resolves semver ranges into exact versions, writes the resolved graph to a lockfile, and reconstructs `node_modules` from that lockfile on install. Hoisting and workspace linking make a dependency reachable from packages that never declared it, so an undeclared import can pass locally and fail in a clean install.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Deleting the lockfile to resolve a conflict; the next install resolves every range fresh. Edit the specific dependency instead.",
              "Depending on a hoisted transitive package without declaring it; a clean install or a different hoister breaks the build. Add it to `package.json`.",
              "Ignoring install scripts in third-party packages; they execute with your user's permissions. Audit or disable them where the package allows.",
            ],
          },
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
          {
            summary:
              "During development Vite serves source modules over native ESM and pre-bundles dependencies with esbuild; a production build instead follows the Rollup graph, applies tree shaking and emits hashed chunks. The two graphs are not identical, so code that works in the dev server can fail after bundling or in SSR.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Testing only `vite dev`; CommonJS interop, asset URLs and environment variables differ in the build. Run `vite build` and `vite preview` before shipping.",
              "Importing a server-only module into a client component; the build either fails or leaks code. Put it behind a server boundary or a dynamic import.",
              "Assuming dependency pre-bundling reflects the production bundle; check the build report for duplicated or unexpectedly large packages.",
            ],
          },
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
          {
            summary:
              "A bundler walks imports from each entry, removes unused ESM exports when the graph permits it, and groups the result into chunks that the browser can cache independently. Tree shaking depends on static import syntax and side-effect metadata, while dynamic imports decide where a chunk boundary actually lands.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Importing from a barrel file that re-exports an entire library; the bundler must include the module graph. Import the specific path.",
              "Expecting tree shaking to remove CommonJS or modules marked with side effects; the analysis is conservative. Use ESM and set `sideEffects` accurately.",
              "Shipping without source maps; production stack traces point at minified names. Upload hidden maps to the error monitor.",
            ],
          },
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
          {
            summary:
              "A linter parses source into a syntax tree and reports patterns such as unused bindings or unsafe equality; a formatter parses and reprints the same tree without changing behavior. Mixing the two roles produces rules that fight the formatter, so the usual split is formatting for whitespace and lint rules for semantics.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Leaving stylistic rules enabled in the linter while a formatter rewrites the same tokens; each tool undoes the other. Disable formatting rules in the linter.",
              "Enabling a large ruleset in one commit; hundreds of existing violations hide the real errors. Adopt rules in batches with a baseline.",
              "Adding a suppression comment without a reason or owner; the suppression outlives the bug. Require a comment and a follow-up issue.",
            ],
            resources: [
              {
                title: "ESLint documentation",
                url: "https://eslint.org/docs/latest/",
                kind: "docs",
              },
              {
                title: "Prettier documentation",
                url: "https://prettier.io/docs/",
                kind: "docs",
              },
            ],
          },
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
          {
            summary:
              "Tests assert behavior at a boundary: a unit test isolates a function, an integration test renders components against a real DOM, and an end-to-end test drives a browser through the deployed stack. Testing Library queries the accessibility tree, which keeps assertions close to what a user can perceive instead of the component's internal structure.",
            difficulty: "core",
            minutes: 75,
            pitfalls: [
              "Querying by test ID for everything; the test passes even when the label or role is wrong. Prefer `getByRole` and accessible names.",
              "Waiting with a fixed timeout; slow CI makes the test flaky. Use `findBy` or `waitFor` on an observable condition.",
              "Mocking every dependency until the test only exercises the mocks; keep a contract test at the real boundary.",
            ],
          },
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
          {
            summary:
              "DevTools exposes the live DOM and CSSOM, the network waterfall with request priorities, and a performance trace that records main-thread tasks, layout and paint. Reading a trace links a slow interaction to the task that blocked it, while the Application panel shows the storage and service worker state behind stale UI.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Profiling with extensions and a development build; the measured cost is not production. Use a clean profile and a production bundle.",
              "Reading only the Lighthouse score; the trace names the long task or layout shift that caused it. Inspect the cause.",
              "Leaving `Disable cache` on and judging repeat-visit performance; production users hit the HTTP cache. Test both cold and warm loads.",
            ],
          },
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
          {
            summary:
              "Core Web Vitals measure LCP for loading, INP for interaction latency and CLS for unexpected layout movement, with field data reported at the 75th percentile. The critical rendering path decides when the LCP resource is discovered, while long tasks on the main thread and unreserved space decide INP and CLS.",
            difficulty: "advanced",
            minutes: 80,
            pitfalls: [
              "Lazy-loading the hero image; the browser discovers it late and LCP regresses. Load above-the-fold media eagerly and preload it.",
              "Optimizing total page weight while the LCP element waits on JavaScript; prioritize the element's resource and unblock rendering.",
              "Judging performance from one lab run on a fast laptop; use field p75 split by device and connection.",
            ],
          },
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
          {
            summary:
              "Lighthouse loads a page in a controlled browser, applies CPU and network throttling, and scores performance, accessibility, best practices and SEO from a weighted set of audits. The score is a synthetic estimate with a fixed device profile, so a budget on specific metrics catches regressions better than a single number.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Chasing a perfect score by deleting features or blocking resources; real users still wait. Track metrics and budgets.",
              "Comparing scores across Lighthouse versions; weights and audits change. Compare the underlying timings.",
              "Auditing only the desktop profile; mobile CPU throttling exposes main-thread costs the desktop run hides.",
            ],
          },
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
          {
            summary:
              "For a cross-origin request the browser sends `Origin`, and for non-simple methods or headers it first sends an `OPTIONS` preflight; the server must answer with matching `Access-Control-Allow-Origin` and method or header lists. Credentials change the rules: a wildcard origin is rejected, and cookies require `Access-Control-Allow-Credentials` plus an exact origin.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Returning `Access-Control-Allow-Origin: *` with credentials; the browser rejects the response. Echo the requesting origin from an allowlist.",
              "Handling `OPTIONS` only on the happy path; an error response without CORS headers is unreadable by the page even when the preflight passed. Add the headers to every response path.",
              "Blaming CORS for a missing cookie; `SameSite`, `Secure` and domain scope decide whether the cookie is sent. Debug the cookie separately.",
            ],
          },
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
          {
            summary:
              "Content Security Policy is a response header that restricts which scripts, styles, images and connections a document may load, with nonces or hashes authorizing specific inline blocks. `strict-dynamic` extends trust to scripts created by an already trusted script, and report-only mode records violations without blocking while a policy is tuned.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Combining a nonce with `unsafe-inline`; browsers ignore `unsafe-inline` once a nonce is present, so it provides no fallback. Remove `unsafe-inline`.",
              "Enforcing a new policy without a report-only period; a missed `connect-src` or `img-src` breaks the page. Collect reports first.",
              "Forgetting that inline event handlers and `javascript:` URLs are blocked; move handlers into modules and remove string-based script URLs.",
            ],
          },
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
          {
            summary:
              "A deploy publishes a new HTML entry point plus content-hashed assets, and cache headers decide which copy each visitor keeps: HTML should revalidate, while hashed files can be immutable. Atomic promotion and retained old assets keep in-flight tabs working, and a rollback is only safe when the previous build and schema still fit together.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Caching `index.html` for a year; visitors keep loading the old entry and never see the deploy. Use `no-cache` or short revalidation for documents.",
              "Deleting previous build assets immediately; open tabs request chunks that now return 404. Retain several versions.",
              "Shipping a destructive migration with the new code; rollback cannot read the old schema. Make migrations backward compatible for one release.",
            ],
          },
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
          {
            summary:
              "A language model generates code by predicting tokens from the prompt and surrounding context, so the output is plausible text rather than a verified program. The useful loop is therefore specification, small diff, compiler and tests, then review, with license and security checks applied to anything the model reproduced.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Accepting generated code because it reads well; invented APIs and off-by-one logic survive until execution. Run the compiler and tests before review.",
              "Pasting confidential source into a hosted model without checking the data policy; the prompt may be retained or trained on. Use an approved endpoint.",
              "Asking for a large feature in one prompt and reviewing a huge diff; defects hide in volume. Decompose into small, testable changes.",
            ],
          },
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
          {
            summary:
              "A transformer predicts the next token from the tokens in its context window, sampling from a probability distribution whose shape is controlled by temperature and related settings. Context is finite and charged per token, so retrieval, tool calls and streaming shape both answer quality and the latency and cost the interface must display.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Treating the context window as durable memory; old turns fall out or get truncated. Summarize or retrieve relevant state.",
              "Assuming a streamed answer completed successfully when the connection closed early; track finish reasons and handle abort. Show a retry path.",
              "Sending whole documents on every request; latency and cost scale with input tokens. Chunk and retrieve only relevant passages.",
            ],
          },
        ),
      ],
    },
  ],
};
