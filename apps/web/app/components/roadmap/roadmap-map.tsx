import { ArrowRight, Map as MapIcon } from "lucide-react";
import { Link } from "react-router";
import { TopicStatusIcon } from "~/components/status";
import { ProgressBar } from "~/components/ui/progress";
import type { TopicStatus } from "~/features/progress/progress.server";
import type { RoadmapStage, RoadmapTopic } from "~/features/roadmaps/roadmaps.server";
import { cn } from "~/lib/utils";

const legend: Array<{ label: string; status: TopicStatus }> = [
  { label: "Not started", status: "not_started" },
  { label: "In practice", status: "learning" },
  { label: "Practice passed", status: "practiced" },
];

function StageColumn({
  stage,
  index,
  roadmapSlug,
  nextTopicId,
}: {
  stage: RoadmapStage;
  index: number;
  roadmapSlug: string;
  nextTopicId?: string | undefined;
}) {
  const completed = stage.topics.filter(
    (topic) => topic.status === "practiced" || topic.status === "mastered",
  ).length;
  return (
    <section className="min-w-0 rounded-lg border border-line/80 bg-surface/35 p-3.5 md:w-[280px] md:shrink-0">
      <header className="mb-3 flex items-start gap-3 px-0.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-raised font-mono text-[11px] text-muted shadow-sm ring-1 ring-line">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug" title={stage.description}>
            {stage.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {completed}/{stage.topics.length} complete
          </p>
        </div>
      </header>
      <ProgressBar value={completed} max={stage.topics.length || 1} className="mb-3" />
      <ol className="space-y-1.5">
        {stage.topics.map((topic) => (
          <li key={topic.id}>
            <TopicNode topic={topic} roadmapSlug={roadmapSlug} next={topic.id === nextTopicId} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function TopicNode({
  topic,
  roadmapSlug,
  next,
}: {
  topic: RoadmapTopic;
  roadmapSlug: string;
  next: boolean;
}) {
  const completed = topic.status === "practiced" || topic.status === "mastered";
  return (
    <Link
      to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
      aria-current={next ? "step" : undefined}
      title={topic.summary}
      className={cn(
        "group flex min-h-14 items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-[border-color,background-color,box-shadow,transform] duration-fast active:scale-[0.995]",
        next
          ? "border-accent bg-accent-soft shadow-sm ring-2 ring-accent/15"
          : completed
            ? "border-line bg-surface/60 hover:border-line-strong hover:bg-hover"
            : "border-line bg-raised hover:border-line-strong hover:bg-hover",
      )}
    >
      <TopicStatusIcon status={topic.status} className="size-4 shrink-0" />
      <span className="min-w-0 flex-1">
        {next ? (
          <span className="mb-1 inline-flex rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-ink">
            Next
          </span>
        ) : null}
        <span className="line-clamp-2 font-medium leading-snug">{topic.title}</span>
      </span>
      <ArrowRight
        size={14}
        className="shrink-0 text-muted transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </Link>
  );
}

export function RoadmapMap({
  stages,
  roadmapSlug,
  nextTopicId,
}: {
  stages: RoadmapStage[];
  roadmapSlug: string;
  nextTopicId?: string | undefined;
}) {
  const visibleStages = stages.filter((stage) => stage.slug !== "extended-library");

  return (
    <section className="space-y-4" aria-labelledby="path-map-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <MapIcon size={18} strokeWidth={1.9} />
            </span>
            <h2 id="path-map-heading" className="text-xl font-semibold tracking-tight">
              Path map
            </h2>
          </div>
          <p className="text-sm text-muted">
            Tap a topic to open it.{" "}
            <span className="hidden md:inline">
              Scroll sideways for all {visibleStages.length} stages.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {legend.map((item) => (
            <span
              key={item.label}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-raised px-3 text-xs text-muted shadow-sm"
            >
              <TopicStatusIcon status={item.status} className="size-3.5" />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <section
        className="stage-scroller -mx-4 min-w-0 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0"
        aria-label="Roadmap stages"
      >
        <div className="grid gap-4 md:flex md:w-max md:items-start md:gap-3">
          {visibleStages.map((stage, index) => (
            <div key={stage.id} className="flex min-w-0 items-start md:shrink-0">
              <StageColumn
                stage={stage}
                index={index}
                roadmapSlug={roadmapSlug}
                nextTopicId={nextTopicId}
              />
              {index < visibleStages.length - 1 ? (
                <span aria-hidden="true" className="mt-12 hidden shrink-0 items-center md:flex">
                  <span className="h-px w-4 bg-line-strong" />
                  <span className="flex size-6 items-center justify-center rounded-full border border-line bg-raised text-muted shadow-sm">
                    <ArrowRight size={11} />
                  </span>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
