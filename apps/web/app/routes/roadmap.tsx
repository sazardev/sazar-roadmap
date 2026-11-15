import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { PathMap } from "~/components/roadmap/path-map";
import { PreviewIndex } from "~/components/roadmap/preview-index";
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
  const isPreview = roadmap.contentStatus === "preview";
  const sampleTopics = stages.flatMap((stage) => stage.topics);
  const coachHref = nextTopic ? `/coach?topic=${nextTopic.id}` : "/coach";
  const searchHref = `/search?q=${encodeURIComponent(roadmap.title)}`;
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
            {!isPreview && nextTopic ? (
              <LinkButton
                to={`/roadmaps/${roadmap.slug}/${nextTopic.slug}`}
                icon={<ArrowRight size={15} />}
              >
                {nextTopic.status === "learning" ? "Continue" : "Start"} {nextTopic.title}
              </LinkButton>
            ) : null}
            <LinkButton
              to={coachHref}
              variant={isPreview ? "primary" : "secondary"}
              icon={<Sparkles size={15} />}
            >
              Ask the coach
            </LinkButton>
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
                  <p className="text-sm font-medium">
                    {isPreview ? `${progress}% of the sample explored` : `${progress}% complete`}
                  </p>
                  <p className="text-xs text-muted">
                    {isPreview
                      ? `${completedCount} of ${totalTopics} sample topics explored`
                      : `${completedCount} of ${totalTopics} topics practiced or mastered`}
                  </p>
                </div>
              </div>
              {isPreview ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Meta label="Sample" value={roadmap.topicCount} icon={<BookOpen size={13} />} />
                  <Meta
                    label="Source"
                    value={roadmap.sourceTopicCount}
                    icon={<Layers size={13} />}
                  />
                  <Meta label="Level" value={roadmap.level} />
                  <Meta label="Type" value="Preview" />
                </div>
              ) : (
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
              )}
            </CardBody>
          </Card>

          {isPreview ? (
            <div className="rounded-md border border-warning/30 bg-warning/5 px-5 py-4 text-sm">
              <p className="font-medium">Preview, not a guided path</p>
              <p className="mt-1 leading-relaxed text-muted">
                This roadmap has {roadmap.sourceTopicCount} source topics, but no curated order yet.
                The sample below is for reference; ask the coach to turn your goal into a sequence
                through it.
              </p>
            </div>
          ) : null}

          {isPreview ? (
            <PreviewIndex
              topics={sampleTopics}
              roadmapSlug={roadmap.slug}
              sourceTopicCount={roadmap.sourceTopicCount}
            />
          ) : (
            <PathMap
              stages={stages}
              roadmapSlug={roadmap.slug}
              nextTopicId={nextTopic?.id ?? undefined}
            />
          )}
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
          {isPreview ? (
            <Card>
              <CardHeader
                title="Use this as a reference"
                description="There is no curated order yet. Build one with the coach."
              />
              <CardBody className="space-y-3 text-xs leading-relaxed text-muted">
                <p>
                  The sample gives you the vocabulary and the main ideas. Ask the coach for a short
                  route through it, or search the library for a specific problem.
                </p>
                <div className="flex flex-col gap-2">
                  <LinkButton to={coachHref} size="sm" icon={<Sparkles size={13} />}>
                    Ask for a route
                  </LinkButton>
                  <Link to={searchHref} className="underline">
                    Search “{roadmap.title}” in the library
                  </Link>
                  <Link to="/roadmaps?status=guided" className="underline">
                    Browse guided paths
                  </Link>
                </div>
              </CardBody>
            </Card>
          ) : (
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
          )}

          <Card>
            <CardHeader title={isPreview ? "How to use a preview" : "How to use this path"} />
            <CardBody className="space-y-3 text-xs leading-relaxed text-muted">
              {isPreview ? (
                <p>
                  Treat these topics as a reference shelf. Ask the coach to order them around a
                  concrete goal, then study the topics in that order and keep your own notes.
                </p>
              ) : (
                <>
                  <p>
                    Read the topic, build the practice artifact, then mark it practiced. Mastery is
                    a separate, slower signal.
                  </p>
                  <p>
                    Use the coach for explanations and quizzes, and the flashcards for retrieval.
                    Log the minutes; the weekly goal follows the evidence.
                  </p>
                </>
              )}
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
