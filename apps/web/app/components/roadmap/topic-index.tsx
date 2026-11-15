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

export function TopicIndex({
  topics,
  roadmapSlug,
  title,
  description,
  badge,
  compact = false,
}: {
  topics: RoadmapTopic[];
  roadmapSlug: string;
  title: string;
  description: string;
  badge?: string;
  compact?: boolean;
}) {
  const headingId = `topic-index-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={headingId} className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        </div>
        {badge ? <Badge tone="outline">{badge}</Badge> : null}
      </div>

      {compact ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
              className="group flex items-center gap-2 rounded-sm border border-line bg-canvas px-3 py-2 text-xs transition-colors duration-fast hover:border-line-strong hover:bg-surface"
            >
              <span
                aria-hidden="true"
                className={cn("size-2.5 shrink-0 rounded-full border", statusDot[topic.status])}
              />
              <span className="min-w-0 flex-1 truncate">{topic.title}</span>
              <ArrowRight
                size={11}
                className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      ) : (
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
      )}
    </section>
  );
}
