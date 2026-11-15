import { Brain, Check, Clock3, GraduationCap, Sparkles } from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import { ProgressBar } from "~/components/ui/progress";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import { type ReviewRating, scheduleReview } from "~/features/flashcards/algorithm";
import {
  getDeckStats,
  getDueCards,
  getRecentAttempts,
  parseRating,
  reviewCard,
} from "~/features/flashcards/flashcards.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/flashcards";

export const meta = ({ data }: Route.MetaArgs) =>
  pageMeta(data?.topic ? `Flashcards: ${data.topic.title}` : "Flashcards");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const topicId = url.searchParams.get("topic");
  const reviewed = url.searchParams.get("reviewed");
  const nextInterval = url.searchParams.get("next");

  const [stats, cards, recent, topic] = await Promise.all([
    getDeckStats(env, user.id),
    getDueCards(env, user.id, { topicId, limit: 1 }),
    getRecentAttempts(env, user.id, 6),
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

  const card = cards[0] ?? null;
  const ratings = card
    ? (["again", "hard", "good", "easy"] as const).map((rating) => {
        const preview = scheduleReview(
          {
            easeFactor: card.easeFactor,
            intervalDays: card.intervalDays,
            repetitions: card.repetitions,
            lapses: card.lapses,
            state: card.state,
          },
          rating,
        );
        return { rating, label: preview.intervalLabel };
      })
    : [];

  return {
    stats,
    card,
    ratings,
    recent,
    topic,
    reviewed,
    nextInterval,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const form = await request.formData();
  const cardId = String(form.get("cardId") ?? "");
  const rating = parseRating(form.get("rating"));
  const topicId = String(form.get("topicId") ?? "");
  if (!cardId || !rating)
    return Response.json({ error: "Missing card or rating" }, { status: 400 });
  const result = reviewCard(getEnv(context), user.id, cardId, rating);
  const params = new URLSearchParams();
  if (topicId) params.set("topic", topicId);
  params.set("reviewed", rating);
  params.set("next", (await result).intervalLabel);
  return redirect(`/flashcards?${params.toString()}`);
}

const ratingLabels: Record<ReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

export default function FlashcardsPage({ loaderData }: Route.ComponentProps) {
  const { stats, card, ratings, recent, topic, reviewed, nextInterval } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const deckProgress =
    stats.total > 0 ? Math.round(((stats.total - stats.newCards) / stats.total) * 100) : 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Spaced review"
        title="Flashcards"
        description="Retrieval, not rereading. Each rating schedules the next encounter; “Again” returns in ten minutes, the rest by day."
        actions={
          <>
            <LinkButton
              to={topic ? `/coach?topic=${topic.id}&mode=quiz` : "/coach?mode=quiz"}
              variant="secondary"
              icon={<Sparkles size={15} />}
            >
              Ask for a quiz
            </LinkButton>
            <LinkButton to="/roadmaps" variant="secondary" icon={<GraduationCap size={15} />}>
              Study a topic
            </LinkButton>
          </>
        }
      />

      {reviewed ? (
        <div className="rounded-sm border border-success/30 bg-success/5 px-4 py-3 text-sm">
          Rated <strong>{ratingLabels[reviewed as ReviewRating] ?? reviewed}</strong>. Next review
          in <strong>{nextInterval ?? "a moment"}</strong>.
        </div>
      ) : null}

      {topic ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface px-4 py-3 text-sm">
          <span>
            <span className="text-muted">Filtered to </span>
            <Link
              to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
              className="font-medium underline"
            >
              {topic.title}
            </Link>
          </span>
          <Link to="/flashcards" className="text-xs text-muted underline">
            All cards
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <DeckStat label="Due now" value={stats.due} hint="Reviews plus new cards" />
        <DeckStat label="New" value={stats.newCards} hint="Never reviewed" />
        <DeckStat label="Learning" value={stats.learning} hint="Short interval" />
        <DeckStat label="Review" value={stats.review} hint="Long interval" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card id="review-card" className="flex min-h-[420px] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Brain size={14} strokeWidth={1.8} />
              <span className="font-medium text-ink">Review session</span>
              {card ? <Badge tone="outline">{card.state}</Badge> : null}
            </div>
            <span className="font-mono text-[10px] text-muted">
              {stats.due - 1 > 0 ? `${stats.due - 1} after this` : "last due card"}
            </span>
          </div>

          {card ? (
            <CardBody className="flex flex-1 flex-col gap-6 p-5 sm:p-7">
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {card.roadmapTitle} / {card.topicTitle}
                </p>
                <h2 className="max-w-3xl text-2xl font-semibold leading-snug tracking-tight">
                  {card.front}
                </h2>
                {card.hint ? (
                  <details className="text-sm text-muted">
                    <summary className="cursor-pointer text-xs underline decoration-line underline-offset-4">
                      Show hint
                    </summary>
                    <p className="mt-2 max-w-2xl leading-relaxed">{card.hint}</p>
                  </details>
                ) : null}
              </div>

              <details className="group flex-1">
                <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-sm border border-line px-3 text-xs font-medium transition-colors duration-fast hover:bg-hover [&::-webkit-details-marker]:hidden">
                  <Check size={13} />
                  Show answer
                </summary>
                <div className="mt-5 space-y-4 rounded-md border border-line bg-surface p-5">
                  <div className="space-y-1.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Answer
                    </p>
                    <p className="max-w-3xl text-[15px] leading-relaxed">{card.back}</p>
                  </div>
                  {card.explanation ? (
                    <div className="space-y-1.5 border-t border-line pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        Why it matters
                      </p>
                      <p className="max-w-3xl text-sm leading-relaxed text-muted">
                        {card.explanation}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <Link
                      to={`/roadmaps/${card.roadmapSlug}/${card.topicSlug}`}
                      className="text-xs underline"
                    >
                      Open topic
                    </Link>
                    <span className="text-muted">·</span>
                    <span className="text-xs text-muted">How well did you recall it?</span>
                  </div>
                  <Form method="post" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input type="hidden" name="cardId" value={card.id} />
                    {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}
                    {(["again", "hard", "good", "easy"] as const).map((rating) => {
                      const preview = ratings.find((item) => item.rating === rating);
                      return (
                        <button
                          key={rating}
                          type="submit"
                          name="rating"
                          value={rating}
                          disabled={busy}
                          className={`flex flex-col items-center gap-0.5 rounded-sm border px-3 py-2.5 text-sm transition-colors duration-fast hover:bg-hover disabled:opacity-50 ${
                            rating === "good" ? "border-ink" : "border-line"
                          }`}
                        >
                          <span
                            className={
                              rating === "again" ? "font-medium text-danger" : "font-medium"
                            }
                          >
                            {ratingLabels[rating]}
                          </span>
                          <span className="font-mono text-[9px] text-muted">{preview?.label}</span>
                        </button>
                      );
                    })}
                  </Form>
                  <p className="text-[10px] text-muted">
                    Rating updates the card, the activity log and any active cards goal. The next
                    card appears immediately.
                  </p>
                </div>
              </details>

              <div className="mt-auto flex items-center gap-3 border-t border-line pt-4 text-[11px] text-muted">
                <Clock3 size={12} />
                <span>Interval: {card.intervalDays > 0 ? `${card.intervalDays} days` : "new"}</span>
                <span>·</span>
                <span>Ease {card.easeFactor.toFixed(2)}</span>
                <span>·</span>
                <span>{card.repetitions} repetitions</span>
              </div>
            </CardBody>
          ) : (
            <CardBody className="flex flex-1 items-center justify-center p-8">
              <EmptyState
                title="All caught up"
                description={
                  stats.newCards > 0
                    ? "There are new cards available, but none matched this filter."
                    : "No cards are due. Come back after the next interval, or study a topic to add context."
                }
                icon={<Check size={22} />}
                action={
                  <div className="flex flex-wrap gap-2">
                    <LinkButton to="/roadmaps" variant="secondary" size="sm">
                      Browse topics
                    </LinkButton>
                    {topic ? (
                      <LinkButton to="/flashcards" variant="ghost" size="sm">
                        All cards
                      </LinkButton>
                    ) : null}
                  </div>
                }
              />
            </CardBody>
          )}
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader
              title="Deck health"
              description="How much of the deck has entered the schedule."
            />
            <CardBody className="space-y-4">
              <ProgressBar value={deckProgress} max={100} label="Cards in schedule" showValue />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted">Total</p>
                  <p className="font-mono text-lg">{stats.total}</p>
                </div>
                <div>
                  <p className="text-muted">Mature</p>
                  <p className="font-mono text-lg">{stats.review}</p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-muted">
                Mature cards have a long interval and are less likely to be forgotten. New cards are
                shown first so the deck does not stall.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent reviews" />
            <CardBody className="space-y-3 p-4">
              {recent.length === 0 ? (
                <p className="text-xs text-muted">No reviews yet.</p>
              ) : (
                recent.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="space-y-0.5 border-b border-line pb-2 last:border-0 last:pb-0"
                  >
                    <p className="line-clamp-1 text-xs">{attempt.front}</p>
                    <p className="text-[10px] text-muted">
                      {ratingLabels[attempt.rating as ReviewRating] ?? attempt.rating} ·{" "}
                      {relativeDay(attempt.reviewedAt)}
                    </p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="How the schedule works" />
            <CardBody className="space-y-2 text-[11px] leading-relaxed text-muted">
              <p>
                <span className="text-ink">Again</span> resets to a ten-minute relearning step.
              </p>
              <p>
                <span className="text-ink">Hard</span> grows the interval slowly and lowers ease.
              </p>
              <p>
                <span className="text-ink">Good</span> uses the current ease factor.
              </p>
              <p>
                <span className="text-ink">Easy</span> adds a bonus and raises ease.
              </p>
              <p className="pt-2">
                The algorithm is a small SM-2 variant, tested in the repository.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function DeckStat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <Card>
      <CardBody className="space-y-1 p-4">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-mono text-2xl font-medium tabular-nums">{value}</p>
        <p className="text-[10px] text-muted">{hint}</p>
      </CardBody>
    </Card>
  );
}
