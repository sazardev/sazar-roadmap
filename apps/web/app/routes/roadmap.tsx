import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { roadmapIcon } from "~/components/shell/icons";
import { TopicStatusIcon } from "~/components/status";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import { ProgressBar, ProgressRing } from "~/components/ui/progress";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import {
  getRoadmapDetail,
  type RoadmapStage,
  type RoadmapTopic,
} from "~/features/roadmaps/roadmaps.server";
import { requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { percent } from "~/lib/utils";
import type { Route } from "./+types/roadmap";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.roadmap.title ?? "Roadmap");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const detail = await getRoadmapDetail(getEnv(context), user.id, params.slug);
  if (!detail) throw new Response("Roadmap not found", { status: 404 });
  return detail;
}

export default function RoadmapDetailPage({ loaderData }: Route.ComponentProps) {
  const { roadmap, stages, nextTopic, completedCount, totalTopics } = loaderData;
  const Icon = roadmapIcon(roadmap.icon);
  const progress = percent(completedCount, totalTopics);
  const activeStage = stages.find((stage) =>
    stage.topics.some((topic) => topic.id === nextTopic?.id),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link to="/roadmaps" className="inline-flex items-center gap-1 underline">
          <ArrowLeft size={12} /> All roadmaps
        </Link>
        <span>/</span>
        <span>{roadmap.title}</span>
      </div>

      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Icon size={12} strokeWidth={2} />
            {roadmap.status === "guided"
              ? "Guided path"
              : roadmap.status === "reference"
                ? "Reference library"
                : "Preview library"}
          </span>
        }
        title={roadmap.title}
        description={roadmap.description}
        actions={
          <>
            {nextTopic ? (
              <LinkButton
                to={`/roadmaps/${roadmap.slug}/${nextTopic.slug}`}
                icon={<ArrowRight size={15} />}
              >
                {nextTopic.status === "learning" ? "Continue" : "Start"} {nextTopic.title}
              </LinkButton>
            ) : null}
            {nextTopic ? (
              <LinkButton
                to={`/coach?topic=${nextTopic.id}`}
                variant="secondary"
                icon={<Sparkles size={15} />}
              >
                Ask the coach
              </LinkButton>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card>
            <CardBody className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex items-center gap-4">
                <ProgressRing value={progress} size={72} stroke={4} />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{progress}% complete</p>
                  <p className="text-xs text-muted">
                    {completedCount} of {totalTopics} topics practiced or mastered
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Meta label="Stages" value={roadmap.stageCount} icon={<Layers size={13} />} />
                <Meta label="Topics" value={roadmap.topicCount} icon={<BookOpen size={13} />} />
                <Meta
                  label="Estimate"
                  value={`${roadmap.estimatedHours}h`}
                  icon={<Clock3 size={13} />}
                />
                <Meta label="Level" value={roadmap.level} />
              </div>
            </CardBody>
          </Card>

          {roadmap.contentStatus === "preview" ? (
            <div className="rounded-md border border-warning/30 bg-warning/5 px-5 py-4 text-sm">
              <p className="font-medium">Preview edition</p>
              <p className="mt-1 leading-relaxed text-muted">
                This path exposes 16 of {roadmap.sourceTopicCount} source topics. The full content
                is in the repository; add a curriculum in{" "}
                <code className="font-mono text-xs">app/content/curricula</code> to promote it to a
                guided or reference path.
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            {stages.map((stage, index) => (
              <StageSection
                key={stage.id}
                stage={stage}
                index={index}
                roadmapSlug={roadmap.slug}
                defaultOpen={stage.id === activeStage?.id || (index === 0 && !activeStage)}
                currentTopicId={nextTopic?.id ?? undefined}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader title="Next up" description="The shortest useful step from here." />
            <CardBody>
              {nextTopic ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                      {nextTopic.stageId.split("::")[1]?.replace(/-/g, " ")}
                    </p>
                    <Link
                      to={`/roadmaps/${roadmap.slug}/${nextTopic.slug}`}
                      className="block text-sm font-medium underline decoration-line underline-offset-4"
                    >
                      {nextTopic.title}
                    </Link>
                    <p className="text-xs leading-relaxed text-muted">{nextTopic.summary}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={11} /> {nextTopic.estimatedMinutes} min
                    </span>
                    <span>{nextTopic.resourceCount} resources</span>
                  </div>
                  <LinkButton
                    to={`/roadmaps/${roadmap.slug}/${nextTopic.slug}`}
                    size="sm"
                    icon={<ArrowRight size={13} />}
                  >
                    Open topic
                  </LinkButton>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Everything in this path is already practiced or mastered. Review it or pick
                  another path.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="How to use this path" />
            <CardBody className="space-y-3 text-xs leading-relaxed text-muted">
              <p>
                Read the topic, build the practice artifact, then mark it practiced. Mastery is a
                separate, slower signal.
              </p>
              <p>
                Use the coach for explanations and quizzes, and the flashcards for retrieval. Log
                the minutes; the weekly goal follows the evidence.
              </p>
              <Link to="/settings" className="inline-block underline">
                Study preferences
              </Link>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="flex items-center gap-1.5 text-sm font-medium capitalize">
        {icon}
        {value}
      </p>
    </div>
  );
}

function StageSection({
  stage,
  index,
  roadmapSlug,
  defaultOpen,
  currentTopicId,
}: {
  stage: RoadmapStage;
  index: number;
  roadmapSlug: string;
  defaultOpen: boolean;
  currentTopicId?: string | undefined;
}) {
  const completed = stage.topics.filter(
    (topic) => topic.status === "practiced" || topic.status === "mastered",
  ).length;
  const progress = percent(completed, stage.topics.length);
  return (
    <details open={defaultOpen} className="group rounded-md border border-line bg-canvas">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[10px] text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{stage.title}</h2>
            <Badge tone={progress === 100 ? "success" : "outline"}>
              {completed}/{stage.topics.length}
            </Badge>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{stage.description}</p>
        </div>
        <div className="hidden w-28 sm:block">
          <ProgressBar value={completed} max={stage.topics.length} />
        </div>
        <span className="font-mono text-[10px] text-muted">{stage.estimatedHours}h</span>
        <ArrowRight
          size={14}
          className="shrink-0 text-muted transition-transform duration-fast group-open:rotate-90"
        />
      </summary>
      <div className="border-t border-line">
        {stage.topics.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No topics in this stage"
              description="Add topics in the curriculum seed."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {stage.topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                roadmapSlug={roadmapSlug}
                current={topic.id === currentTopicId}
              />
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

function TopicRow({
  topic,
  roadmapSlug,
  current,
}: {
  topic: RoadmapTopic;
  roadmapSlug: string;
  current: boolean;
}) {
  return (
    <li>
      <Link
        to={`/roadmaps/${roadmapSlug}/${topic.slug}`}
        className={`flex items-start gap-3 px-5 py-3 transition-colors duration-fast hover:bg-hover ${
          current ? "bg-surface" : ""
        }`}
      >
        <span className="mt-0.5 shrink-0">
          <TopicStatusIcon status={topic.status} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{topic.title}</span>
            {current ? <Badge tone="solid">Next</Badge> : null}
            <span className="text-[10px] uppercase tracking-wide text-muted">
              {topic.difficulty}
            </span>
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">
            {topic.summary}
          </span>
          <span className="mt-1 flex items-center gap-3 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={10} /> {topic.estimatedMinutes}m
            </span>
            <span>{topic.resourceCount} resources</span>
            {topic.minutesSpent > 0 ? <span>{topic.minutesSpent}m logged</span> : null}
          </span>
        </span>
        <ArrowRight size={13} className="mt-1 shrink-0 text-muted" />
      </Link>
    </li>
  );
}
