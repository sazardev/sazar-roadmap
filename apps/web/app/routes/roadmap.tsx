import { ArrowRight, BookOpen, Clock3, Layers, Sparkles } from "lucide-react";
import { Link, redirect } from "react-router";
import { SaveOfflineButton } from "~/components/pwa/save-offline-button";
import { RoadmapMap } from "~/components/roadmap/roadmap-map";
import { TopicIndex } from "~/components/roadmap/topic-index";
import { roadmapIcon } from "~/components/shell/icons";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import { ProgressBar } from "~/components/ui/progress";
import { RichText } from "~/components/ui/rich-text";
import { PageHeader } from "~/components/ui/surfaces";
import { getRoadmapDetail } from "~/features/roadmaps/roadmaps.server";
import { requireUser } from "~/lib/auth/auth.server";
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
  const topicSlug = new URL(request.url).searchParams.get("topic");
  if (topicSlug) throw redirect(`/roadmaps/${params.slug}/${topicSlug}`);

  return detail;
}

export default function RoadmapDetailPage({ loaderData }: Route.ComponentProps) {
  const { roadmap, stages, nextTopic } = loaderData;
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
  const coachHref = nextTopic ? `/coach?topic=${nextTopic.id}` : "/coach";
  const nextHref = nextTopic
    ? `/roadmaps/${roadmap.slug}/${nextTopic.slug}`
    : `/roadmaps/${roadmap.slug}`;
  const searchHref = `/search?q=${encodeURIComponent(roadmap.title)}`;
  const offlineUrls = [
    `/roadmaps/${roadmap.slug}`,
    ...coreTopics.map((topic) => `/roadmaps/${roadmap.slug}/${topic.slug}`),
  ];
  const progressLabel = isPreview
    ? `${progress}% of the sample`
    : isGuided
      ? `${progress}% complete`
      : `${progress}% explored`;

  return (
    <div className="space-y-6">
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
            {isGuided ? (
              <SaveOfflineButton
                urls={offlineUrls}
                label="Save offline"
                className="h-11 px-4 text-sm"
              />
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

      <div className="flex flex-wrap items-center gap-5 rounded-lg border border-line bg-raised px-5 py-4 shadow-card">
        <div className="min-w-44 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">{progressLabel}</span>
            <span className="font-mono text-[11px] text-muted">
              {coreCompleted}/{coreTopics.length}
            </span>
          </div>
          <ProgressBar value={coreCompleted} max={coreTopics.length || 1} className="mt-2" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/60 px-3">
            <BookOpen size={13} />{" "}
            {isPreview ? `${coreTopics.length} sample` : `${coreTopics.length} topics`}
          </span>
          {isPreview ? (
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/60 px-3">
              <Layers size={13} /> {roadmap.sourceTopicCount} source
            </span>
          ) : null}
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/60 px-3">
            <Clock3 size={13} /> {roadmap.estimatedHours}h
          </span>
          <Badge tone="outline" className="capitalize">
            {roadmap.level}
          </Badge>
        </div>
      </div>

      {isPreview ? (
        <>
          <div className="rounded-lg border border-warning/25 bg-warning-soft px-5 py-4 text-sm">
            <p className="font-semibold">Preview, not a guided path</p>
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
          <details className="rounded-lg border border-line bg-raised shadow-card">
            <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden md:px-6">
              <span className="font-semibold">Stage briefs</span>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                What each of the {coreStages.length} stages builds
              </span>
            </summary>
            <ol className="divide-y divide-line/70 border-t border-line/80">
              {coreStages.map((stage, index) => (
                <li key={stage.id} className="flex gap-3 px-5 py-4 md:px-6">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] font-medium text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{stage.title}</h3>
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
                      <RichText text={stage.description} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </details>
          {extended && extended.topics.length > 0 ? (
            <details className="rounded-lg border border-line bg-raised shadow-card">
              <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden md:px-6">
                <span className="font-semibold">Extended library</span>
                <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                  {extended.topics.length} additional topics
                </span>
              </summary>
              <div className="border-t border-line/80 p-4 md:p-6">
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
          <div className="rounded-lg border border-line bg-surface/60 px-5 py-4 text-sm">
            <p className="font-semibold">Reference library, not a sequence</p>
            <p className="mt-1 max-w-3xl leading-relaxed text-muted">
              These topics come from the community roadmap without a curated order. Use search or
              ask the coach to build a route around your goal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <Link
              to={searchHref}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4"
            >
              Search “{roadmap.title}” in the library
            </Link>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <Link
              to="/roadmaps?status=guided"
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4"
            >
              Browse guided paths
            </Link>
          </div>
          <details className="rounded-lg border border-line bg-raised shadow-card">
            <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden md:px-6">
              <span className="font-semibold">Browse all reference topics</span>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                {sampleTopics.length} topics
              </span>
            </summary>
            <div className="border-t border-line/80 p-4 md:p-6">
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

      <p className="max-w-3xl text-xs leading-relaxed text-muted">
        Content is a personal-use copy of the roadmap.sh fork and stays behind the shared sazardev
        session. Guided stages and practice prompts are original to this app.
      </p>
    </div>
  );
}
