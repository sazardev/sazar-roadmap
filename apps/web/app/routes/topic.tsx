import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { SelectionToNotes } from "~/components/selection-to-notes";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Input, Textarea } from "~/components/ui/field";
import { RichText } from "~/components/ui/rich-text";
import {
  createNote as createExternalNote,
  createTask,
} from "~/features/integrations/integrations.server";
import { createNote as createInternalNote } from "~/features/notes/notes.server";
import { toggleBookmark } from "~/features/resources/resources.server";
import { getTopicDetail } from "~/features/roadmaps/roadmaps.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { pageMeta } from "~/lib/meta";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/topic";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.detail.topic.title ?? "Topic");

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
  note: "Note saved.",
  "notes-created": "Note created in Notes.",
  "notes-fallback": "Notes unavailable; saved in Roadmap.",
  "task-created": "Task created in Tasks.",
  "task-unavailable": "Tasks is unavailable.",
  bookmark: "Bookmark updated.",
};

const errors: Record<string, string> = {
  "empty-note": "Write at least a sentence before saving.",
  "invalid-resource": "That resource does not belong to this topic.",
  "unknown-action": "The requested action is not available.",
};

export default function TopicPage({ loaderData }: Route.ComponentProps) {
  const { detail, notice, error } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const { topic, progress, resources, notes, cards, previous, next } = detail;
  const passed = progress.status === "practiced" || progress.status === "mastered";
  const inPractice = progress.status === "learning";
  const isReference = topic.stageSlug === "extended-library";
  const sourceUrl = `https://roadmap.sh/${topic.roadmapSlug}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/roadmaps/${topic.roadmapSlug}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm font-medium text-muted shadow-sm transition-colors duration-fast hover:border-line-strong hover:bg-hover hover:text-ink"
        >
          <ArrowLeft size={15} /> {topic.roadmapTitle}
        </Link>
        <details className="relative">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm font-medium text-muted shadow-sm transition-colors hover:border-line-strong hover:bg-hover hover:text-ink [&::-webkit-details-marker]:hidden">
            <MoreHorizontal size={17} /> Actions
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.6rem)] z-30 w-64 rounded-lg border border-line bg-raised p-2 shadow-float">
            <Link
              to={`/coach?topic=${topic.id}`}
              className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm hover:bg-hover"
            >
              <Sparkles size={16} className="text-muted" /> Ask the coach
            </Link>
            {cards.total > 0 ? (
              <Link
                to={`/flashcards?topic=${topic.id}`}
                className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm hover:bg-hover"
              >
                <GraduationCap size={16} className="text-muted" /> Review {cards.total} cards
              </Link>
            ) : null}
            <Form method="post">
              <input type="hidden" name="intent" value="external-note" />
              <input type="hidden" name="topicId" value={topic.id} />
              <button
                type="submit"
                className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 text-left text-sm hover:bg-hover"
              >
                <FileText size={16} className="text-muted" /> Save topic to Notes
              </button>
            </Form>
            <Form method="post">
              <input type="hidden" name="intent" value="create-task" />
              <input type="hidden" name="topicId" value={topic.id} />
              <button
                type="submit"
                className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 text-left text-sm hover:bg-hover"
              >
                <Check size={16} className="text-muted" /> Create study task
              </button>
            </Form>
            <Link
              to="/settings"
              className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm text-muted hover:bg-hover hover:text-ink"
            >
              Study preferences
            </Link>
          </div>
        </details>
      </div>

      {notice && notices[notice] ? (
        <div className="rounded-lg border border-success/25 bg-success-soft px-4 py-3 text-sm">
          {notices[notice]}
        </div>
      ) : null}
      {error && errors[error] ? (
        <div className="rounded-lg border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {errors[error]}
        </div>
      ) : null}

      <header className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {topic.stageTitle}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
          {topic.title}
        </h1>
        <RichText
          text={topic.summary}
          className="block max-w-2xl text-lg leading-relaxed text-muted"
        />
        {isReference ? (
          <p className="max-w-2xl rounded-md bg-surface/60 px-4 py-3 text-sm leading-relaxed text-muted">
            Reference topic outside the guided sequence. Practice is optional and does not change
            the guided percentage.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge tone={passed ? "success" : inPractice ? "warning" : "outline"}>
            {passed ? (
              <>
                <Check size={12} /> Practice passed
              </>
            ) : isReference ? (
              "Reference practice"
            ) : inPractice ? (
              "In practice"
            ) : (
              "Practice required"
            )}
          </Badge>
          <Badge tone="outline" className="capitalize">
            {topic.difficulty}
          </Badge>
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/60 px-3">
            <Clock3 size={13} /> {topic.estimatedMinutes} min
          </span>
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/60 px-3">
            <BookOpen size={13} /> {resources.length} resources
          </span>
          {progress.lastStudiedAt ? (
            <span>Last studied {relativeDay(progress.lastStudiedAt).toLowerCase()}</span>
          ) : null}
        </div>
      </header>

      <SelectionToNotes topicId={topic.id}>
        <div className="space-y-12">
          {topic.whyItMatters ? (
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight">Why it matters</h2>
              <RichText
                text={topic.whyItMatters}
                className="block max-w-prose text-base leading-relaxed md:text-[1.0625rem]"
              />
            </section>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Key concepts</h2>
            <ol className="space-y-3">
              {topic.keyConcepts.map((concept, index) => (
                <li
                  key={concept}
                  className="flex gap-3.5 rounded-lg border border-line/70 bg-raised p-4 text-base leading-relaxed shadow-card"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] font-medium text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <RichText text={concept} />
                </li>
              ))}
            </ol>
          </section>

          <section className="accent-band space-y-4 rounded-lg border border-line p-5 shadow-card md:p-7">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-ink">
                <GraduationCap size={18} />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">Practice</h2>
            </div>
            <RichText
              text={topic.practice}
              className="block max-w-prose text-base leading-relaxed"
            />
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton
                to={`/practice?topic=${topic.id}`}
                variant={passed ? "secondary" : "primary"}
                icon={<ArrowRight size={16} />}
              >
                {passed
                  ? "Review practice feedback"
                  : isReference
                    ? "Practice this reference topic"
                    : "Start guided practice"}
              </LinkButton>
              <span className="text-sm text-muted">
                {passed
                  ? "A topic is complete once the review passes."
                  : isReference
                    ? "Optional; it does not change the guided percentage."
                    : "Required to complete this topic."}
              </span>
            </div>
          </section>

          {topic.pitfalls.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight">Common pitfalls</h2>
              <ul className="space-y-2.5">
                {topic.pitfalls.map((pitfall) => (
                  <li
                    key={pitfall}
                    className="flex gap-3 rounded-lg border border-line/70 bg-raised p-4 text-sm leading-relaxed text-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-danger"
                    />
                    <RichText text={pitfall} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">Resources</h2>
            </div>
            {resources.length === 0 ? (
              <p className="text-sm text-muted">No resources yet.</p>
            ) : (
              <ul className="divide-y divide-line/70 overflow-hidden rounded-lg border border-line bg-raised shadow-card">
                {resources.map((resource) => (
                  <li key={resource.id} className="flex min-h-16 items-center gap-3 px-4 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
                      <BookOpen size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-accent"
                      >
                        <span className="line-clamp-1">{resource.title}</span>
                        <ExternalLink size={12} className="shrink-0 text-muted" />
                      </a>
                      <p className="mt-0.5 text-xs text-muted">
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
                        className="flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-accent"
                      >
                        {resource.bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </Form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SelectionToNotes>

      <details className="rounded-lg border border-line bg-raised shadow-card">
        <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="font-semibold">Notes</span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
            {notes.length > 0 ? `${notes.length} saved` : "Add a private note"}
          </span>
        </summary>
        <div className="space-y-4 border-t border-line/80 p-4 md:p-5">
          {notes.length > 0 ? (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li key={note.id} className="rounded-md border border-line bg-surface/60 px-4 py-3">
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                    {note.bodyMd}
                  </p>
                  <p className="mt-2 text-xs text-muted">{relativeDay(note.updatedAt)}</p>
                </li>
              ))}
            </ul>
          ) : null}
          <Form method="post" className="space-y-2.5">
            <input type="hidden" name="topicId" value={topic.id} />
            <Input
              name="title"
              defaultValue={`Notes on ${topic.title}`}
              aria-label="Note title"
              className="h-11 text-sm"
            />
            <Textarea
              name="body"
              placeholder="What clicked? What is still unclear?"
              aria-label="Note body"
              className="min-h-28 text-base"
            />
            <Button type="submit" name="intent" value="note" variant="secondary" disabled={busy}>
              Save note
            </Button>
          </Form>
        </div>
      </details>

      <nav
        className="grid gap-3 border-t border-line/80 pt-6 sm:grid-cols-2"
        aria-label="Topic navigation"
      >
        {previous ? (
          <Link
            to={`/roadmaps/${topic.roadmapSlug}/${previous.slug}`}
            className="group flex min-h-16 items-center gap-3 rounded-lg border border-line bg-raised p-4 shadow-card transition-[border-color,background-color] duration-fast hover:border-line-strong hover:bg-hover"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted group-hover:border-accent/30 group-hover:bg-accent-soft group-hover:text-accent">
              <ArrowLeft size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-muted">Previous</span>
              <span className="block truncate text-sm font-medium">{previous.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/roadmaps/${topic.roadmapSlug}/${next.slug}`}
            className="group flex min-h-16 items-center justify-end gap-3 rounded-lg border border-line bg-raised p-4 text-right shadow-card transition-[border-color,background-color] duration-fast hover:border-line-strong hover:bg-hover"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted">Next</span>
              <span className="block truncate text-sm font-medium">{next.title}</span>
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted group-hover:border-accent/30 group-hover:bg-accent-soft group-hover:text-accent">
              <ArrowRight size={16} />
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <p className="max-w-3xl text-xs leading-relaxed text-muted">
        Content is a personal-use copy of the roadmap.sh fork. Source:{" "}
        <a href={sourceUrl} className="underline">
          roadmap.sh/{topic.roadmapSlug}
        </a>
        .
      </p>
    </div>
  );
}
