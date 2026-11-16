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
  mastered: "border-accent bg-accent",
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
        <div className="space-y-1">
          <h2 id={headingId} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        </div>
        {badge ? <Badge tone="outline">{badge}</Badge> : null}
      </div>

      {compact ? (
        <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
              className="group flex min-h-12 items-center gap-2.5 rounded-md border border-line bg-raised px-3.5 py-2.5 text-sm transition-[border-color,background-color] duration-fast hover:border-line-strong hover:bg-hover"
            >
              <span
                aria-hidden="true"
                className={cn("size-2.5 shrink-0 rounded-full border", statusDot[topic.status])}
              />
              <span className="min-w-0 flex-1 truncate">{topic.title}</span>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
              className="group flex flex-col gap-3 rounded-lg border border-line bg-raised p-5 shadow-card transition-[border-color,box-shadow,transform] duration-base hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float active:translate-y-0"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full border",
                    statusDot[topic.status],
                  )}
                />
                <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug">
                  {topic.title}
                </h3>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors group-hover:border-accent/30 group-hover:bg-accent-soft group-hover:text-accent">
                  <ArrowRight size={14} />
                </span>
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted">{topic.summary}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-1 text-xs text-muted">
                <TopicStatusBadge status={topic.status} />
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={13} /> {topic.estimatedMinutes} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={13} /> {topic.resourceCount} resources
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
