import { ArrowRight, BookOpen, Check, Clock3, Layers, Route } from "lucide-react";
import { Link } from "react-router";
import { TopicStatusBadge } from "~/components/status";
import { Badge } from "~/components/ui/badge";
import { ProgressBar } from "~/components/ui/progress";
import type { TopicStatus } from "~/features/progress/progress.server";
import type { RoadmapStage, RoadmapTopic } from "~/features/roadmaps/roadmaps.server";
import { cn, percent } from "~/lib/utils";

const statusNode: Record<TopicStatus, string> = {
  not_started: "border-line-strong bg-canvas",
  learning: "border-warning bg-warning",
  practiced: "border-success bg-success",
  mastered: "border-ink bg-ink",
};

const statusLegend: Array<{ label: string; className: string }> = [
  { label: "Not started", className: "border-line-strong bg-canvas" },
  { label: "Learning", className: "border-warning bg-warning" },
  { label: "Practiced", className: "border-success bg-success" },
  { label: "Mastered", className: "border-ink bg-ink" },
];

function stageProgress(stage: RoadmapStage): { completed: number; total: number; ratio: number } {
  const total = stage.topics.length;
  const completed = stage.topics.filter(
    (topic) => topic.status === "practiced" || topic.status === "mastered",
  ).length;
  return { completed, total, ratio: percent(completed, total) };
}

function activeStageId(
  stages: RoadmapStage[],
  nextTopicId: string | undefined,
): string | undefined {
  if (!nextTopicId) return undefined;
  return stages.find((stage) => stage.topics.some((topic) => topic.id === nextTopicId))?.id;
}

export function PathMap({
  stages,
  roadmapSlug,
  nextTopicId,
}: {
  stages: RoadmapStage[];
  roadmapSlug: string;
  nextTopicId?: string | undefined;
}) {
  const activeId = activeStageId(stages, nextTopicId);
  return (
    <div className="min-w-0 space-y-6">
      <section
        className="rounded-md border border-line bg-surface"
        aria-labelledby="path-map-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <Route size={15} strokeWidth={1.8} className="text-muted" />
            <h2 id="path-map-heading" className="text-sm font-semibold">
              Path map
            </h2>
            <span className="text-xs text-muted">Follow the line, stage by stage.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted">
            {statusLegend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <span
                  className={cn("size-2 rounded-full border", item.className)}
                  aria-hidden="true"
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-full overflow-x-auto p-3">
          <ol className="flex min-w-max items-stretch">
            {stages.map((stage, index) => {
              const progress = stageProgress(stage);
              const isActive = stage.id === activeId;
              const isReference = stage.slug === "extended-library" || stage.topics.length > 24;
              return (
                <li key={stage.id} className="flex items-center">
                  <a
                    href={`#stage-${stage.slug}`}
                    className={cn(
                      "group w-56 shrink-0 rounded-sm border px-3 py-2.5 transition-colors duration-fast",
                      isActive
                        ? "border-ink bg-canvas"
                        : "border-line bg-canvas/70 hover:border-line-strong hover:bg-canvas",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                          isActive ? "border-ink bg-ink text-canvas" : "border-line text-muted",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">
                        {stage.title}
                      </span>
                      {isReference ? <BookOpen size={11} className="shrink-0 text-muted" /> : null}
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={progress.completed} max={progress.total || 1} />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] text-muted">
                      <span>
                        {isReference
                          ? `${progress.total} topics`
                          : `${progress.completed}/${progress.total} done`}
                      </span>
                      <span>{stage.estimatedHours}h</span>
                    </div>
                  </a>
                  {index < stages.length - 1 ? (
                    <span aria-hidden="true" className="mx-1 flex w-6 items-center">
                      <span className="h-px flex-1 bg-line-strong" />
                      <ArrowRight size={11} className="text-muted" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <div className="space-y-8">
        {stages.map((stage, index) => {
          const progress = stageProgress(stage);
          const isActive = stage.id === activeId;
          const isReference = stage.slug === "extended-library" || stage.topics.length > 24;
          return (
            <section
              key={stage.id}
              id={`stage-${stage.slug}`}
              className="scroll-mt-24 space-y-3"
              aria-labelledby={`stage-${stage.slug}-heading`}
            >
              <div className="flex flex-wrap items-start gap-4 border-b border-line pb-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                    isActive ? "border-ink bg-ink text-canvas" : "border-line text-muted",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id={`stage-${stage.slug}-heading`}
                      className="text-lg font-semibold tracking-tight"
                    >
                      {stage.title}
                    </h2>
                    {isActive ? <Badge tone="solid">You are here</Badge> : null}
                    {index === 0 && progress.completed === 0 ? (
                      <Badge tone="outline">Start here</Badge>
                    ) : null}
                    {isReference ? (
                      <Badge tone="outline">
                        <Layers size={10} /> Reference shelf
                      </Badge>
                    ) : null}
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted">
                    {stage.description}
                  </p>
                </div>
                <div className="w-36 shrink-0 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>
                      {progress.completed}/{progress.total}
                    </span>
                    <span>{progress.ratio}%</span>
                  </div>
                  <ProgressBar value={progress.completed} max={progress.total || 1} />
                </div>
              </div>

              {isReference ? (
                <details className="group rounded-md border border-line bg-canvas">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
                    <span className="font-medium">
                      Browse {stage.topics.length} reference topics
                    </span>
                    <span className="text-xs text-muted group-open:hidden">Open shelf</span>
                    <span className="hidden text-xs text-muted group-open:inline">Close shelf</span>
                  </summary>
                  <div className="grid gap-2 border-t border-line p-3 sm:grid-cols-2">
                    {stage.topics.map((topic) => (
                      <ReferenceTopic key={topic.id} topic={topic} roadmapSlug={roadmapSlug} />
                    ))}
                  </div>
                </details>
              ) : stage.topics.length === 0 ? (
                <p className="text-sm text-muted">No topics in this stage yet.</p>
              ) : (
                <ol className="space-y-0">
                  {stage.topics.map((topic) => (
                    <TopicNode
                      key={topic.id}
                      topic={topic}
                      roadmapSlug={roadmapSlug}
                      next={topic.id === nextTopicId}
                    />
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
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
    <li className="relative border-l border-line pb-3 pl-6 last:border-l-transparent last:pb-0">
      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[7px] top-4 size-3.5 rounded-full border-2 border-canvas",
          statusNode[topic.status],
          next ? "ring-2 ring-focus ring-offset-2 ring-offset-canvas" : "",
        )}
      />
      <Link
        to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
        className={cn(
          "group flex items-start gap-3 rounded-md border px-3 py-3 transition-colors duration-fast",
          next
            ? "border-ink bg-surface"
            : completed
              ? "border-line bg-surface/60 hover:bg-hover"
              : "border-line bg-canvas hover:bg-surface",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{topic.title}</span>
            {next ? <Badge tone="solid">Next</Badge> : null}
            <span className="text-[10px] uppercase tracking-wide text-muted">
              {topic.difficulty}
            </span>
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">
            {topic.summary}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={10} /> {topic.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen size={10} /> {topic.resourceCount} resources
            </span>
            {topic.minutesSpent > 0 ? <span>{topic.minutesSpent} min logged</span> : null}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2">
          <TopicStatusBadge status={topic.status} />
          <span className="inline-flex items-center gap-1 text-[10px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
            Open <ArrowRight size={10} />
          </span>
        </span>
      </Link>
    </li>
  );
}

function ReferenceTopic({ topic, roadmapSlug }: { topic: RoadmapTopic; roadmapSlug: string }) {
  return (
    <Link
      to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
      className="flex items-center gap-2 rounded-sm border border-line px-2.5 py-2 text-xs transition-colors duration-fast hover:bg-hover"
    >
      <span
        aria-hidden="true"
        className={cn("size-2 shrink-0 rounded-full border", statusNode[topic.status])}
      />
      <span className="min-w-0 flex-1 truncate">{topic.title}</span>
      {topic.status === "practiced" || topic.status === "mastered" ? (
        <Check size={11} className="shrink-0 text-success" />
      ) : null}
    </Link>
  );
}
