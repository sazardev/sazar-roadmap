import { ArrowRight, BookOpen, MessageSquarePlus, Sparkles, Trash2 } from "lucide-react";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { MarkdownText } from "~/components/markdown";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import {
  createThread,
  deleteThread,
  getSourcesByIds,
  getThread,
  listThreads,
  sendCoachMessage,
} from "~/features/coach/coach.server";
import { getLearningStats } from "~/features/progress/progress.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/coach";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.active?.thread.title ?? "Coach");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const requestedThread = url.searchParams.get("thread");
  const topicId = url.searchParams.get("topic");
  const isNew = url.searchParams.get("new") === "1";
  const mode = url.searchParams.get("mode") ?? "coach";

  const [threads, topic] = await Promise.all([
    listThreads(env, user.id),
    topicId
      ? env.DB.prepare(
          `SELECT t.id, t.title, t.slug, r.slug AS roadmapSlug, r.title AS roadmapTitle
           FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id WHERE t.id = ?`,
        )
          .bind(topicId)
          .first<{
            id: string;
            title: string;
            slug: string;
            roadmapSlug: string;
            roadmapTitle: string;
          }>()
      : Promise.resolve(null),
  ]);

  let active = requestedThread ? await getThread(env, user.id, requestedThread) : null;
  if (!active && !requestedThread && !isNew && threads[0]) {
    active = await getThread(env, user.id, threads[0].id);
  }
  if (requestedThread && !active) {
    throw new Response("Thread not found", { status: 404 });
  }

  const citationIds = new Set<string>();
  for (const message of active?.messages ?? []) {
    for (const id of message.citations) citationIds.add(id);
  }
  const sources = citationIds.size > 0 ? await getSourcesByIds(env, [...citationIds]) : [];
  const citationMap = Object.fromEntries(sources.map((source) => [source.id, source]));

  return {
    threads,
    active,
    topic,
    mode,
    citationMap,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "new") {
    const topicId = String(form.get("topicId") ?? "") || null;
    const id = await createThread(env, user.id, {
      title: "New session",
      topicId,
      mode: String(form.get("mode") ?? "coach"),
    });
    return redirect(`/coach?thread=${id}`);
  }

  if (intent === "delete") {
    const threadId = String(form.get("threadId") ?? "");
    if (threadId) await deleteThread(env, user.id, threadId);
    return redirect("/coach");
  }

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
      const stats = await getLearningStats(env, user.id);
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
    label: "Explain this simply",
    content:
      "Explain the current topic as if I am new to it. Use one concrete analogy, then tell me what I should build to make it stick.",
  },
  {
    label: "Quiz me",
    content:
      "Quiz me on this topic. Ask one question at a time, wait for my answer, and then correct it with the reasoning.",
  },
  {
    label: "Make a 7-day plan",
    content:
      "Turn this topic into a 7-day plan of 30-minute sessions. Each day needs one measurable artifact.",
  },
  {
    label: "Find my gaps",
    content:
      "Based on my progress, what is the most likely gap in my understanding of this topic? Ask me two diagnostic questions.",
  },
];

export default function CoachPage({ loaderData }: Route.ComponentProps) {
  const { threads, active, topic, mode, citationMap } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const messages = active?.messages ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI coach"
        title="Coach"
        description="A private sounding board grounded in the topics you are studying. It can explain, quiz, plan and point back to the path."
        actions={
          <Form method="post">
            <input type="hidden" name="intent" value="new" />
            {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}
            <Button type="submit" icon={<MessageSquarePlus size={15} />} disabled={busy}>
              New session
            </Button>
          </Form>
        }
      />

      {topic ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-raised px-5 py-4 text-sm shadow-card">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <BookOpen size={17} />
            </span>
            <span className="text-muted">Context:</span>
            <Link
              to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4"
            >
              {topic.title}
            </Link>
          </div>
          <LinkButton to="/coach" variant="ghost" size="sm">
            Clear context
          </LinkButton>
        </div>
      ) : null}

      {actionData?.error ? (
        <div className="rounded-lg border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {actionData.error}
        </div>
      ) : null}

      <div className="grid items-start gap-5 md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card>
            <CardHeader title="Sessions" description={`${threads.length} saved`} />
            <CardBody className="p-2">
              {threads.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted">No sessions yet.</p>
              ) : (
                <ul className="space-y-1">
                  {threads.map((thread) => (
                    <li key={thread.id}>
                      <Link
                        to={`/coach?thread=${thread.id}`}
                        className={`block min-h-14 rounded-md px-3 py-2.5 transition-colors duration-fast ${
                          active?.thread.id === thread.id
                            ? "bg-accent-soft text-accent"
                            : "hover:bg-hover"
                        }`}
                      >
                        <span className="line-clamp-1 text-sm font-medium">{thread.title}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                          <span>{relativeDay(thread.updatedAt)}</span>
                          <span>·</span>
                          <span>{thread.messageCount} messages</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="How to use it" />
            <CardBody className="space-y-2.5 text-sm leading-relaxed text-muted">
              <p>
                Ask for an explanation, a quiz or a plan. The coach retrieves the most relevant
                topics and cites them.
              </p>
              <p>
                It is not a search engine. If the answer is not in the path, ask it to say what is
                missing.
              </p>
            </CardBody>
          </Card>
        </aside>

        <Card className="flex min-h-[70vh] flex-col">
          <CardHeader
            title={active?.thread.title ?? "New session"}
            description={
              active
                ? `${active.thread.messageCount} messages · ${modeLabel(active.thread.mode)}`
                : "Start with a question, a plan or a quiz."
            }
            action={
              active ? (
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="threadId" value={active.thread.id} />
                  <button
                    type="submit"
                    aria-label="Delete session"
                    className="inline-flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </Form>
              ) : null
            }
          />

          <CardBody className="flex flex-1 flex-col gap-5">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center gap-6 py-8">
                <EmptyState
                  title="What do you want to understand?"
                  description="The coach works best with a topic in context and a specific question. Pick a starting point below or write your own."
                  icon={<Sparkles size={24} />}
                />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <Form method="post" key={prompt.label}>
                      <input type="hidden" name="intent" value="send" />
                      {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}
                      <input type="hidden" name="mode" value={mode} />
                      <input type="hidden" name="content" value={prompt.content} />
                      <button
                        type="submit"
                        disabled={busy}
                        className="flex min-h-14 w-full items-center justify-between gap-3 rounded-md border border-line bg-raised px-4 py-3 text-left text-sm font-medium shadow-sm transition-colors duration-fast hover:bg-hover disabled:opacity-50"
                      >
                        {prompt.label}
                        <ArrowRight size={15} className="text-muted" />
                      </button>
                    </Form>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                {messages.map((message) => (
                  <article key={message.id} className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-medium">
                        {message.role === "user" ? "You" : <Sparkles size={14} />}
                      </span>
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "You" : "Coach"}
                      </span>
                      <span className="text-xs text-muted">{relativeDay(message.createdAt)}</span>
                      {message.model ? (
                        <Badge tone="outline">{shortModel(message.model)}</Badge>
                      ) : null}
                    </div>
                    <div
                      className={
                        message.role === "user" ? "pl-10 text-base leading-relaxed" : "pl-10"
                      }
                    >
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <MarkdownText content={message.content} />
                      )}
                    </div>
                    {message.role === "assistant" && message.citations.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pl-10">
                        {message.citations.map((id) => {
                          const source = citationMap[id];
                          if (!source) return null;
                          return (
                            <Link
                              key={id}
                              to={`/roadmaps/${source.roadmapSlug}/${source.slug}`}
                              className="rounded-full border border-line bg-raised px-2.5 py-1 text-xs text-muted transition-colors hover:bg-hover hover:text-ink"
                            >
                              {source.title}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </article>
                ))}
                {busy ? (
                  <div className="flex items-center gap-2 pl-10 text-sm text-muted">
                    <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                    Thinking through the path...
                  </div>
                ) : null}
              </div>
            )}

            <Form
              method="post"
              className="sticky bottom-0 space-y-2.5 border-t border-line bg-canvas/95 pt-4 backdrop-blur"
            >
              <input type="hidden" name="intent" value="send" />
              {active ? <input type="hidden" name="threadId" value={active.thread.id} /> : null}
              {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}
              <input type="hidden" name="mode" value={mode} />
              <label htmlFor="coach-message" className="sr-only">
                Message the coach
              </label>
              <textarea
                id="coach-message"
                name="content"
                rows={3}
                placeholder="Ask a question, request a quiz or describe what you are building..."
                className="block w-full resize-y rounded-lg border border-line bg-raised px-4 py-3 text-base leading-relaxed shadow-sm outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 disabled:opacity-60"
                disabled={busy}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-relaxed text-muted">
                  Answers are grounded in retrieved topics and should be verified.
                </p>
                <Button type="submit" disabled={busy} icon={<ArrowRight size={15} />}>
                  {busy ? "Sending..." : "Send"}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function modeLabel(mode: string): string {
  if (mode === "plan") return "study plan";
  if (mode === "quiz") return "quiz";
  if (mode === "review") return "review";
  return "coaching";
}

function shortModel(model: string): string {
  return (
    model
      .replace(/^@cf\//, "")
      .split("/")
      .pop()
      ?.slice(0, 22) ?? model
  );
}
