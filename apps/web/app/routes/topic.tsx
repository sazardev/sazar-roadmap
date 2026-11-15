import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { TopicStatusBadge, TopicStatusIcon } from "~/components/status";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Input, Select, Textarea } from "~/components/ui/field";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import {
  createNote as createExternalNote,
  createTask,
} from "~/features/integrations/integrations.server";
import { createNote as createInternalNote } from "~/features/notes/notes.server";
import {
  parseStudyKind,
  parseTopicStatus,
  recordStudy,
  setTopicStatus,
} from "~/features/progress/progress.server";
import { toggleBookmark } from "~/features/resources/resources.server";
import { getTopicDetail } from "~/features/roadmaps/roadmaps.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/topic";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.detail.topic.title ?? "Topic");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const detail = await getTopicDetail(getEnv(context), user.id, params.slug, params.topicSlug);
  if (!detail) throw new Response("Topic not found", { status: 404 });
  const url = new URL(request.url);
  return {
    detail,
    notice: url.searchParams.get("notice"),
    error: url.searchParams.get("error"),
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const topicId = String(form.get("topicId") ?? "");
  if (!topicId) throw new Response("Missing topic", { status: 400 });

  const topic = await env.DB.prepare(
    `SELECT t.id, t.title, t.summary, t.why_it_matters AS why, t.key_concepts AS concepts,
            t.practice, r.title AS roadmap_title, r.slug AS roadmap_slug
     FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE t.id = ? AND r.slug = ? AND t.slug = ?`,
  )
    .bind(topicId, params.slug, params.topicSlug)
    .first<{
      id: string;
      title: string;
      summary: string;
      why: string;
      concepts: string;
      practice: string;
      roadmap_title: string;
      roadmap_slug: string;
    }>();
  if (!topic) throw new Response("Topic not found", { status: 404 });

  const back = (notice: string) =>
    redirect(`/roadmaps/${params.slug}/${params.topicSlug}?notice=${encodeURIComponent(notice)}`);
  const fail = (error: string) =>
    redirect(`/roadmaps/${params.slug}/${params.topicSlug}?error=${encodeURIComponent(error)}`);

  if (intent === "status") {
    const status = parseTopicStatus(form.get("status"));
    if (!status) return fail("invalid-status");
    await setTopicStatus(env, user.id, topicId, status);
    return back("status");
  }

  if (intent === "log") {
    const minutes = Number(form.get("minutes") ?? 25);
    const confidence = Number(form.get("confidence") ?? 0);
    await recordStudy(env, user.id, {
      topicId,
      minutes: Number.isFinite(minutes) ? minutes : 25,
      kind: parseStudyKind(form.get("kind")),
      confidence: Number.isFinite(confidence) && confidence > 0 ? confidence : undefined,
    });
    return back("logged");
  }

  if (intent === "note") {
    const title = String(form.get("title") ?? "").trim() || `Notes on ${topic.title}`;
    const body = String(form.get("body") ?? "").trim();
    if (body.length < 2) return fail("empty-note");
    await createInternalNote(env, user.id, { title, bodyMd: body, topicId });
    return back("note");
  }

  if (intent === "external-note") {
    const title = String(form.get("title") ?? "").trim() || `Study note: ${topic.title}`;
    const body = String(form.get("body") ?? "").trim();
    const concepts = parseConcepts(topic.concepts);
    const bodyMd = [
      `## ${topic.title}`,
      topic.summary,
      "",
      "## Why it matters",
      topic.why,
      "",
      "## Key concepts",
      ...concepts.map((concept) => `- ${concept}`),
      "",
      "## Practice",
      topic.practice,
      "",
      `Source: https://roadmap.sazardev.stream/roadmaps/${topic.roadmap_slug}/${params.topicSlug}`,
      body ? `\n## Personal notes\n${body}` : "",
    ].join("\n");
    const result = await createExternalNote(env, {
      title,
      body_md: bodyMd,
      tags: ["roadmap", topic.roadmap_slug],
      source_url: `https://roadmap.sazardev.stream/roadmaps/${topic.roadmap_slug}/${params.topicSlug}`,
    });
    if (!result.ok) {
      await createInternalNote(env, user.id, { title, bodyMd, topicId });
      return back("notes-fallback");
    }
    return back("notes-created");
  }

  if (intent === "create-task") {
    const result = await createTask(env, {
      title: `Study: ${topic.title}`,
      notes: `${topic.summary}\n\n${topic.practice}`,
      source_url: `https://roadmap.sazardev.stream/roadmaps/${topic.roadmap_slug}/${params.topicSlug}`,
    });
    return result.ok ? back("task-created") : back("task-unavailable");
  }

  if (intent === "bookmark") {
    const resourceId = String(form.get("resourceId") ?? "");
    if (!resourceId) return fail("invalid-resource");
    const owned = await env.DB.prepare("SELECT id FROM resources WHERE id = ? AND topic_id = ?")
      .bind(resourceId, topicId)
      .first<{ id: string }>();
    if (!owned) return fail("invalid-resource");
    await toggleBookmark(env, user.id, resourceId);
    return back("bookmark");
  }

  return fail("unknown-action");
}

function parseConcepts(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

const notices: Record<string, string> = {
  logged: "Session logged. The weekly goal and activity log were updated.",
  status: "Topic status updated.",
  note: "Note saved to your Roadmap notes.",
  "notes-created": "Note created in Notes. Open the app from the switcher.",
  "notes-fallback": "Notes was unavailable, so the note was saved inside Roadmap instead.",
  "task-created": "Task created in Tasks.",
  "task-unavailable": "Tasks is unavailable. Enable the integration key in Settings.",
  bookmark: "Bookmark updated.",
};

const errors: Record<string, string> = {
  "invalid-status": "That topic status is not valid.",
  "empty-note": "Write at least a sentence before saving the note.",
  "invalid-resource": "That resource does not belong to this topic.",
  "unknown-action": "The requested action is not available.",
};

export default function TopicPage({ loaderData }: Route.ComponentProps) {
  const { detail, notice, error } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const { topic, progress, resources, notes, cards, previous, next, related, threads } = detail;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link to="/roadmaps" className="inline-flex items-center gap-1 underline">
          <ArrowLeft size={12} /> Roadmaps
        </Link>
        <span>/</span>
        <Link to={`/roadmaps/${topic.roadmapSlug}`} className="underline">
          {topic.roadmapTitle}
        </Link>
        <span>/</span>
        <span className="truncate">{topic.stageTitle}</span>
      </div>

      {notice && notices[notice] ? (
        <div className="rounded-sm border border-success/30 bg-success/5 px-4 py-3 text-sm">
          {notices[notice]}
        </div>
      ) : null}
      {error && errors[error] ? (
        <div className="rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {errors[error]}
        </div>
      ) : null}

      <PageHeader
        eyebrow={`${topic.roadmapTitle} / ${topic.stageTitle}`}
        title={topic.title}
        description={topic.summary}
        actions={
          <>
            <LinkButton to={`/coach?topic=${topic.id}`} icon={<Sparkles size={15} />}>
              Ask the coach
            </LinkButton>
            {cards.total > 0 ? (
              <LinkButton
                to={`/flashcards?topic=${topic.id}`}
                variant="secondary"
                icon={<GraduationCap size={15} />}
              >
                Review {cards.due > 0 ? `${cards.due} due` : `${cards.total} cards`}
              </LinkButton>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <TopicStatusBadge status={progress.status} />
        <Badge tone="outline" className="capitalize">
          {topic.difficulty}
        </Badge>
        <Badge tone="outline">
          <Clock3 size={11} /> {topic.estimatedMinutes} min
        </Badge>
        <Badge tone="outline">{resources.length} resources</Badge>
        {progress.minutesSpent > 0 ? (
          <Badge tone="outline">{progress.minutesSpent} min logged</Badge>
        ) : null}
        {progress.lastStudiedAt ? (
          <span className="text-xs text-muted">
            Last studied {relativeDay(progress.lastStudiedAt).toLowerCase()}
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Study controls"
              description="Mark where you are, log the time and keep the evidence honest."
            />
            <CardBody className="space-y-5">
              <Form method="post" className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="intent" value="status" />
                <input type="hidden" name="topicId" value={topic.id} />
                {(["not_started", "learning", "practiced", "mastered"] as const).map((status) => (
                  <button
                    key={status}
                    type="submit"
                    name="status"
                    value={status}
                    disabled={busy}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors duration-fast ${
                      progress.status === status
                        ? "border-ink bg-ink text-canvas"
                        : "border-line text-muted hover:bg-hover hover:text-ink"
                    }`}
                  >
                    <TopicStatusIcon status={status} className="size-3.5" />
                    {status.replace("_", " ")}
                  </button>
                ))}
              </Form>

              <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                <Form method="post" className="contents">
                  <input type="hidden" name="intent" value="log" />
                  <input type="hidden" name="topicId" value={topic.id} />
                  <label className="space-y-1.5 text-xs text-muted">
                    <span className="block">Minutes</span>
                    <Select name="minutes" defaultValue="25" className="h-9">
                      {[10, 15, 25, 45, 60, 90].map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes} min
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="space-y-1.5 text-xs text-muted">
                    <span className="block">Activity</span>
                    <Select name="kind" defaultValue="read" className="h-9">
                      <option value="read">Read / watch</option>
                      <option value="practice">Practice</option>
                      <option value="review">Review</option>
                      <option value="coach">Coach session</option>
                      <option value="video">Video</option>
                    </Select>
                  </label>
                  <label className="space-y-1.5 text-xs text-muted">
                    <span className="block">Confidence</span>
                    <Select
                      name="confidence"
                      defaultValue={String(progress.confidence || 3)}
                      className="h-9"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}/5
                        </option>
                      ))}
                    </Select>
                  </label>
                  <Button type="submit" size="sm" disabled={busy}>
                    Log session
                  </Button>
                </Form>
              </div>
            </CardBody>
          </Card>

          <section className="space-y-3" aria-labelledby="why-heading">
            <h2 id="why-heading" className="text-lg font-semibold tracking-tight">
              Why it matters
            </h2>
            <p className="max-w-prose text-[15px] leading-relaxed text-ink/90">
              {topic.whyItMatters}
            </p>
          </section>

          <section className="space-y-3" aria-labelledby="concepts-heading">
            <h2 id="concepts-heading" className="text-lg font-semibold tracking-tight">
              Key concepts
            </h2>
            <ol className="space-y-3">
              {topic.keyConcepts.map((concept, index) => (
                <li key={concept} className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[10px] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{concept}</span>
                </li>
              ))}
            </ol>
          </section>

          <Card className="bg-surface">
            <CardHeader
              title="Practice"
              description="Reading is input. This is where the learning happens."
            />
            <CardBody className="space-y-4">
              <p className="max-w-prose text-sm leading-relaxed">{topic.practice}</p>
              <Form method="post" className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="intent" value="log" />
                <input type="hidden" name="topicId" value={topic.id} />
                <input type="hidden" name="kind" value="practice" />
                <input type="hidden" name="minutes" value="25" />
                <input type="hidden" name="confidence" value="4" />
                <Button type="submit" size="sm" disabled={busy} icon={<ArrowRight size={13} />}>
                  Mark 25-minute practice
                </Button>
                <Link
                  to={`/practice?topic=${topic.id}`}
                  className="inline-flex h-8 items-center rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink"
                >
                  Open guided practice
                </Link>
              </Form>
            </CardBody>
          </Card>

          {topic.pitfalls.length > 0 ? (
            <section className="space-y-3" aria-labelledby="pitfalls-heading">
              <h2 id="pitfalls-heading" className="text-lg font-semibold tracking-tight">
                Common pitfalls
              </h2>
              <ul className="space-y-2">
                {topic.pitfalls.map((pitfall) => (
                  <li key={pitfall} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-danger"
                    />
                    {pitfall}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Card>
            <CardHeader
              title="Notes"
              description="Private notes that stay next to the topic. Save them here or send them to Notes."
            />
            <CardBody className="space-y-5">
              {notes.length > 0 ? (
                <ul className="space-y-3">
                  {notes.map((note) => (
                    <li key={note.id}>
                      <details className="rounded-sm border border-line bg-surface px-4 py-3">
                        <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
                          {note.title}
                          <span className="ml-2 text-[10px] font-normal text-muted">
                            {relativeDay(note.updatedAt)}
                          </span>
                        </summary>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                          {note.bodyMd}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Form method="post" className="space-y-3">
                <input type="hidden" name="topicId" value={topic.id} />
                <Input
                  name="title"
                  defaultValue={`Notes on ${topic.title}`}
                  aria-label="Note title"
                />
                <Textarea
                  name="body"
                  placeholder="What clicked? What is still unclear? What did you build?"
                  aria-label="Note body"
                  className="min-h-28"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    name="intent"
                    value="note"
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                  >
                    Save in Roadmap
                  </Button>
                  <Button
                    type="submit"
                    name="intent"
                    value="external-note"
                    size="sm"
                    disabled={busy}
                    icon={<FileText size={13} />}
                  >
                    Save to Notes
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>

          <section className="space-y-3" aria-labelledby="resources-heading">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="resources-heading" className="text-lg font-semibold tracking-tight">
                  Resources
                </h2>
                <p className="text-sm text-muted">
                  Curated links from the community fork. Open what is useful; bookmark the rest.
                </p>
              </div>
              <Link to="/resources" className="text-xs text-muted underline">
                All resources
              </Link>
            </div>
            {resources.length === 0 ? (
              <EmptyState
                title="No resources for this topic"
                description="Ask the coach for a reading list and add the useful links to your notes."
                icon={<BookOpen size={20} />}
              />
            ) : (
              <ul className="divide-y divide-line rounded-md border border-line">
                {resources.map((resource) => (
                  <li key={resource.id} className="flex items-center gap-3 px-4 py-3">
                    <ResourceIcon kind={resource.kind} />
                    <div className="min-w-0 flex-1">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink"
                      >
                        <span className="line-clamp-1">{resource.title}</span>
                        <ExternalLink size={11} className="shrink-0 text-muted" />
                      </a>
                      <p className="text-[11px] text-muted">
                        {resource.provider ?? resource.kind} · {resource.kind}
                      </p>
                    </div>
                    <Form method="post">
                      <input type="hidden" name="intent" value="bookmark" />
                      <input type="hidden" name="topicId" value={topic.id} />
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <button
                        type="submit"
                        aria-label={resource.bookmarked ? "Remove bookmark" : "Bookmark resource"}
                        className="inline-flex size-8 items-center justify-center rounded-sm text-muted hover:bg-hover hover:text-ink"
                      >
                        {resource.bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      </button>
                    </Form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {related.length > 0 ? (
            <section className="space-y-3" aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-lg font-semibold tracking-tight">
                Related in this stage
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    to={`/roadmaps/${topic.roadmapSlug}/${item.slug}`}
                    className="flex items-center gap-2 rounded-sm border border-line px-3 py-2 text-sm hover:bg-hover"
                  >
                    <ArrowRight size={13} className="text-muted" />
                    <span className="line-clamp-1">{item.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader title="Position" description="Where this topic sits in the path." />
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Stage</span>
                <span className="text-right font-medium">{topic.stageTitle}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Confidence</span>
                <span className="font-mono">{progress.confidence || 0}/5</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Cards</span>
                <Link to={`/flashcards?topic=${topic.id}`} className="underline">
                  {cards.total} total · {cards.due} due
                </Link>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Source</span>
                <span className="text-right text-xs">roadmap.sh fork</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Move through the path" />
            <CardBody className="space-y-2">
              {previous ? (
                <Link
                  to={`/roadmaps/${topic.roadmapSlug}/${previous.slug}`}
                  className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-muted hover:bg-hover hover:text-ink"
                >
                  <ArrowLeft size={13} />
                  <span className="line-clamp-1">{previous.title}</span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  to={`/roadmaps/${topic.roadmapSlug}/${next.slug}`}
                  className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-muted hover:bg-hover hover:text-ink"
                >
                  <span className="line-clamp-1 flex-1 text-right">{next.title}</span>
                  <ArrowRight size={13} />
                </Link>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Coach"
              description="Threads about this topic."
              action={
                <Link
                  to={`/coach?topic=${topic.id}`}
                  className="text-muted hover:text-ink"
                  aria-label="New coach thread"
                >
                  <MessageSquare size={14} />
                </Link>
              }
            />
            <CardBody className="space-y-2">
              {threads.length === 0 ? (
                <p className="text-xs text-muted">
                  No threads yet. Ask for an explanation, a quiz or a plan.
                </p>
              ) : (
                threads.map((thread) => (
                  <Link
                    key={thread.id}
                    to={`/coach?thread=${thread.id}`}
                    className="block truncate rounded-sm px-2 py-1.5 text-xs text-muted hover:bg-hover hover:text-ink"
                  >
                    {thread.title}
                  </Link>
                ))
              )}
              <Form method="post">
                <input type="hidden" name="intent" value="create-task" />
                <input type="hidden" name="topicId" value={topic.id} />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={busy}
                >
                  Create a study task
                </Button>
              </Form>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ResourceIcon({ kind }: { kind: string }) {
  const Icon = kind === "video" ? BookOpen : kind === "docs" ? FileText : BookOpen;
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-muted">
      <Icon size={14} strokeWidth={1.8} />
    </span>
  );
}
