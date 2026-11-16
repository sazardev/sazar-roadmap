import { ArrowRight, Clock3, Layers, Search, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { roadmapIcon } from "~/components/shell/icons";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import { ProgressBar, ProgressRing } from "~/components/ui/progress";
import { EmptyState, PageHeader } from "~/components/ui/surfaces";
import { listRoadmaps, type RoadmapCard } from "~/features/roadmaps/roadmaps.server";
import { requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { cn, percent } from "~/lib/utils";
import type { Route } from "./+types/roadmaps";

export const meta = () => pageMeta("Roadmaps");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const statusParam = url.searchParams.get("status") ?? "all";
  const status = ["guided", "reference", "catalog", "all"].includes(statusParam)
    ? statusParam
    : "all";
  const roadmaps = await listRoadmaps(getEnv(context), user.id, { q, status });
  return { roadmaps, q, status };
}

export default function Roadmaps({ loaderData }: Route.ComponentProps) {
  const { roadmaps, q, status } = loaderData;
  const guided = roadmaps.filter((roadmap) => roadmap.status === "guided");
  const reference = roadmaps.filter((roadmap) => roadmap.status === "reference");
  const catalog = roadmaps.filter((roadmap) => roadmap.status === "catalog");
  const catalogGroups = [
    {
      level: "beginner",
      title: "Start from zero",
      description:
        "Foundations, first languages and beginner variants. Begin here if the guided paths feel too fast.",
    },
    {
      level: "intermediate",
      title: "Build depth",
      description:
        "Role paths, frameworks, data, cloud and delivery. Pick the one closest to the work you want to do.",
    },
    {
      level: "advanced",
      title: "Specialize",
      description:
        "Architecture, security, platform depth and senior roles. These assume comfort with the intermediate layer.",
    },
  ]
    .map((group) => ({
      ...group,
      items: catalog.filter((roadmap) => roadmap.level === group.level),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-5 sm:space-y-8 md:space-y-10">
      <PageHeader
        eyebrow="Learning paths"
        title="Roadmaps"
        description="Curated paths, full reference libraries and every community roadmap in the fork, ordered by progression instead of alphabetically. Progress is private and survives content updates."
        actions={
          <LinkButton to="/coach?mode=plan" variant="secondary" icon={<Sparkles size={17} />}>
            Ask for a study plan
          </LinkButton>
        }
      />

      <form
        method="get"
        className="flex flex-col gap-2.5 rounded-lg border border-line bg-raised p-2.5 shadow-card xl:flex-row xl:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search roadmaps by title or description..."
            className="h-11 w-full rounded-md border border-transparent bg-surface/60 pl-10 pr-3 text-sm outline-none placeholder:text-muted focus-visible:border-accent focus-visible:bg-raised focus-visible:ring-4 focus-visible:ring-accent/15 sm:h-12 sm:pl-11 sm:pr-4 sm:text-base"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "All"],
              ["guided", "Guided"],
              ["reference", "Reference"],
              ["catalog", "Library"],
            ] as const
          ).map(([value, label]) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (value !== "all") params.set("status", value);
            return (
              <Link
                key={value}
                to={`/roadmaps${params.size ? `?${params.toString()}` : ""}`}
                aria-current={status === value ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-fast",
                  status === value
                    ? "border-accent bg-accent text-accent-ink shadow-sm"
                    : "border-line bg-surface/50 text-muted hover:border-line-strong hover:bg-hover hover:text-ink",
                )}
              >
                {label}
              </Link>
            );
          })}
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-ink shadow-sm transition-colors hover:bg-accent-strong sm:px-5"
          >
            Search
          </button>
        </div>
      </form>

      {q ? (
        <p className="text-sm text-muted">
          {roadmaps.length} result{roadmaps.length === 1 ? "" : "s"} for “{q}”.
        </p>
      ) : null}

      {roadmaps.length === 0 ? (
        <EmptyState
          title="No roadmap matches that search"
          description="Try a broader term, or clear the filters to see the full library."
          action={
            <LinkButton to="/roadmaps" variant="secondary">
              Clear filters
            </LinkButton>
          }
          icon={<Search size={24} />}
        />
      ) : null}

      {guided.length > 0 ? (
        <section className="space-y-4" aria-labelledby="guided-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 id="guided-heading" className="text-xl font-semibold tracking-tight">
                Guided paths
              </h2>
              <p className="text-sm text-muted">
                Curated stages, practice prompts and a deliberate order.
              </p>
            </div>
            <Badge tone="outline">{guided.length} paths</Badge>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {guided.map((roadmap) => (
              <GuidedCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        </section>
      ) : null}

      {reference.length > 0 ? (
        <section className="space-y-4" aria-labelledby="reference-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 id="reference-heading" className="text-xl font-semibold tracking-tight">
                Reference libraries
              </h2>
              <p className="text-sm text-muted">
                Complete topic sets without a curated order. Good for search and coaching.
              </p>
            </div>
            <Badge tone="outline">{reference.length} libraries</Badge>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {reference.map((roadmap) => (
              <ReferenceCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        </section>
      ) : null}

      {catalog.length > 0 ? (
        <details
          className="group rounded-lg border border-line bg-raised shadow-card"
          open={Boolean(q) || status === "catalog"}
        >
          <summary className="flex min-h-20 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-6 [&::-webkit-details-marker]:hidden">
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">Content library</h2>
              <p className="text-sm text-muted">
                {catalog.length} community roadmaps with a 16-topic preview each, ordered from
                beginner to advanced.
              </p>
            </div>
            <span className="inline-flex h-10 items-center rounded-full border border-line bg-surface/60 px-4 text-sm text-muted group-open:hidden">
              Show
            </span>
            <span className="hidden h-10 items-center rounded-full border border-line bg-surface/60 px-4 text-sm text-muted group-open:inline-flex">
              Hide
            </span>
          </summary>
          <div className="space-y-8 border-t border-line/80 p-4 md:p-6">
            {catalogGroups.map((group) => (
              <section
                key={group.level}
                className="space-y-3"
                aria-labelledby={`catalog-${group.level}`}
              >
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="space-y-1">
                    <h3 id={`catalog-${group.level}`} className="text-base font-semibold">
                      {group.title}
                    </h3>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted">
                      {group.description}
                    </p>
                  </div>
                  <Badge tone="outline">{group.items.length}</Badge>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
                  {group.items.map((roadmap) => (
                    <CatalogCard key={roadmap.id} roadmap={roadmap} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </details>
      ) : null}

      <p className="max-w-3xl text-xs leading-relaxed text-muted">
        Content is a personal-use copy of the roadmap.sh fork and stays behind the shared sazardev
        session. Guided stages and practice prompts are original to this app.
      </p>
    </div>
  );
}

function GuidedCard({ roadmap }: { roadmap: RoadmapCard }) {
  const Icon = roadmapIcon(roadmap.icon);
  const progress = percent(roadmap.completedCount, roadmap.topicCount);
  return (
    <Link
      to={`/roadmaps/${roadmap.slug}`}
      className="group flex flex-col gap-4 rounded-lg border border-line bg-raised p-4 shadow-card transition-[border-color,box-shadow] duration-base hover:border-line-strong sm:min-h-[15rem] sm:gap-5 sm:p-5 md:p-6 md:hover:-translate-y-0.5 md:hover:shadow-float"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-ink">
          <Icon size={22} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-lg font-semibold leading-snug tracking-tight">
              {roadmap.title}
            </h3>
            <Badge tone="solid">Guided</Badge>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{roadmap.tagline}</p>
        </div>
        <ProgressRing
          value={progress}
          size={54}
          stroke={4}
          label={`${progress}% of ${roadmap.title} completed`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/60 px-2.5">
          <Layers size={13} /> {roadmap.stageCount} stages
        </span>
        <span className="inline-flex min-h-8 items-center rounded-full bg-surface/60 px-2.5">
          {roadmap.topicCount} topics
        </span>
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/60 px-2.5">
          <Clock3 size={13} /> {roadmap.estimatedHours}h
        </span>
        <span className="capitalize">{roadmap.level}</span>
      </div>
      <div className="mt-auto space-y-2">
        <ProgressBar value={roadmap.completedCount} max={roadmap.topicCount} />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{roadmap.completedCount} practiced or mastered</span>
          <span className="inline-flex items-center gap-1 font-medium text-accent">
            Open <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ReferenceCard({ roadmap }: { roadmap: RoadmapCard }) {
  const Icon = roadmapIcon(roadmap.icon);
  const progress = percent(roadmap.completedCount, roadmap.topicCount);
  return (
    <Link
      to={`/roadmaps/${roadmap.slug}`}
      className="group flex items-start gap-3 rounded-lg border border-line bg-raised p-4 shadow-card transition-[border-color,box-shadow] duration-base hover:border-line-strong sm:min-h-[8.5rem] sm:gap-4 sm:p-5 md:p-6 md:hover:-translate-y-0.5 md:hover:shadow-float"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface text-muted transition-colors group-hover:bg-accent-soft group-hover:text-accent">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 text-base font-semibold tracking-tight">{roadmap.title}</h3>
          <Badge tone="outline">Reference</Badge>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{roadmap.tagline}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>{roadmap.topicCount} topics</span>
          <span>{roadmap.completedCount} done</span>
          <span className="font-medium text-accent">{progress}%</span>
        </div>
      </div>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors group-hover:border-accent/30 group-hover:bg-accent-soft group-hover:text-accent">
        <ArrowRight size={15} />
      </span>
    </Link>
  );
}

function CatalogCard({ roadmap }: { roadmap: RoadmapCard }) {
  return (
    <Link
      to={`/roadmaps/${roadmap.slug}`}
      className="group flex min-h-16 items-center gap-3 rounded-md border border-line/80 bg-surface/40 px-4 py-3 transition-[background-color,border-color] duration-fast hover:border-line-strong hover:bg-hover"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="truncate text-sm font-medium">{roadmap.title}</h3>
        <p className="line-clamp-1 text-xs leading-relaxed text-muted">
          {roadmap.sourceTopicCount} source topics · {roadmap.topicCount} previewed
        </p>
      </div>
      <ArrowRight
        size={15}
        className="shrink-0 text-muted transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </Link>
  );
}
