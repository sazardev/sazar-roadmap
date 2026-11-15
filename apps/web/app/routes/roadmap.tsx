import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { PathMap } from "~/components/roadmap/path-map";
import { roadmapIcon } from "~/components/shell/icons";
import { LinkButton } from "~/components/ui/button";
import { ProgressRing } from "~/components/ui/progress";
import { Card, CardBody, CardHeader, PageHeader } from "~/components/ui/surfaces";
import { getRoadmapDetail } from "~/features/roadmaps/roadmaps.server";
import { requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { pageMeta } from "~/lib/meta";
import { percent } from "~/lib/utils";
import type { Route } from "./+types/roadmap";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.roadmap.title ?? "Roadmap");

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
        <div className="min-w-0 space-y-6">
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

          <PathMap
            stages={stages}
            roadmapSlug={roadmap.slug}
            nextTopicId={nextTopic?.id ?? undefined}
          />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
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
