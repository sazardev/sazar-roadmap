import { ArrowRight, Brain, Check, Clock3, Lightbulb, Sparkles } from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Select, Textarea } from "~/components/ui/field";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import { getContinueTopics, recordStudy } from "~/features/progress/progress.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/practice";

export const meta = ({ data }: Route.MetaArgs) => pageMeta(data?.topic?.title ?? "Practice");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const topicId = url.searchParams.get("topic");
  const done = url.searchParams.get("done") === "1";

  const [queue, sessionRows, topic, progress] = await Promise.all([
    getContinueTopics(env, user.id, 8),
    env.DB.prepare(
      `SELECT s.id, s.minutes, s.notes, s.started_at AS startedAt, t.title, t.slug, r.slug AS roadmapSlug
       FROM study_sessions s
       JOIN topics t ON t.id = s.topic_id
       JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE s.user_id = ? AND s.kind = 'practice'
       ORDER BY s.started_at DESC LIMIT 6`,
    )
      .bind(user.id)
      .all<{
        id: string;
        minutes: number;
        notes: string | null;
        startedAt: string;
        title: string;
        slug: string;
        roadmapSlug: string;
      }>(),
    topicId
      ? env.DB.prepare(
          `SELECT t.id, t.title, t.slug, t.summary, t.why_it_matters AS why, t.key_concepts AS concepts,
                  t.practice, t.estimated_minutes AS estimatedMinutes, t.difficulty,
                  r.slug AS roadmapSlug, r.title AS roadmapTitle, s.title AS stageTitle
           FROM topics t
           JOIN roadmaps r ON r.id = t.roadmap_id
           JOIN roadmap_stages s ON s.id = t.stage_id
           WHERE t.id = ?`,
        )
          .bind(topicId)
          .first<{
            id: string;
            title: string;
            slug: string;
            summary: string;
            why: string;
            concepts: string;
            practice: string;
            estimatedMinutes: number;
            difficulty: string;
            roadmapSlug: string;
            roadmapTitle: string;
            stageTitle: string;
          }>()
      : Promise.resolve(null),
    topicId
      ? env.DB.prepare(
          "SELECT status, confidence, minutes_spent AS minutesSpent FROM user_topic_progress WHERE user_id = ? AND topic_id = ?",
        )
          .bind(user.id, topicId)
          .first<{ status: string; confidence: number; minutesSpent: number }>()
      : Promise.resolve(null),
  ]);

  return {
    queue,
    sessions: sessionRows.results ?? [],
    topic,
    progress,
    done,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const form = await request.formData();
  const topicId = String(form.get("topicId") ?? "");
  const minutes = Number(form.get("minutes") ?? 25);
  const confidence = Number(form.get("confidence") ?? 3);
  const notes = String(form.get("notes") ?? "").trim();
  if (!topicId) return Response.json({ error: "Missing topic" }, { status: 400 });
  await recordStudy(getEnv(context), user.id, {
    topicId,
    kind: "practice",
    minutes: Number.isFinite(minutes) ? minutes : 25,
    confidence: Number.isFinite(confidence) ? confidence : 3,
    notes: notes || undefined,
  });
  return redirect(`/practice?topic=${encodeURIComponent(topicId)}&done=1`);
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

export default function PracticePage({ loaderData }: Route.ComponentProps) {
  const { queue, sessions, topic, progress, done } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const concepts = topic ? parseConcepts(topic.concepts) : [];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Deliberate practice"
        title="Practice"
        description="A prompt, a blank page and a self-check. Build the smallest artifact that proves you can use the idea, then log what changed."
        actions={
          <LinkButton
            to={topic ? `/coach?topic=${topic.id}` : "/coach"}
            variant="secondary"
            icon={<Sparkles size={15} />}
          >
            Ask the coach
          </LinkButton>
        }
      />

      {done ? (
        <div className="rounded-sm border border-success/30 bg-success/5 px-4 py-3 text-sm">
          Practice logged. The topic moved to practiced, the session is in your activity and the
          weekly goal was updated.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {topic ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <Link to="/practice" className="underline">
                  Practice
                </Link>
                <span>/</span>
                <Link to={`/roadmaps/${topic.roadmapSlug}`} className="underline">
                  {topic.roadmapTitle}
                </Link>
                <span>/</span>
                <span>{topic.stageTitle}</span>
              </div>

              <Card>
                <CardHeader
                  title={topic.title}
                  description={topic.summary}
                  action={<Badge tone="outline">{topic.estimatedMinutes} min</Badge>}
                />
                <CardBody className="space-y-5">
                  <div className="rounded-md border border-line bg-surface p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Practice prompt
                    </p>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed">{topic.practice}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Work without looking</p>
                    <p className="text-xs leading-relaxed text-muted">
                      Explain the idea, sketch the design or write the code. The point is to produce
                      something you can inspect, not to feel familiar.
                    </p>
                    <Form method="post" className="space-y-3">
                      <input type="hidden" name="topicId" value={topic.id} />
                      <label htmlFor="practice-notes" className="sr-only">
                        Your practice notes
                      </label>
                      <Textarea
                        id="practice-notes"
                        name="notes"
                        className="min-h-40"
                        placeholder="What did you build or explain? What decision did you make? What is still fuzzy?"
                      />
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="space-y-1 text-xs text-muted">
                          <span className="block">Minutes</span>
                          <Select name="minutes" defaultValue="25" className="h-9 w-28">
                            {[10, 15, 25, 45, 60].map((minutes) => (
                              <option key={minutes} value={minutes}>
                                {minutes} min
                              </option>
                            ))}
                          </Select>
                        </label>
                        <label className="space-y-1 text-xs text-muted">
                          <span className="block">Confidence after</span>
                          <Select
                            name="confidence"
                            defaultValue={String(progress?.confidence || 3)}
                            className="h-9 w-28"
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <option key={value} value={value}>
                                {value}/5
                              </option>
                            ))}
                          </Select>
                        </label>
                        <Button type="submit" size="sm" disabled={busy} icon={<Check size={13} />}>
                          Log practice
                        </Button>
                      </div>
                    </Form>
                  </div>

                  <details className="rounded-md border border-line">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      <Lightbulb size={14} className="text-muted" />
                      Reveal the model answer
                    </summary>
                    <div className="space-y-4 border-t border-line px-4 py-4">
                      <section className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Summary
                        </h3>
                        <p className="text-sm leading-relaxed">{topic.summary}</p>
                      </section>
                      <section className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Why it matters
                        </h3>
                        <p className="text-sm leading-relaxed">{topic.why}</p>
                      </section>
                      <section className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Key concepts
                        </h3>
                        <ul className="space-y-1.5">
                          {concepts.map((concept) => (
                            <li key={concept} className="flex gap-2 text-sm leading-relaxed">
                              <span
                                aria-hidden="true"
                                className="mt-2 size-1 shrink-0 rounded-full bg-line-strong"
                              />
                              {concept}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </details>

                  <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4 text-xs text-muted">
                    <span>
                      Current status:{" "}
                      <strong className="text-ink">{progress?.status ?? "not started"}</strong>
                    </span>
                    <span>·</span>
                    <span>{progress?.minutesSpent ?? 0} minutes logged</span>
                    <Link
                      to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
                      className="ml-auto underline"
                    >
                      Open full topic
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader
                title="Pick a practice target"
                description="Questions are more useful than a vague review session."
              />
              <CardBody className="p-0">
                {queue.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      title="Nothing queued"
                      description="You have practiced everything in the guided paths. Pick a reference library or ask the coach for a harder exercise."
                      action={
                        <LinkButton to="/roadmaps" variant="secondary" size="sm">
                          Browse roadmaps
                        </LinkButton>
                      }
                      icon={<Brain size={20} />}
                    />
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {queue.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/practice?topic=${item.id}`}
                          className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-fast hover:bg-hover"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] uppercase tracking-[0.14em] text-muted">
                              {item.roadmapTitle} / {item.stageTitle}
                            </span>
                            <span className="mt-0.5 block text-sm font-medium">{item.title}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                            <Clock3 size={11} /> {item.estimatedMinutes}m
                          </span>
                          <ArrowRight size={14} className="text-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Recent practice"
              description="What you actually produced, in order."
            />
            <CardBody className="p-0">
              {sessions.length === 0 ? (
                <p className="p-5 text-sm text-muted">No practice sessions logged yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {sessions.map((session) => (
                    <li key={session.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                      <Check size={14} className="mt-0.5 shrink-0 text-success" />
                      <span className="min-w-0 flex-1">
                        <Link
                          to={`/roadmaps/${session.roadmapSlug}/${session.slug}`}
                          className="font-medium underline decoration-line underline-offset-4"
                        >
                          {session.title}
                        </Link>
                        <span className="mt-0.5 block line-clamp-2 text-xs text-muted">
                          {session.notes || "No notes saved."}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] text-muted">
                        {session.minutes}m · {relativeDay(session.startedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="The loop" description="Four steps, no more." />
            <CardBody className="space-y-3 text-xs leading-relaxed text-muted">
              <Step number="01" title="Predict">
                Write what you think will happen before you start.
              </Step>
              <Step number="02" title="Build">
                Make the smallest artifact that can fail.
              </Step>
              <Step number="03" title="Inspect">
                Compare the result with the mental model. Name the gap.
              </Step>
              <Step number="04" title="Log">
                Record minutes, confidence and the next question.
              </Step>
            </CardBody>
          </Card>

          {topic ? (
            <Card>
              <CardHeader title="Related" />
              <CardBody className="space-y-2">
                <Link
                  to={`/flashcards?topic=${topic.id}`}
                  className="block rounded-sm px-2 py-2 text-sm text-muted hover:bg-hover hover:text-ink"
                >
                  Review cards for this topic
                </Link>
                <Link
                  to={`/coach?topic=${topic.id}&mode=quiz`}
                  className="block rounded-sm px-2 py-2 text-sm text-muted hover:bg-hover hover:text-ink"
                >
                  Ask for a quiz
                </Link>
                <Link
                  to={`/notes?topic=${topic.id}`}
                  className="block rounded-sm px-2 py-2 text-sm text-muted hover:bg-hover hover:text-ink"
                >
                  Write a topic note
                </Link>
              </CardBody>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-[10px] text-muted">{number}</span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p>{children}</p>
      </div>
    </div>
  );
}
