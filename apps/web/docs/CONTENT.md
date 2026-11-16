# Content standard

A guided path is an argument about the order in which a subject should be learned. It is not a
renamed copy of the source roadmap, a list of links, or a place to restate a topic title in longer
words. Every topic must earn its place in the sequence and leave the learner with something they can
do that they could not do before.

`pnpm content:audit` enforces the mechanical parts of this standard. The editorial parts are
reviewed here, in code review, and by reading a stage end to end.

## What a guided path must contain

- **Five to ten stages.** Each stage is a coherent capability, not a chapter heading. Its
  description names the capability, the mechanism the learner will understand, and the artifact the
  stage produces.
- **At least thirty-two topics in the guided stages.** The extended library is reference material
  and does not count toward the guided path.
- **A deliberate order.** Every stage depends on the previous one. Within a stage, every topic
  either introduces a mechanism or applies the previous topic. If two topics can be swapped without
  changing the learning outcome, the stage is probably a list instead of a sequence.
- **A focused scope.** A topic is small enough to study in 25–75 minutes and large enough to matter.
  A topic that needs three sessions is two topics. A topic that fits in a paragraph is a bullet in
  another topic.
- **An honest estimate.** A path's `estimatedHours` includes the focused reading session, the
  practice artifact and one review cycle. The sum of topic `minutes` is lower because it measures
  the session, not the complete learning loop.

## What every topic must contain

| Field        | Standard                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `summary`    | Two or three sentences of substance. Name the mechanism, the boundary it creates and the consequence. At least 120 characters. |
| `why`        | One sentence that answers “what breaks if I skip this?”. Specific to this topic, not the path. At least 50 characters.         |
| `concepts`   | Three to five precise ideas, each a technical noun phrase. No “learn the basics” or “understand the importance”.               |
| `practice`   | A runnable or inspectable exercise with a concrete output: a command, a measurement, a test, a decision record, a diff.        |
| `pitfalls`   | Two or three mistakes a competent person actually makes. Each one names the failure and the correction.                        |
| `difficulty` | `foundation`, `core` or `advanced`, consistent with where the topic appears.                                                   |
| `minutes`    | 15–120, calibrated to the practice, not to the reading.                                                                        |
| `resources`  | At least two authoritative sources. Prefer specifications, official docs and source code over blog posts.                      |

### Summaries

Write for someone who already programs but has not met this idea. Define the mechanism in the first
sentence and the consequence in the second. Avoid openers such as “This topic covers”, “In this
section”, “Learn about”, “A comprehensive guide to” and “In today's fast-paced world”.

Bad:

> Caching is an important concept in modern software. It helps improve performance and scalability
> in many different scenarios. Understanding caching is essential for every developer.

Good:

> A cache stores a copy of a value closer to the reader than the source of truth. The win is latency
> and load; the cost is a second copy that can be stale, so every cache needs an invalidation rule and
> a failure policy.

### Practice

The practice prompt is the contract that makes a topic complete in the app. It must produce evidence,
not a feeling. Prefer:

- run a command and paste the output;
- add a failing test, then make it pass;
- measure p50/p95 latency or allocation count before and after;
- write a one-page decision record with two options and a rejected option;
- reproduce a bug, then explain the smallest fix;
- draw a packet, request or state diagram and label every boundary.

Avoid “read the docs”, “explore the API”, “think about” and “make sure you understand”.

### Pitfalls

A pitfall is not a disclaimer. It is a failure mode with a fix. Name the situation, the symptom and
the correction.

Bad:

> Not understanding the topic can cause problems.

Good:

> Caching a negative lookup without its own TTL means the next write is invisible until the entry
> expires. Give negative entries a short, separate TTL.

### Resources

Two authoritative sources minimum. A source is authoritative when it owns the behavior: a language
specification, an RFC, official framework documentation, the implementation, or a maintained
reference. Blog posts are acceptable as a third source when they contain a concrete walkthrough that
the official docs do not.

Do not invent URLs. If a link is uncertain, omit it and keep the source topic's existing resources.

## Stage descriptions

A stage description answers three questions in two or three sentences:

1. What can the learner do at the end of the stage?
2. Which mechanism makes that possible?
3. What artifact or measurement proves it?

## Editorial voice

- Concrete over abstract. Prefer `TCP retransmits`, `DOMContentLoaded`, `SIGTERM`, `p99`, `EXPLAIN
  ANALYZE`, `go test -race` over “network issues”, “page load”, “process shutdown”, “performance”.
- Short sentences. One idea per sentence.
- No marketing language: unlock, journey, landscape, seamless, powerful, robust, comprehensive,
  cutting-edge, game-changer, delve, leverage (as a verb), elevate, supercharge.
- No second-person cheerleading. “You will learn” is not content.
- No em dashes used as a substitute for a colon or a period.
- Use the vocabulary of the domain. If the topic is about BGP, say `AS_PATH`, `eBGP`, `iBGP`,
  `route reflector`, not “routing magic”.
- Every claim that can be checked should be checkable. Prefer a number, a command or a specification
  section over an adjective.

## Structural integrity

- Topic slugs must match a source topic in `roadmaps/<slug>/content/` whenever one exists. This keeps
  the roadmap resources attached. A genuinely new topic may use a new slug, but it must ship with at
  least two resources in its curriculum entry.
- Slugs are lowercase kebab-case and unique within a path.
- Titles are human-readable and do not repeat the stage title.
- A stage does not contain two topics that teach the same mechanism under different names.
- New paths must be added to `app/content/curricula/index.ts` and to the count claims in
  `apps/web/README.md` and `apps/web/CHANGELOG.md`.

## Review checklist

- [ ] The path has a clear audience and a stated outcome.
- [ ] Stages form a dependency chain, not a taxonomy.
- [ ] Every topic has a unique, specific summary.
- [ ] Every practice produces evidence.
- [ ] Every pitfall names a failure and a correction.
- [ ] Resources are authoritative and reachable.
- [ ] Minutes add up to a realistic total.
- [ ] `pnpm content:audit`, `pnpm typecheck` and `pnpm build` pass.
- [ ] The path reads well when opened on a phone and skimmed stage by stage.
