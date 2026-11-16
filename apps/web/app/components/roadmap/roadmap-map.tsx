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
    <section className="w-full min-w-0 lg:w-[236px] lg:shrink-0">
      <header className="mb-2 flex items-start gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[10px] text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-semibold" title={stage.description}>
            {stage.title}
          </h3>
          <p className="text-[10px] text-muted">
            {completed}/{stage.topics.length}
          </p>
        </div>
      </header>
      <ProgressBar value={completed} max={stage.topics.length || 1} className="mb-2.5" />
      <ol className="space-y-1.5 border-l border-line pl-3">
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
        "group flex items-center gap-2 rounded-sm border px-2 py-1.5 text-xs transition-colors duration-fast",
        next
          ? "border-ink bg-canvas ring-1 ring-ink"
          : completed
            ? "border-line bg-surface hover:bg-hover"
            : "border-line bg-canvas hover:bg-surface",
      )}
    >
      <TopicStatusIcon status={topic.status} className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 font-medium">{topic.title}</span>
      </span>
      {next ? (
        <span className="shrink-0 rounded-full bg-ink px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-canvas">
          Next
        </span>
      ) : null}
      <ArrowRight
        size={10}
        className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
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
    <section className="space-y-3" aria-labelledby="path-map-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapIcon size={15} className="text-muted" />
            <h2 id="path-map-heading" className="text-sm font-semibold">
              Path map
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Click a topic to open it.{" "}
            <span className="hidden lg:inline">
              Scroll sideways for all {visibleStages.length} stages.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <TopicStatusIcon status={item.status} className="size-3" />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <section
        className="scrollbar-thin min-w-0 lg:overflow-x-auto lg:pb-3"
        aria-label="Roadmap stages"
      >
        <div className="grid gap-5 lg:flex lg:w-max lg:items-start">
          {visibleStages.map((stage, index) => (
            <div key={stage.id} className="flex min-w-0 items-start gap-1 lg:shrink-0">
              <StageColumn
                stage={stage}
                index={index}
                roadmapSlug={roadmapSlug}
                nextTopicId={nextTopicId}
              />
              {index < visibleStages.length - 1 ? (
                <span aria-hidden="true" className="mt-7 hidden w-6 shrink-0 items-center lg:flex">
                  <span className="h-px flex-1 bg-line-strong" />
                  <ArrowRight size={10} className="text-muted" />
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
