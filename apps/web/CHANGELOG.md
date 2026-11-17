# Changelog

## 0.5.8 — 2026-11-17

- The offline page now lists saved pages from every cache version, not only the newest one.
- The content audit now flags source files without an H1 and validates authored resource URLs.
- `index.md` files are no longer parsed as topics; three junk "Index" topics were removed with the
  guarded migration 0006.
- Added H1 headings to three source files that lacked one.

## 0.5.7 — 2026-11-17

- The topic "Actions" popover now closes on Escape or an outside click.
- Success and error notices on topic and settings pages are announced to screen readers.

## 0.5.6 — 2026-11-17

- Added confirmation before deleting notes, goals, people, coach conversations, and before signing
  out (which clears saved pages and drafts).
- The "New note", "New goal", "Add person" and "Ask a question" buttons now open their collapsed
  forms instead of only scrolling to them.
- External links consistently open in a new tab with safe `rel`, and the smallest visible labels were
  raised to 11px.
- Removed a duplicated hint line and normalized link attributes on the practice page.

## 0.5.5 — 2026-11-17

- Added an audit warning that surfaces 109 duplicate source-title groups in the fork instead of
  silently shipping identically titled topics.
- Replaced a dead Go documentation domain with official `go.dev` links and upgraded 94 resource URLs
  from `http` to `https`; 14 links that do not support HTTPS were left untouched.
- No topic IDs were changed and no content was deleted.

## 0.5.4 — 2026-11-16

- Expanded every generated reference topic with a rationale, a three-step guided exercise and three
  concrete pitfalls instead of empty or one-line content.
- Added a roadmap.sh study link to every topic that had no resources: 233 new resources and no topic
  left without somewhere to read.
- `content:audit` now runs before both local and remote seeds, so bad content cannot reach D1.

## 0.5.3 — 2026-11-16

- Fixed progress reset to remove AI practice attempts, so a reset topic cannot stay "passed" or
  rate-limited.
- Fixed goal status transitions and stats invalidation on progress, goal and settings changes.
- Made study logging concurrency-safe, preserved `mastered` on a practice pass, and respected the
  saved week-start setting in weekly stats.
- Applied the coach rate limit across all threads, cleared AI timeouts and removed no-op writes from
  auth on every request.
- Cut "Save offline" from 80 to 24 full page renders and removed duplicate next-topic scans.
- Fixed the coach composer keeping sent text, added screen-reader status announcements, and made the
  offline "Clear saved pages" button work.
- Fixed empty resource search snippets, hid stale empty stages and added a one-time cleanup
  migration for them.
- Made `content:audit` run before every seed and corrected stale documentation numbers and the
  practice threshold.

## 0.5.2 — 2026-11-16

- Made the practice reviewer more encouraging: a clear answer that shows the core idea now passes
  at 65/100, without requiring every concept or a trade-off.
- Added a three-step answer outline and collapsible hints with the common trap and study references.
- Practice feedback now matches the learner's language and points to the topic's resources after a
  revision.
- Surfaced study links on the practice page and in the revision panel, so what to study next and
  where to study it are one click away.
- Added unit coverage for the pass threshold.

## 0.5.1 — 2026-11-16

- Made the D1 content seed incremental: unchanged rows are no longer rewritten, so a repeated seed
  costs close to zero writes instead of tens of thousands.
- Removed the full FTS rebuild endpoint, its Settings action and the local reindex script. Search
  indexes stay in sync through the existing triggers.
- Dropped the unused `topic_edges` table, its indexes and its seed writes.
- Added a 15-second cache for learning stats, invalidated on study, practice, review and goal
  changes, to cut repeated D1 reads during navigation.
- Documented the Cloudflare write budget and the non-destructive seed workflow.

## 0.5.0 — 2026-11-15

- Rebuilt Coach as a fullscreen chat: compact thread header, scrollable message column, Enter-to-send
  composer, code-fence rendering, source chips and automatic scroll to the latest message. Mobile
  hides the workspace bar on `/coach` so the conversation owns the screen.
- Moved session history to `/coach/history` with open and delete actions; removed the old sessions
  sidebar and the delete control from the chat header. Options are now history and new chat only.
- Reduced mobile type and spacing across page headers, cards, buttons, the dashboard, roadmaps,
  topic reading, settings and navigation; large-text mode is capped at 16.5 px on phones.
- Replaced the mobile account and appearance popovers with `/account` and Settings pages. The topbar
  search link and the bottom-bar More item now open `/search` and `/more` pages instead of the
  command palette. The command palette remains keyboard-only.
- Removed phone-level backdrop blur, fixed backgrounds and heavy card shadows; shortened the mobile
  app bar to 56 px, made it non-sticky and removed the appearance control from it.
- Added a mobile section strip to Settings and moved offline/install controls to Account.

## 0.4.0 — 2026-11-15

- Added eight guided paths: Network Engineering, Software Architecture, Distributed System Design,
  C and Systems Programming, C# and .NET Engineering, Flutter and Dart, Android Engineering and iOS
  Engineering. The app now has 13 guided paths and 638 curated topics, each with a dependency-ordered
  stage map, a unique summary and rationale, evidence-producing practice, specific pitfalls and
  authoritative resources. The generated seed contains 98 roadmaps, 3,293 topics and 8,444
  resources.
- Upgraded Frontend, Backend, AI Engineering and Cloudflare from outline-only topics to the same
  editorial standard, with summaries, pitfalls and resource coverage for every topic.
- Replaced the Go-only audit with a curriculum-wide quality gate: stage counts, guided-topic counts,
  summary uniqueness, rationale length, concept precision, practice actionability, pitfall
  specificity, study-time bounds and minimum authoritative resources.
- Added `docs/CONTENT.md`, the editorial standard for summaries, practice prompts, pitfalls,
  resources, stage descriptions and review.
- Added roadmap icons for network, architecture, system design, C, C#/.NET, Flutter, Android and iOS.
- Corrected the `dom` topic resources and added source-mapped resources where the upstream topic had
  fewer than two links.
- Made the app installable as a PWA with generated icons, a manifest, a build-fingerprinted service
  worker, an offline fallback page, automatic caching of visited pages and a path-level “Save
  offline” action.
- Added an offline banner, an inline update banner and **Account → Offline and install** with
  saved-page counts, storage usage, install controls and cache clearing. Signing out clears saved pages. Practice
  answers and note bodies are kept as local drafts while offline and restored when the page opens
  again.
- Moved the tablet breakpoint to `lg`, added safe-area padding and a labelled icon rail, constrained
  fixed prompts to the visual viewport and fixed horizontal overflow in dashboard cards.
- Slimmed the mobile app bar to 56 px, made it non-sticky on phones, replaced the raised search pill
  with a quiet icon target, moved appearance controls behind the account menu and reduced the
  avatar treatment; tablet and desktop keep the sticky workspace bar.
- Inline code in topic prose now renders as code instead of literal backticks, including flashcards
  and practice pages.
- Rebuilt the shell tablet-first: a labelled icon rail from 768 px, the full sidebar from 1024 px
  and a five-destination bottom bar on phones, all with 44 px targets.
- Added appearance personalization: Iris, Ocean, Moss, Amber, Rose and Mono accents, light/dark/
  system themes, comfortable/compact density, soft/sharp corners and standard/large text, stored in
  SSR-readable cookies and `user_settings`.
- Refreshed the dashboard, roadmap map, topic reading page, review deck, practice form, goals,
  notes, resources, people, coach, search and settings surfaces with calmer cards, larger type and
  clearer empty states.
- Improved keyboard focus, landmark labels, accessible names and metadata; the dashboard now scores
  100 on Lighthouse accessibility, best practices and SEO.

## 0.2.0 — 2026-11-16

- Added the private Go Engineering guided path: 8 stages, 64 curated topics and 108 extended
  reference topics, with authored summaries, concepts, practice prompts and specific pitfalls.
- Added a content quality gate (`pnpm content:audit`) that blocks generic filler, duplicate
  summaries and thin topics.
- Changed topic completion to an AI-reviewed practice gate: a topic becomes complete only when the
  reviewer passes the submitted explanation, design or code.
- Added append-only practice attempts, rubric feedback, revision flow and same-roadmap next practice.
- Replaced the roadmap drawer with direct topic navigation and a content-first reading page.
- Moved coach, tasks, flashcards and Notes actions into a discreet menu.
- Added selection-to-Notes with a floating toolbar and fallback to Roadmap notes.
- Added a compact column map, progression-based roadmap ordering and honest reference/preview
  indexes.
- Fixed primary button contrast, weekly chart rendering, mobile overflow and duplicate roadmap chrome.
