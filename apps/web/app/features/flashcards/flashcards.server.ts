import { all, first } from "~/lib/sql.server";
import { isoDate } from "~/lib/utils";
import type { ReviewRating, ReviewState } from "./algorithm";
import { scheduleReview } from "./algorithm";

export interface DeckStats {
  total: number;
  due: number;
  newCards: number;
  learning: number;
  review: number;
}

export interface DueCard {
  id: string;
  front: string;
  back: string;
  hint: string | null;
  explanation: string | null;
  tags: string[];
  topicId: string;
  topicTitle: string;
  topicSlug: string;
  roadmapSlug: string;
  roadmapTitle: string;
  state: ReviewState["state"];
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: string;
}

interface CardRow {
  id: string;
  front: string;
  back: string;
  hint: string | null;
  explanation: string | null;
  tags: string;
  topic_id: string;
  topic_title: string;
  topic_slug: string;
  roadmap_slug: string;
  roadmap_title: string;
  state: string | null;
  ease_factor: number | null;
  interval_days: number | null;
  repetitions: number | null;
  lapses: number | null;
  due_at: string | null;
  last_reviewed_at: string | null;
}

function parseTags(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function toCard(row: CardRow): DueCard {
  return {
    id: row.id,
    front: row.front,
    back: row.back,
    hint: row.hint,
    explanation: row.explanation,
    tags: parseTags(row.tags),
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    topicSlug: row.topic_slug,
    roadmapSlug: row.roadmap_slug,
    roadmapTitle: row.roadmap_title,
    state: (row.state as ReviewState["state"] | null) ?? "new",
    easeFactor: row.ease_factor ?? 2.5,
    intervalDays: row.interval_days ?? 0,
    repetitions: row.repetitions ?? 0,
    lapses: row.lapses ?? 0,
    dueAt: row.due_at ?? new Date(0).toISOString(),
  };
}

export async function getDeckStats(env: Env, userId: string): Promise<DeckStats> {
  const row = await first<{
    total: number;
    due: number;
    new_cards: number;
    learning: number;
    review: number;
  }>(
    env.DB,
    `SELECT
       count(*) AS total,
       coalesce(sum(CASE WHEN rev.card_id IS NULL OR rev.due_at <= ? THEN 1 ELSE 0 END), 0) AS due,
       coalesce(sum(CASE WHEN rev.card_id IS NULL THEN 1 ELSE 0 END), 0) AS new_cards,
       coalesce(sum(CASE WHEN rev.state IN ('learning', 'relearning') THEN 1 ELSE 0 END), 0) AS learning,
       coalesce(sum(CASE WHEN rev.state = 'review' THEN 1 ELSE 0 END), 0) AS review
     FROM flashcards c
     LEFT JOIN flashcard_reviews rev ON rev.card_id = c.id AND rev.user_id = ?`,
    [new Date().toISOString(), userId],
  );
  return {
    total: row?.total ?? 0,
    due: row?.due ?? 0,
    newCards: row?.new_cards ?? 0,
    learning: row?.learning ?? 0,
    review: row?.review ?? 0,
  };
}

export async function getDueCards(
  env: Env,
  userId: string,
  options: { topicId?: string | null; limit?: number; includeNew?: boolean } = {},
): Promise<DueCard[]> {
  const limit = Math.min(50, Math.max(1, options.limit ?? 1));
  const topicId = options.topicId ?? null;
  const includeNew = options.includeNew ?? true;
  const rows = await all<CardRow>(
    env.DB,
    `SELECT c.id, c.front, c.back, c.hint, c.explanation, c.tags,
            t.id AS topic_id, t.title AS topic_title, t.slug AS topic_slug,
            r.slug AS roadmap_slug, r.title AS roadmap_title,
            rev.state, rev.ease_factor, rev.interval_days, rev.repetitions, rev.lapses,
            rev.due_at, rev.last_reviewed_at
     FROM flashcards c
     JOIN topics t ON t.id = c.topic_id
     JOIN roadmaps r ON r.id = t.roadmap_id
     LEFT JOIN flashcard_reviews rev ON rev.card_id = c.id AND rev.user_id = ?
     WHERE (? IS NULL OR t.id = ?)
       AND (
         (rev.card_id IS NOT NULL AND rev.due_at <= ?)
         OR (? = 1 AND rev.card_id IS NULL)
       )
     ORDER BY
       CASE WHEN rev.card_id IS NULL THEN 1 ELSE 0 END,
       rev.due_at ASC,
       c.id ASC
     LIMIT ?`,
    [userId, topicId, topicId, new Date().toISOString(), includeNew ? 1 : 0, limit],
  );
  return rows.map(toCard);
}

export async function getTopicCards(env: Env, userId: string, topicId: string): Promise<DueCard[]> {
  const rows = await all<CardRow>(
    env.DB,
    `SELECT c.id, c.front, c.back, c.hint, c.explanation, c.tags,
            t.id AS topic_id, t.title AS topic_title, t.slug AS topic_slug,
            r.slug AS roadmap_slug, r.title AS roadmap_title,
            rev.state, rev.ease_factor, rev.interval_days, rev.repetitions, rev.lapses,
            rev.due_at, rev.last_reviewed_at
     FROM flashcards c
     JOIN topics t ON t.id = c.topic_id
     JOIN roadmaps r ON r.id = t.roadmap_id
     LEFT JOIN flashcard_reviews rev ON rev.card_id = c.id AND rev.user_id = ?
     WHERE t.id = ? ORDER BY c.id`,
    [userId, topicId],
  );
  return rows.map(toCard);
}

export async function getRecentAttempts(
  env: Env,
  userId: string,
  limit = 8,
): Promise<
  Array<{
    id: string;
    rating: string;
    reviewedAt: string;
    front: string;
    topicTitle: string;
    topicSlug: string;
    roadmapSlug: string;
  }>
> {
  return all<{
    id: string;
    rating: string;
    reviewedAt: string;
    front: string;
    topicTitle: string;
    topicSlug: string;
    roadmapSlug: string;
  }>(
    env.DB,
    `SELECT a.id, a.rating, a.reviewed_at AS reviewedAt, c.front,
            t.title AS topicTitle, t.slug AS topicSlug, r.slug AS roadmapSlug
     FROM flashcard_attempts a
     JOIN flashcards c ON c.id = a.card_id
     JOIN topics t ON t.id = c.topic_id
     JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE a.user_id = ? ORDER BY a.reviewed_at DESC LIMIT ?`,
    [userId, limit],
  );
}

export function parseRating(value: FormDataEntryValue | null): ReviewRating | null {
  return value === "again" || value === "hard" || value === "good" || value === "easy"
    ? value
    : null;
}

export interface ReviewResult {
  rating: ReviewRating;
  dueAt: string;
  intervalLabel: string;
  state: ReviewState["state"];
}

export async function reviewCard(
  env: Env,
  userId: string,
  cardId: string,
  rating: ReviewRating,
  elapsedMs?: number,
): Promise<ReviewResult> {
  const card = await first<{
    id: string;
    front: string;
    topic_title: string;
    roadmap_slug: string;
    ease_factor: number | null;
    interval_days: number | null;
    repetitions: number | null;
    lapses: number | null;
    state: string | null;
  }>(
    env.DB,
    `SELECT c.id, c.front, t.title AS topic_title, r.slug AS roadmap_slug,
            rev.ease_factor, rev.interval_days, rev.repetitions, rev.lapses, rev.state
     FROM flashcards c
     JOIN topics t ON t.id = c.topic_id
     JOIN roadmaps r ON r.id = t.roadmap_id
     LEFT JOIN flashcard_reviews rev ON rev.card_id = c.id AND rev.user_id = ?
     WHERE c.id = ?`,
    [userId, cardId],
  );
  if (!card) throw new Response("Card not found", { status: 404 });

  const current: ReviewState = {
    easeFactor: card.ease_factor ?? 2.5,
    intervalDays: card.interval_days ?? 0,
    repetitions: card.repetitions ?? 0,
    lapses: card.lapses ?? 0,
    state: (card.state as ReviewState["state"] | null) ?? "new",
  };
  const next = scheduleReview(current, rating);
  const now = new Date().toISOString();
  const today = isoDate();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO flashcard_reviews
         (user_id, card_id, ease_factor, interval_days, repetitions, lapses, state, due_at, last_reviewed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, card_id) DO UPDATE SET
         ease_factor = excluded.ease_factor,
         interval_days = excluded.interval_days,
         repetitions = excluded.repetitions,
         lapses = excluded.lapses,
         state = excluded.state,
         due_at = excluded.due_at,
         last_reviewed_at = excluded.last_reviewed_at,
         updated_at = excluded.updated_at`,
    ).bind(
      userId,
      cardId,
      next.easeFactor,
      next.intervalDays,
      next.repetitions,
      next.lapses,
      next.state,
      next.dueAt,
      now,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO flashcard_attempts (id, user_id, card_id, rating, reviewed_at, elapsed_ms)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), userId, cardId, rating, now, elapsedMs ?? null),
    env.DB.prepare(
      `INSERT INTO activity_events (id, user_id, kind, entity_type, entity_id, metadata, created_at)
       VALUES (?, ?, 'review', 'flashcard', ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      cardId,
      JSON.stringify({ card: card.front, topic: card.topic_title, rating }),
      now,
    ),
    env.DB.prepare(
      `UPDATE goals SET current_value = min(target_value, current_value + 1), updated_at = ?
       WHERE user_id = ? AND status = 'active' AND unit = 'cards'`,
    ).bind(now, userId),
    env.DB.prepare(
      `UPDATE goals SET status = 'completed', updated_at = ?
       WHERE user_id = ? AND status = 'active' AND current_value >= target_value`,
    ).bind(now, userId),
    env.DB.prepare(
      `UPDATE daily_plans SET updated_at = ? WHERE user_id = ? AND plan_date = ?`,
    ).bind(now, userId, today),
  ]);

  return {
    rating,
    dueAt: next.dueAt,
    intervalLabel: next.intervalLabel,
    state: next.state,
  };
}
