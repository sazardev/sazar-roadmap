import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers, Sparkles } from "lucide-react";
import { Link, redirect } from "react-router";
import { RoadmapMap } from "~/components/roadmap/roadmap-map";
import { TopicDrawer } from "~/components/roadmap/topic-drawer";
import { TopicIndex } from "~/components/roadmap/topic-index";
import { roadmapIcon } from "~/components/shell/icons";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import { ProgressBar, ProgressRing } from "~/components/ui/progress";
import { PageHeader } from "~/components/ui/surfaces";
import { parseTopicStatus, setTopicStatus } from "~/features/progress/progress.server";
import { getRoadmapDetail, getTopicDetail } from "~/features/roadmaps/roadmaps.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { pageMeta } from "~/lib/meta";
import { percent } from "~/lib/utils";
import type { Route } from "./+types/roadmap";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.roadmap.title ?? "Roadmap");

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const detail = await getRoadmapDetail(env, user.id, params.slug);
  if (!detail) throw new Response("Roadmap not found", { status: 404 });

  const url = new URL(request.url);
  const topicSlug = url.searchParams.get("topic");
  const drawer =
    topicSlug && detail.roadmap.status === "guided"
      ? await getTopicDetail(env, user.id, params.slug, topicSlug)
      : null;

  return {
    ...detail,
    drawer,
    notice: url.searchParams.get("notice") ? "Progress updated." : null,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "status") {
    const topicId = String(form.get("topicId") ?? "");
    const status = parseTopicStatus(form.get("status"));
    if (!topicId || !status) throw new Response("Invalid status", { status: 400 });
    const topic = await env.DB.prepare(
      `SELECT t.slug FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE t.id = ? AND r.slug = ?`,
    )
      .bind(topicId, params.slug)
      .first<{ slug: string }>();
    if (!topic) throw new Response("Topic not found", { status: 404 });
    await setTopicStatus(env, user.id, topicId, status);
    return redirect(`/roadmaps/${params.slug}?topic=${topic.slug}&notice=status`);
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export default function RoadmapDetailPage({ loaderData }: Route.ComponentProps) {
  const { roadmap, stages, nextTopic, drawer, notice } = loaderData;
  const Icon = roadmapIcon(roadmap.icon);
  const isPreview = roadmap.contentStatus === "preview";
  const isGuided = roadmap.status === "guided";
  const coreStages = isGuided
    ? stages.filter((stage) => stage.slug !== "extended-library")
    : stages;
  const coreTopics = coreStages.flatMap((stage) => stage.topics);
  const coreCompleted = coreTopics.filter(
    (topic) => topic.status === "practiced" || topic.status === "mastered",
  ).length;
  const progress = percent(coreCompleted, coreTopics.length);
  const sampleTopics = coreTopics;
  const extended = stages.find((stage) => stage.slug === "extended-library");
  const activeStage = stages.find((stage) =>
    stage.topics.some((topic) => topic.id === nextTopic?.id),
  );
  const coachHref = nextTopic ? `/coach?topic=${nextTopic.id}` : "/coach";
  const nextHref = nextTopic
    ? `/roadmaps/${roadmap.slug}?topic=${nextTopic.slug}`
    : `/roadmaps/${roadmap.slug}`;
  const searchHref = `/search?q=${encodeURIComponent(roadmap.title)}`;
  const progressLabel = isPreview
    ? `${progress}% of the sample`
    : isGuided
      ? `${progress}% complete`
      : `${progress}% explored`;

  return (
    <div className="space-y-6">
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
            {isGuided ? "Guided path" : isPreview ? "Preview library" : "Reference library"}
          </span>
        }
        title={roadmap.title}
        description={roadmap.tagline}
        actions={
          <>
            {isGuided && nextTopic ? (
              <LinkButton to={nextHref} icon={<ArrowRight size={15} />}>
                Open next step
              </LinkButton>
            ) : null}
            <LinkButton
              to={coachHref}
              variant={isGuided && nextTopic ? "secondary" : "primary"}
              icon={<Sparkles size={15} />}
            >
              Ask the coach
            </LinkButton>
            {!isGuided ? (
              <LinkButton to="/roadmaps?status=guided" variant="secondary">
                Browse guided paths
              </LinkButton>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4 border-y border-line py-3">
        <ProgressRing value={progress} size={48} stroke={3} label={`${progress}%`} />
        <div className="min-w-40 flex-1">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium">{progressLabel}</span>
            <span className="font-mono text-[10px] text-muted">
              {coreCompleted}/{coreTopics.length}
            </span>
          </div>
          <ProgressBar value={coreCompleted} max={coreTopics.length || 1} className="mt-1.5" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
          {isGuided ? (
            <span className="inline-flex items-center gap-1">
              <Layers size={11} /> {coreStages.length} stages
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <BookOpen size={11} />{" "}
            {isPreview ? `${coreTopics.length} sample` : `${coreTopics.length} topics`}
          </span>
          {isPreview ? (
            <span className="inline-flex items-center gap-1">
              <Layers size={11} /> {roadmap.sourceTopicCount} source
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} /> {roadmap.estimatedHours}h
          </span>
          <Badge tone="outline" className="capitalize">
            {roadmap.level}
          </Badge>
        </div>
      </div>

      {isGuided && nextTopic ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-ink bg-surface px-4 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
            Next step
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
              {activeStage?.title ?? "Next"}
            </p>
            <p className="truncate text-sm font-semibold">{nextTopic.title}</p>
          </div>
          <LinkButton to={nextHref} size="sm" icon={<ArrowRight size={13} />}>
            Open step
          </LinkButton>
        </div>
      ) : null}

      {isPreview ? (
        <>
          <div className="rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
            <p className="font-medium">Preview, not a guided path</p>
            <p className="mt-1 max-w-3xl leading-relaxed text-muted">
              This roadmap has {roadmap.sourceTopicCount} source topics, but no curated order yet.
              The sample below is for reference; ask the coach to turn your goal into a sequence.
            </p>
          </div>
          <TopicIndex
            topics={sampleTopics}
            roadmapSlug={roadmap.slug}
            title="Sample topics"
            description={`An alphabetical sample of ${sampleTopics.length} of the ${roadmap.sourceTopicCount} source topics. This is a reference preview, not a recommended order.`}
            badge={`${sampleTopics.length} of ${roadmap.sourceTopicCount}`}
          />
        </>
      ) : isGuided ? (
        <>
          <RoadmapMap
            stages={coreStages}
            roadmapSlug={roadmap.slug}
            nextTopicId={nextTopic?.id ?? undefined}
          />
          {extended && extended.topics.length > 0 ? (
            <details className="rounded-md border border-line">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
                <span className="font-medium">Extended library</span>
                <span className="ml-2 text-xs text-muted">
                  {extended.topics.length} additional topics
                </span>
              </summary>
              <div className="border-t border-line p-4">
                <TopicIndex
                  topics={extended.topics}
                  roadmapSlug={roadmap.slug}
                  title="More topics"
                  description="Additional source topics for reference. They are not part of the guided sequence."
                  badge={`${extended.topics.length}`}
                  compact
                />
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <>
          <div className="rounded-md border border-line bg-surface px-4 py-3 text-sm">
            <p className="font-medium">Reference library, not a sequence</p>
            <p className="mt-1 max-w-3xl leading-relaxed text-muted">
              These topics come from the community roadmap without a curated order. Use search or
              ask the coach to build a route around your goal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Link to={searchHref} className="underline">
              Search “{roadmap.title}” in the library
            </Link>
            <Link to="/roadmaps?status=guided" className="underline">
              Browse guided paths
            </Link>
          </div>
          <details className="rounded-md border border-line">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
              <span className="font-medium">Browse all reference topics</span>
              <span className="ml-2 text-xs text-muted">{sampleTopics.length} topics</span>
            </summary>
            <div className="border-t border-line p-4">
              <TopicIndex
                topics={sampleTopics}
                roadmapSlug={roadmap.slug}
                title="Reference topics"
                description={`All ${sampleTopics.length} topics available for this roadmap, as a searchable shelf.`}
                badge={`${sampleTopics.length} topics`}
                compact
              />
            </div>
          </details>
        </>
      )}

      <p className="text-[10px] leading-relaxed text-muted">
        Content is a personal-use copy of the roadmap.sh fork and stays behind the shared sazardev
        session. Guided stages and practice prompts are original to this app.
      </p>

      {drawer ? (
        <TopicDrawer detail={drawer} closeHref={`/roadmaps/${roadmap.slug}`} notice={notice} />
      ) : null}
    </div>
  );
}
