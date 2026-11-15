import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { Link } from "react-router";
import { TopicStatusBadge } from "~/components/status";
import { Badge } from "~/components/ui/badge";
import type { TopicStatus } from "~/features/progress/progress.server";
import type { RoadmapTopic } from "~/features/roadmaps/roadmaps.server";
import { cn } from "~/lib/utils";

const statusDot: Record<TopicStatus, string> = {
  not_started: "border-line-strong bg-canvas",
  learning: "border-warning bg-warning",
  practiced: "border-success bg-success",
  mastered: "border-ink bg-ink",
};

/**
 * Catalog roadmaps only have a representative sample of their source content. They must not
 * pretend to be a guided sequence: no "next", no "start here" and no ordered path map.
 */
export function PreviewIndex({
  topics,
  roadmapSlug,
  sourceTopicCount,
}: {
  topics: RoadmapTopic[];
  roadmapSlug: string;
  sourceTopicCount: number;
}) {
  return (
    <section className="space-y-4" aria-labelledby="sample-topics-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="sample-topics-heading" className="text-lg font-semibold tracking-tight">
            Sample topics
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            An alphabetical sample of {topics.length} of the {sourceTopicCount} source topics. This
            is a reference preview, not a recommended order. Ask the coach to turn your goal into a
            route through them.
          </p>
        </div>
        <Badge tone="outline">
          {topics.length} of {sourceTopicCount}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
            className="group flex flex-col gap-2 rounded-md border border-line bg-canvas p-4 transition-colors duration-fast hover:border-line-strong hover:bg-surface"
          >
            <div className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1.5 size-2.5 shrink-0 rounded-full border",
                  statusDot[topic.status],
                )}
              />
              <h3 className="min-w-0 flex-1 text-sm font-semibold">{topic.title}</h3>
              <ArrowRight
                size={13}
                className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <p className="line-clamp-3 text-xs leading-relaxed text-muted">{topic.summary}</p>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-1 text-[10px] text-muted">
              <TopicStatusBadge status={topic.status} />
              <span className="inline-flex items-center gap-1">
                <Clock3 size={10} /> {topic.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen size={10} /> {topic.resourceCount} resources
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
