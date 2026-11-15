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
import { percent } from "~/lib/utils";
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Learning paths"
        title="Roadmaps"
        description="Curated paths, full reference libraries and every community roadmap in the fork, ordered by progression instead of alphabetically. Progress is private and survives content updates."
        actions={
          <LinkButton to="/coach?mode=plan" variant="secondary" icon={<Sparkles size={15} />}>
            Ask for a study plan
          </LinkButton>
        }
      />

      <form
        method="get"
        className="flex flex-col gap-3 rounded-md border border-line bg-surface p-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search 98 roadmaps by title or description..."
            className="h-10 w-full rounded-sm border border-line bg-canvas pl-9 pr-3 text-sm outline-none placeholder:text-muted focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-focus/40"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
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
                className={`inline-flex h-8 items-center rounded-full border px-3 text-xs transition-colors duration-fast ${
                  status === value
                    ? "border-ink bg-ink text-canvas"
                    : "border-line text-muted hover:bg-hover hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-sm bg-ink px-3 text-xs font-medium text-canvas"
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
          icon={<Search size={22} />}
        />
      ) : null}

      {guided.length > 0 ? (
        <section className="space-y-4" aria-labelledby="guided-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="guided-heading" className="text-lg font-semibold tracking-tight">
                Guided paths
              </h2>
              <p className="text-sm text-muted">
                Curated stages, practice prompts and a deliberate order.
              </p>
            </div>
            <Badge tone="outline">{guided.length} paths</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {guided.map((roadmap) => (
              <GuidedCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        </section>
      ) : null}

      {reference.length > 0 ? (
        <section className="space-y-4" aria-labelledby="reference-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="reference-heading" className="text-lg font-semibold tracking-tight">
                Reference libraries
              </h2>
              <p className="text-sm text-muted">
                Complete topic sets without a curated order. Good for search and coaching.
              </p>
            </div>
            <Badge tone="outline">{reference.length} libraries</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {reference.map((roadmap) => (
              <ReferenceCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        </section>
      ) : null}

      {catalog.length > 0 ? (
        <details
          className="group rounded-md border border-line"
          open={Boolean(q) || status === "catalog"}
        >
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Content library</h2>
              <p className="text-sm text-muted">
                {catalog.length} community roadmaps with a 16-topic preview each, ordered from
                beginner to advanced.
              </p>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-muted group-open:hidden">
              Show
            </span>
            <span className="hidden rounded-full border border-line px-3 py-1 text-xs text-muted group-open:inline">
              Hide
            </span>
          </summary>
          <div className="space-y-6 border-t border-line p-4">
            {catalogGroups.map((group) => (
              <section
                key={group.level}
                className="space-y-3"
                aria-labelledby={`catalog-${group.level}`}
              >
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 id={`catalog-${group.level}`} className="text-sm font-semibold">
                      {group.title}
                    </h3>
                    <p className="max-w-2xl text-xs leading-relaxed text-muted">
                      {group.description}
                    </p>
                  </div>
                  <Badge tone="outline">{group.items.length}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((roadmap) => (
                    <CatalogCard key={roadmap.id} roadmap={roadmap} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </details>
      ) : null}

      <p className="text-xs leading-relaxed text-muted">
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
      className="group flex flex-col gap-5 rounded-md border border-line bg-canvas p-5 transition-colors duration-fast hover:border-line-strong hover:bg-surface"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-line bg-surface">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">{roadmap.title}</h3>
            <Badge tone="solid">Guided</Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted">{roadmap.tagline}</p>
        </div>
        <ProgressRing value={progress} size={44} stroke={3} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Layers size={12} /> {roadmap.stageCount} stages
        </span>
        <span>{roadmap.topicCount} topics</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={12} /> {roadmap.estimatedHours}h
        </span>
        <span className="capitalize">{roadmap.level}</span>
      </div>
      <div className="space-y-2">
        <ProgressBar value={roadmap.completedCount} max={roadmap.topicCount} />
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>{roadmap.completedCount} practiced or mastered</span>
          <span className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            Open <ArrowRight size={11} />
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
      className="group flex items-start gap-4 rounded-md border border-line bg-canvas p-5 transition-colors duration-fast hover:border-line-strong hover:bg-surface"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-line bg-surface">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold tracking-tight">{roadmap.title}</h3>
          <Badge tone="outline">Reference</Badge>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{roadmap.tagline}</p>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{roadmap.topicCount} topics</span>
          <span>{roadmap.completedCount} done</span>
          <span>{progress}%</span>
        </div>
      </div>
      <ArrowRight size={15} className="mt-1 shrink-0 text-muted" />
    </Link>
  );
}

function CatalogCard({ roadmap }: { roadmap: RoadmapCard }) {
  return (
    <Link
      to={`/roadmaps/${roadmap.slug}`}
      className="group flex flex-col gap-2 rounded-sm border border-line px-4 py-3 transition-colors duration-fast hover:bg-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium">{roadmap.title}</h3>
        <ArrowRight
          size={13}
          className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
        {roadmap.sourceTopicCount} source topics · {roadmap.topicCount} previewed
      </p>
    </Link>
  );
}
