import { BookOpen, History, Plus, Sparkles } from "lucide-react";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { CoachComposer } from "~/components/coach/coach-composer";
import { CoachScroll } from "~/components/coach/coach-scroll";
import { MarkdownText } from "~/components/markdown";
import { Badge } from "~/components/ui/badge";
import {
  createThread,
  getSourcesByIds,
  getThread,
  listThreads,
  sendCoachMessage,
} from "~/features/coach/coach.server";
import { getLearningStats } from "~/features/progress/progress.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/coach";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.active?.thread.title ?? "Coach");

import { pageMeta } from "~/lib/meta";

interface CoachTopic {
  id: string;
  title: string;
  slug: string;
  roadmapSlug: string;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const requestedThread = url.searchParams.get("thread");
  const requestedTopic = url.searchParams.get("topic");
  const isNew = url.searchParams.get("new") === "1";
  const requestedMode = url.searchParams.get("mode") ?? "coach";

  const threads = await listThreads(env, user.id);
  let active = requestedThread ? await getThread(env, user.id, requestedThread) : null;
  if (!active && !requestedThread && !isNew && threads[0]) {
    active = await getThread(env, user.id, threads[0].id);
  }
  if (requestedThread && !active) {
    throw new Response("Thread not found", { status: 404 });
  }

  const contextId = requestedTopic ?? active?.thread.topicId ?? null;
  const topic = contextId
    ? await env.DB.prepare(
        `SELECT t.id, t.title, t.slug, r.slug AS roadmapSlug
         FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id WHERE t.id = ?`,
      )
        .bind(contextId)
        .first<CoachTopic>()
    : null;

  const citationIds = new Set<string>();
  for (const message of active?.messages ?? []) {
    for (const id of message.citations) citationIds.add(id);
  }
  const sources = citationIds.size > 0 ? await getSourcesByIds(env, [...citationIds]) : [];
  const citationMap = Object.fromEntries(sources.map((source) => [source.id, source]));

  return {
    active,
    topic,
    mode: active?.thread.mode ?? requestedMode,
    citationMap,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "send") {
    const content = String(form.get("content") ?? "").trim();
    if (content.length < 2) return { error: "Write a little more before sending." };
    let threadId = String(form.get("threadId") ?? "");
    if (!threadId) {
      threadId = await createThread(env, user.id, {
        title: content.slice(0, 80),
        topicId: String(form.get("topicId") ?? "") || null,
        mode: String(form.get("mode") ?? "coach"),
      });
    }
    try {
      const stats = await getLearningStats(env, user.id, user.settings.weekStart);
      await sendCoachMessage(env, user.id, threadId, content, stats, user.name);
      return redirect(`/coach?thread=${threadId}`);
    } catch (error) {
      if (error instanceof Response) {
        const detail = await error.text();
        return { error: detail || "The coach could not answer. Try again." };
      }
      return { error: "The coach could not answer. Try again in a moment." };
    }
  }

  return { error: "Unknown action." };
}

const starterPrompts = [
  {
    label: "Explain it simply",
    description: "One concrete analogy, then a small build.",
    content:
      "Explain the current topic as if I am new to it. Use one concrete analogy, then tell me what I should build to make it stick.",
  },
  {
    label: "Quiz me",
    description: "One question at a time, then correct it.",
    content:
      "Quiz me on this topic. Ask one question at a time, wait for my answer, and then correct it with the reasoning.",
  },
  {
    label: "Make a 7-day plan",
    description: "Thirty-minute sessions with one artifact.",
    content:
      "Turn this topic into a 7-day plan of 30-minute sessions. Each day needs one measurable artifact.",
  },
  {
    label: "Find my gaps",
    description: "Two diagnostic questions, no guessing.",
    content:
      "Based on my progress, what is the most likely gap in my understanding of this topic? Ask me two diagnostic questions.",
  },
];

export default function CoachPage({ loaderData }: Route.ComponentProps) {
  const { active, topic, mode, citationMap } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const messages = active?.messages ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="shrink-0 border-b border-line/60 bg-canvas pt-[env(safe-area-inset-top)] md:pt-0">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4 sm:h-16 sm:px-6">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Sparkles size={15} strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                {active?.thread.title ?? "New chat"}
              </h1>
              <span className="hidden sm:inline-flex">
                <Badge tone="outline">{modeLabel(mode)}</Badge>
              </span>
            </div>
            <p className="truncate text-[11px] text-muted">
              {topic ? (
                <>
                  Context:{" "}
                  <Link
                    to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
                    className="underline decoration-line underline-offset-2 hover:text-ink"
                  >
                    {topic.title}
                  </Link>
                </>
              ) : active ? (
                `${messages.length} ${messages.length === 1 ? "message" : "messages"}`
              ) : (
                "Grounded in your roadmap"
              )}
            </p>
          </div>

          <Link
            to="/coach/history"
            aria-label="Session history"
            title="Session history"
            className="inline-flex size-10 items-center justify-center gap-1.5 rounded-full text-xs text-muted transition-colors hover:bg-hover hover:text-ink sm:w-auto sm:px-3"
          >
            <History size={17} />
            <span className="hidden sm:inline">History</span>
          </Link>
          <Link
            to="/coach?new=1"
            aria-label="New chat"
            title="New chat"
            className="inline-flex size-10 items-center justify-center gap-1.5 rounded-full text-xs text-muted transition-colors hover:bg-hover hover:text-ink sm:w-auto sm:px-3"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">New chat</span>
          </Link>
        </div>
      </header>

      {actionData?.error ? (
        <div className="mx-auto w-full max-w-3xl px-4 pt-3 sm:px-6">
          <p
            role="alert"
            className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs text-danger"
          >
            {actionData.error}
          </p>
        </div>
      ) : null}

      <CoachScroll dependency={messages.length + (busy ? 1 : 0)}>
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-6">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Sparkles size={22} strokeWidth={1.9} />
            </div>
            <h2 className="mt-5 text-center text-xl font-semibold tracking-tight sm:text-2xl">
              {topic ? `Ask about ${topic.title}` : "What do you want to understand?"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-muted">
              A private coach grounded in the topics you are studying. Ask for an explanation, a
              quiz, a plan or a diagnosis.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <Form method="post" key={prompt.label}>
                  <input type="hidden" name="intent" value="send" />
                  {active ? <input type="hidden" name="threadId" value={active.thread.id} /> : null}
                  {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}
                  <input type="hidden" name="mode" value={mode} />
                  <input type="hidden" name="content" value={prompt.content} />
                  <button
                    type="submit"
                    disabled={busy}
                    className="group flex min-h-16 w-full flex-col items-start gap-0.5 rounded-xl border border-line bg-raised px-4 py-3 text-left transition-colors duration-fast hover:border-line-strong hover:bg-hover disabled:opacity-50"
                  >
                    <span className="text-sm font-medium">{prompt.label}</span>
                    <span className="text-xs leading-relaxed text-muted">{prompt.description}</span>
                  </button>
                </Form>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-6 sm:px-6 sm:py-8">
            {messages.map((message) => (
              <Message key={message.id} message={message} citationMap={citationMap} />
            ))}
            {busy ? (
              <div className="flex items-center gap-3 text-xs text-muted" aria-live="polite">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Sparkles size={13} className="animate-pulse" />
                </span>
                Thinking with your roadmap…
              </div>
            ) : null}
          </div>
        )}
      </CoachScroll>

      <div className="shrink-0 border-t border-line/60 bg-canvas">
        <CoachComposer threadId={active?.thread.id} topic={topic} mode={mode} busy={busy} />
      </div>
    </div>
  );
}

function Message({
  message,
  citationMap,
}: {
  message: { id: string; role: string; content: string; citations: string[] };
  citationMap: Record<string, { title: string; slug: string; roadmapSlug: string }>;
}) {
  if (message.role === "user") {
    return (
      <article className="flex justify-end">
        <div className="max-w-[86%] rounded-2xl bg-surface px-4 py-2.5 text-sm leading-relaxed text-ink">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </article>
    );
  }

  if (message.role === "system") {
    return <p className="text-center text-xs leading-relaxed text-muted">{message.content}</p>;
  }

  return (
    <article className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Sparkles size={13} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <MarkdownText content={message.content} />
        {message.citations.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Sources
            </span>
            {message.citations.map((id) => {
              const source = citationMap[id];
              if (!source) return null;
              return (
                <Link
                  key={id}
                  to={`/roadmaps/${source.roadmapSlug}/${source.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-raised px-2 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  <BookOpen size={10} />
                  {source.title}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function modeLabel(mode: string): string {
  if (mode === "plan") return "Study plan";
  if (mode === "quiz") return "Quiz";
  if (mode === "review") return "Review";
  return "Coach";
}
