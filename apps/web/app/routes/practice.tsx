import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Textarea } from "~/components/ui/field";
import { RichText } from "~/components/ui/rich-text";
import { PageHeader } from "~/components/ui/surfaces";
import { evaluatePractice, type PracticeTopic } from "~/features/practice/evaluate.server";
import {
  completePractice,
  countRecentAttempts,
  getLatestAttempt,
  getNextPracticeTopic,
  type PracticeAttempt,
  recordRevision,
} from "~/features/practice/practice.server";
import { getContinueTopics, getNextTopic } from "~/features/progress/progress.server";
import { getTopicDetail } from "~/features/roadmaps/roadmaps.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { pageMeta } from "~/lib/meta";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/practice";

export const meta = ({ data }: Route.MetaArgs) =>
  pageMeta(data?.detail ? `Practice: ${data.detail.topic.title}` : "Practice");

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const topicId = url.searchParams.get("topic");
  const retry = url.searchParams.get("retry") === "1";
  const queue = await getContinueTopics(env, user.id, 8);

  if (!topicId) {
    return {
      queue,
      detail: null,
      latestAttempt: null,
      nextTopic: null,
      retry,
      aiEnabled: user.settings.aiEnabled,
      aiModel: user.settings.aiModel ?? env.AI_MODEL,
    };
  }

  const topic = await env.DB.prepare(
    `SELECT t.slug, r.slug AS roadmapSlug
     FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id WHERE t.id = ?`,
  )
    .bind(topicId)
    .first<{ slug: string; roadmapSlug: string }>();
  if (!topic) throw new Response("Topic not found", { status: 404 });

  const detail = await getTopicDetail(env, user.id, topic.roadmapSlug, topic.slug);
  if (!detail) throw new Response("Topic not found", { status: 404 });

  return {
    queue,
    detail,
    latestAttempt: await getLatestAttempt(env, user.id, topicId),
    nextTopic:
      (await getNextPracticeTopic(env, user.id, topic.roadmapSlug, topicId)) ??
      (await getNextTopic(env, user.id)),
    retry,
    aiEnabled: user.settings.aiEnabled,
    aiModel: user.settings.aiModel ?? env.AI_MODEL,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const topicId = String(form.get("topicId") ?? "");
  const response = String(form.get("response") ?? "").trim();

  const back = (error: string) => ({
    error,
    response,
    passed: false,
    attempt: null,
    nextTopic: null,
  });
  if (!user.settings.aiEnabled) {
    return back("AI review is disabled. Enable it in Settings before practicing.");
  }
  if (!topicId) return back("Missing topic.");
  if (response.length < 40) {
    return back("Write at least a few complete sentences or paste the code you wrote.");
  }
  if ((await countRecentAttempts(env, user.id, topicId)) >= 6) {
    return back(
      "Too many reviews for this topic in a short time. Wait a few minutes and try again.",
    );
  }

  const topic = await env.DB.prepare(
    `SELECT t.id, t.title, t.summary, t.why_it_matters AS why, t.key_concepts AS concepts,
            t.practice, t.pitfalls, r.title AS roadmapTitle, r.slug AS roadmapSlug,
            s.title AS stageTitle
     FROM topics t
     JOIN roadmaps r ON r.id = t.roadmap_id
     JOIN roadmap_stages s ON s.id = t.stage_id
     WHERE t.id = ?`,
  )
    .bind(topicId)
    .first<{
      id: string;
      title: string;
      summary: string;
      why: string;
      concepts: string;
      practice: string;
      pitfalls: string;
      roadmapTitle: string;
      roadmapSlug: string;
      stageTitle: string;
    }>();
  if (!topic) return back("Topic not found.");

  const practiceTopic: PracticeTopic = {
    id: topic.id,
    title: topic.title,
    summary: topic.summary,
    why: topic.why,
    concepts: parseList(topic.concepts),
    practice: topic.practice,
    pitfalls: parseList(topic.pitfalls),
    roadmapTitle: topic.roadmapTitle,
    stageTitle: topic.stageTitle,
  };

  const review = await evaluatePractice(
    env,
    practiceTopic,
    response,
    user.settings.aiModel ?? env.AI_MODEL,
  );
  if (!review.ok) return back(review.error);

  const contextTopic = {
    id: topic.id,
    title: topic.title,
    roadmapSlug: topic.roadmapSlug,
  };

  if (review.review.verdict === "pass") {
    const attempt = await completePractice(env, user.id, contextTopic, review.review, response);
    return {
      passed: true,
      attempt,
      response,
      nextTopic:
        (await getNextPracticeTopic(env, user.id, topic.roadmapSlug, topic.id)) ??
        (await getNextTopic(env, user.id)),
      error: null,
    };
  }

  const attempt = await recordRevision(env, user.id, contextTopic, review.review, response);
  return { passed: false, attempt, response, nextTopic: null, error: null };
}

function parseList(value: string): string[] {
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
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const { queue, detail, latestAttempt, nextTopic, retry, aiEnabled } = loaderData;

  if (!detail) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <PageHeader
          eyebrow="Guided practice"
          title="Practice"
          description="A topic is complete only when the AI review passes. Pick a topic and show your work."
        />
        {queue.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-strong/70 bg-surface/50 px-6 py-10">
            <p className="text-base font-semibold">You are caught up.</p>
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">
              Every queued topic has passed its practice review. Add another roadmap or revisit a
              topic to go deeper.
            </p>
            <LinkButton to="/roadmaps" variant="secondary" className="mt-5">
              Browse roadmaps
            </LinkButton>
          </div>
        ) : (
          <ul className="divide-y divide-line/70 overflow-hidden rounded-lg border border-line bg-raised shadow-card">
            {queue.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/practice?topic=${item.id}`}
                  className="flex min-h-[4.5rem] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-hover"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] uppercase tracking-[0.14em] text-muted">
                      {item.roadmapTitle} / {item.stageTitle}
                    </span>
                    <span className="mt-1 block text-base font-medium">{item.title}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Clock3 size={14} /> {item.estimatedMinutes}m
                  </span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted">
                    <ArrowRight size={15} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const { topic, progress, cards } = detail;
  const isReference = topic.stageSlug === "extended-library";
  const attempt = actionData?.attempt ?? latestAttempt;
  const passed = actionData?.passed === true || (attempt?.verdict === "pass" && !retry);
  const revise = attempt?.verdict === "revise" && !passed;
  const error = actionData?.error ?? null;
  const defaultResponse = actionData?.response ?? latestAttempt?.response ?? "";
  const formKey = attempt?.id ?? "new";
  const effectiveNext = actionData?.nextTopic ?? nextTopic;
  const alreadyPassed = progress.status === "practiced" || progress.status === "mastered";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-raised px-4 text-sm font-medium text-muted shadow-sm transition-colors duration-fast hover:border-line-strong hover:bg-hover hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to {topic.title}
        </Link>
        {cards.total > 0 ? (
          <LinkButton to={`/flashcards?topic=${topic.id}`} variant="ghost" size="sm">
            {cards.total} {cards.total === 1 ? "card" : "cards"}
          </LinkButton>
        ) : null}
      </div>

      <header className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {isReference ? "Reference practice" : "Guided practice"} / {topic.stageTitle}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
          {topic.title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          {passed
            ? "Practice passed. You demonstrated the idea and this topic is now complete."
            : "Write your answer, explanation or code. The AI reviewer checks it against the task and the rubric; only a pass marks the topic complete."}
        </p>
        {isReference ? (
          <p className="max-w-2xl rounded-md bg-surface/60 px-4 py-3 text-sm leading-relaxed text-muted">
            This is an extra reference topic. Passing its practice does not change the guided
            percentage.
          </p>
        ) : null}
      </header>

      <section className="accent-band rounded-lg border border-line p-5 shadow-card md:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-ink">
            <Target size={17} />
          </span>
          <h2 className="text-base font-semibold">The task</h2>
        </div>
        <RichText text={topic.practice} className="mt-3 block text-base leading-relaxed" />
        {topic.keyConcepts.length > 0 ? (
          <div className="mt-4 border-t border-line/80 pt-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              A strong answer covers
            </p>
            <ul className="mt-2 space-y-2">
              {topic.keyConcepts.slice(0, 4).map((concept) => (
                <li key={concept} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/60"
                  />
                  {concept}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {!aiEnabled ? (
        <div className="rounded-lg border border-warning/25 bg-warning-soft px-4 py-3 text-sm">
          AI review is disabled. Enable it in Settings to complete practice.
          <Link to="/settings" className="ml-1 font-medium underline">
            Open settings
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {passed && attempt ? <ReviewPanel attempt={attempt} passed /> : null}

      {revise && attempt && !passed ? <ReviewPanel attempt={attempt} passed={false} /> : null}

      {passed ? (
        <div className="flex flex-wrap items-center gap-2">
          {effectiveNext && effectiveNext.id !== topic.id ? (
            <LinkButton to={`/practice?topic=${effectiveNext.id}`} icon={<ArrowRight size={14} />}>
              Next practice: {effectiveNext.title}
            </LinkButton>
          ) : (
            <LinkButton to={`/roadmaps/${topic.roadmapSlug}`} icon={<ArrowRight size={14} />}>
              Back to the path
            </LinkButton>
          )}
          <Link
            to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
            className="text-xs text-muted underline"
          >
            Review the topic
          </Link>
          <Link to={`/practice?topic=${topic.id}&retry=1`} className="text-xs text-muted underline">
            Practice again
          </Link>
        </div>
      ) : aiEnabled ? (
        <Form method="post" className="space-y-3">
          <input type="hidden" name="topicId" value={topic.id} />
          <label htmlFor="practice-response" className="text-sm font-medium">
            {revise ? "Revise your answer" : "Your answer"}
          </label>
          <Textarea
            key={formKey}
            id="practice-response"
            name="response"
            defaultValue={defaultResponse}
            className="min-h-64 text-base leading-relaxed"
            placeholder="Explain the idea in your own words, sketch the design, or paste the code you wrote. Be specific about the decisions and trade-offs."
            disabled={busy}
            required
            minLength={40}
            maxLength={10000}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-relaxed text-muted">
              The reviewer can take up to 30 seconds. Nothing is marked complete until it passes.
            </p>
            <Button
              type="submit"
              disabled={busy}
              icon={busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            >
              {busy ? "Reviewing..." : revise ? "Submit revision" : "Submit for review"}
            </Button>
          </div>
          {busy ? (
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">
              <Loader2 size={15} className="animate-spin" />
              The reviewer is reading your answer. This can take up to 30 seconds.
            </div>
          ) : null}
        </Form>
      ) : null}

      {alreadyPassed && !passed && !retry ? (
        <p className="text-xs text-muted">
          This topic already passed practice. Review the feedback above or practice again.
        </p>
      ) : null}

      <div className="border-t border-line pt-4">
        <Link to={`/roadmaps/${topic.roadmapSlug}`} className="text-xs text-muted underline">
          Back to the path
        </Link>
      </div>
    </div>
  );
}

function ReviewPanel({ attempt, passed }: { attempt: PracticeAttempt; passed: boolean }) {
  return (
    <section
      className={
        passed
          ? "space-y-4 rounded-lg border border-success/30 bg-success-soft p-5 md:p-6"
          : "space-y-4 rounded-lg border border-warning/30 bg-warning-soft p-5 md:p-6"
      }
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {passed ? (
            <Check size={19} className="text-success" />
          ) : (
            <CircleAlert size={19} className="text-warning" />
          )}
          <h2 className="text-base font-semibold">
            {passed ? "Practice passed" : "Needs revision"}
          </h2>
        </div>
        <Badge tone={passed ? "success" : "warning"}>{attempt.score}/100</Badge>
      </div>
      <p className="text-base leading-relaxed">{attempt.feedback}</p>
      {attempt.strengths.length > 0 ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            What worked
          </p>
          <ul className="mt-2 space-y-1.5">
            {attempt.strengths.map((item) => (
              <li key={item} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {attempt.gaps.length > 0 ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            What to fix
          </p>
          <ul className="mt-2 space-y-1.5">
            {attempt.gaps.map((item) => (
              <li key={item} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {attempt.nextStep ? (
        <p className="border-t border-line/80 pt-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-ink">Next:</span> {attempt.nextStep}
        </p>
      ) : null}
      <p className="text-xs text-muted">
        Reviewed {relativeDay(attempt.createdAt).toLowerCase()} · {attempt.model ?? "AI reviewer"}
      </p>
    </section>
  );
}
