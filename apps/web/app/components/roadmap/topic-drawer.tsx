"use client";

import {
  ArrowRight,
  BookOpen,
  Clock3,
  ExternalLink,
  GraduationCap,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, Link, useNavigate, useNavigation } from "react-router";
import { TopicStatusBadge } from "~/components/status";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import type { TopicDetail } from "~/features/roadmaps/roadmaps.server";
import { cn } from "~/lib/utils";

const statuses = [
  { value: "learning", label: "Learning" },
  { value: "practiced", label: "Practiced" },
  { value: "mastered", label: "Mastered" },
] as const;

export function TopicDrawer({
  detail,
  closeHref,
  notice,
}: {
  detail: TopicDetail;
  closeHref: string;
  notice: string | null;
}) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const busy = navigation.state !== "idle";
  const closeRef = useRef<HTMLButtonElement>(null);
  const { topic, progress, resources, cards } = detail;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") navigate(closeHref);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [closeHref, navigate]);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <Link
        to={closeHref}
        aria-label="Close topic details"
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-drawer-heading"
        className="relative z-10 flex h-dvh w-full max-w-[540px] flex-col overflow-y-auto border-l border-line bg-canvas shadow-float"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-canvas/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <Badge tone="outline">{topic.stageTitle}</Badge>
            <TopicStatusBadge status={progress.status} />
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => navigate(closeHref)}
            aria-label="Close topic details"
            className="inline-flex size-8 items-center justify-center rounded-sm text-muted hover:bg-hover hover:text-ink"
          >
            <X size={17} />
          </button>
        </header>

        <div className="space-y-6 px-5 py-5">
          {notice ? (
            <div className="rounded-sm border border-success/30 bg-success/5 px-3 py-2 text-xs">
              {notice}
            </div>
          ) : null}

          <div className="space-y-2">
            <h2
              id="topic-drawer-heading"
              className="text-2xl font-semibold leading-tight tracking-tight"
            >
              {topic.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{topic.summary}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={11} /> {topic.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1 capitalize">{topic.difficulty}</span>
              {cards.total > 0 ? (
                <Link
                  to={`/flashcards?topic=${topic.id}`}
                  className="inline-flex items-center gap-1 underline"
                >
                  <GraduationCap size={11} /> {cards.total} {cards.total === 1 ? "card" : "cards"}
                </Link>
              ) : null}
            </div>
          </div>

          <Form method="post" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="intent" value="status" />
            <input type="hidden" name="topicId" value={topic.id} />
            <span className="mr-1 text-[11px] text-muted">Mark as</span>
            {statuses.map((status) => (
              <button
                key={status.value}
                type="submit"
                name="status"
                value={status.value}
                disabled={busy}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors duration-fast disabled:opacity-50",
                  progress.status === status.value
                    ? "border-ink bg-ink text-canvas"
                    : "border-line text-muted hover:bg-hover hover:text-ink",
                )}
              >
                {progress.status === status.value ? "✓" : ""}
                {status.label}
              </button>
            ))}
          </Form>

          <div className="flex flex-wrap items-center gap-2">
            <LinkButton
              to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
              icon={<ArrowRight size={14} />}
            >
              Open full topic
            </LinkButton>
            <LinkButton
              to={`/coach?topic=${topic.id}`}
              variant="secondary"
              icon={<Sparkles size={14} />}
            >
              Ask the coach
            </LinkButton>
          </div>

          <section className="space-y-2 border-t border-line pt-4">
            <h3 className="text-sm font-semibold">Why it matters</h3>
            <p className="text-sm leading-relaxed text-muted">{topic.whyItMatters}</p>
          </section>

          <section className="space-y-3 border-t border-line pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Resources</h3>
              <span className="text-[10px] text-muted">{resources.length} total</span>
            </div>
            {resources.length === 0 ? (
              <p className="text-xs text-muted">
                No resources yet. Ask the coach for a reading list.
              </p>
            ) : (
              <ul className="space-y-2">
                {resources.slice(0, 5).map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-2 rounded-sm border border-line px-3 py-2 text-xs transition-colors duration-fast hover:bg-hover"
                    >
                      <BookOpen size={12} className="shrink-0 text-muted" />
                      <span className="min-w-0 flex-1 truncate">{resource.title}</span>
                      <span className="shrink-0 text-[9px] text-muted">{resource.kind}</span>
                      <ExternalLink size={10} className="shrink-0 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
              className="inline-flex items-center gap-1 text-xs text-muted underline"
            >
              All resources, practice and notes
              <ArrowRight size={10} />
            </Link>
          </section>

          <p className="border-t border-line pt-4 text-[10px] leading-relaxed text-muted">
            This drawer is a quick check-in. The full topic page holds the practice prompt, key
            concepts, notes and every resource.
          </p>
        </div>
      </aside>
    </div>
  );
}
