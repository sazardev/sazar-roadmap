import { invalidateLearningStats, type NextTopic } from "~/features/progress/progress.server";
import { all, first } from "~/lib/sql.server";
import { isoDate } from "~/lib/utils";
import type { PracticeReview } from "./evaluate.server";

export interface PracticeAttempt {
  id: string;
  response: string;
  verdict: "pass" | "revise";
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  nextStep: string;
  model: string | null;
  createdAt: string;
}

interface AttemptRow {
  id: string;
  response: string;
  verdict: string;
  score: number;
  feedback: string;
  strengths: string;
  gaps: string;
  nextStep: string | null;
  model: string | null;
  createdAt: string;
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

function toAttempt(row: AttemptRow): PracticeAttempt {
  return {
    id: row.id,
    response: row.response,
    verdict: row.verdict === "pass" ? "pass" : "revise",
    score: row.score,
    feedback: row.feedback,
    strengths: parseList(row.strengths),
    gaps: parseList(row.gaps),
    nextStep: row.nextStep ?? "",
    model: row.model,
    createdAt: row.createdAt,
  };
}

export async function getLatestAttempt(
  env: Env,
  userId: string,
  topicId: string,
): Promise<PracticeAttempt | null> {
  const row = await first<AttemptRow>(
    env.DB,
    `SELECT id, response, verdict, score, feedback, strengths, gaps,
            next_step AS nextStep, model, created_at AS createdAt
     FROM practice_attempts
     WHERE user_id = ? AND topic_id = ?
     ORDER BY created_at DESC LIMIT 1`,
    [userId, topicId],
  );
  return row ? toAttempt(row) : null;
}

export async function countRecentAttempts(
  env: Env,
  userId: string,
  topicId: string,
  minutes = 10,
): Promise<number> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const row = await first<{ count: number }>(
    env.DB,
    `SELECT count(*) AS count FROM practice_attempts
     WHERE user_id = ? AND topic_id = ? AND created_at >= ?`,
    [userId, topicId, since],
  );
  return row?.count ?? 0;
}

export interface PracticeTopicContext {
  id: string;
  title: string;
  roadmapSlug: string;
}

export async function completePractice(
  env: Env,
  userId: string,
  topic: PracticeTopicContext,
  review: PracticeReview,
  response: string,
): Promise<PracticeAttempt> {
  const now = new Date().toISOString();
  const today = isoDate();
  const attemptId = crypto.randomUUID();
  const confidence = Math.max(1, Math.min(5, Math.round(review.score / 20)));
  const existing = await first<{ status: string }>(
    env.DB,
    "SELECT status FROM user_topic_progress WHERE user_id = ? AND topic_id = ?",
    [userId, topic.id],
  );
  const wasComplete = existing?.status === "practiced" || existing?.status === "mastered";

  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO practice_attempts
         (id, user_id, topic_id, response, verdict, score, feedback, strengths, gaps, next_step, model, created_at)
       VALUES (?, ?, ?, ?, 'pass', ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      attemptId,
      userId,
      topic.id,
      response.slice(0, 10_000),
      review.score,
      review.feedback,
      JSON.stringify(review.strengths),
      JSON.stringify(review.gaps),
      review.nextStep,
      review.model,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO user_topic_progress
         (user_id, topic_id, status, confidence, minutes_spent, last_studied_at, completed_at, updated_at)
       VALUES (?, ?, 'practiced', ?, 25, ?, ?, ?)
       ON CONFLICT(user_id, topic_id) DO UPDATE SET
         status = 'practiced',
         confidence = max(user_topic_progress.confidence, excluded.confidence),
         minutes_spent = user_topic_progress.minutes_spent + 25,
         last_studied_at = excluded.last_studied_at,
         completed_at = coalesce(user_topic_progress.completed_at, excluded.completed_at),
         updated_at = excluded.updated_at`,
    ).bind(userId, topic.id, confidence, now, now, now),
    env.DB.prepare(
      `INSERT INTO study_sessions (id, user_id, topic_id, kind, started_at, ended_at, minutes, notes)
       VALUES (?, ?, ?, 'practice', ?, ?, 25, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      topic.id,
      now,
      now,
      `AI-reviewed practice · score ${review.score}/100`,
    ),
    env.DB.prepare(
      `INSERT INTO activity_events (id, user_id, kind, entity_type, entity_id, metadata, created_at)
       VALUES (?, ?, 'practice_passed', 'topic', ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      topic.id,
      JSON.stringify({
        topic: topic.title,
        roadmap: topic.roadmapSlug,
        score: review.score,
        verdict: "pass",
      }),
      now,
    ),
    env.DB.prepare(
      `UPDATE goals SET current_value = min(target_value, current_value + 25), updated_at = ?
       WHERE user_id = ? AND status = 'active' AND unit = 'minutes'`,
    ).bind(now, userId),
    env.DB.prepare(
      `UPDATE daily_plans SET completed_minutes = completed_minutes + 25, updated_at = ?
       WHERE user_id = ? AND plan_date = ?`,
    ).bind(now, userId, today),
  ];

  if (!wasComplete) {
    statements.push(
      env.DB.prepare(
        `UPDATE goals SET current_value = min(target_value, current_value + 1), updated_at = ?
         WHERE user_id = ? AND status = 'active' AND unit = 'topics'`,
      ).bind(now, userId),
    );
  }
  statements.push(
    env.DB.prepare(
      `UPDATE goals SET status = 'completed', updated_at = ?
       WHERE user_id = ? AND status = 'active' AND current_value >= target_value`,
    ).bind(now, userId),
  );

  await env.DB.batch(statements);
  invalidateLearningStats(userId);

  return {
    id: attemptId,
    response,
    verdict: "pass",
    score: review.score,
    feedback: review.feedback,
    strengths: review.strengths,
    gaps: review.gaps,
    nextStep: review.nextStep,
    model: review.model,
    createdAt: now,
  };
}

export async function recordRevision(
  env: Env,
  userId: string,
  topic: PracticeTopicContext,
  review: PracticeReview,
  response: string,
): Promise<PracticeAttempt> {
  const now = new Date().toISOString();
  const attemptId = crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO practice_attempts
         (id, user_id, topic_id, response, verdict, score, feedback, strengths, gaps, next_step, model, created_at)
       VALUES (?, ?, ?, ?, 'revise', ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      attemptId,
      userId,
      topic.id,
      response.slice(0, 10_000),
      review.score,
      review.feedback,
      JSON.stringify(review.strengths),
      JSON.stringify(review.gaps),
      review.nextStep,
      review.model,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO user_topic_progress
         (user_id, topic_id, status, confidence, minutes_spent, last_studied_at, updated_at)
       VALUES (?, ?, 'learning', ?, 0, ?, ?)
       ON CONFLICT(user_id, topic_id) DO UPDATE SET
         status = CASE
           WHEN user_topic_progress.status IN ('practiced', 'mastered') THEN user_topic_progress.status
           ELSE 'learning'
         END,
         confidence = max(user_topic_progress.confidence, excluded.confidence),
         last_studied_at = excluded.last_studied_at,
         updated_at = excluded.updated_at`,
    ).bind(userId, topic.id, Math.max(1, Math.round(review.score / 20)), now, now),
    env.DB.prepare(
      `INSERT INTO activity_events (id, user_id, kind, entity_type, entity_id, metadata, created_at)
       VALUES (?, ?, 'practice_revision', 'topic', ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      topic.id,
      JSON.stringify({
        topic: topic.title,
        roadmap: topic.roadmapSlug,
        score: review.score,
        verdict: "revise",
      }),
      now,
    ),
  ]);
  invalidateLearningStats(userId);

  return {
    id: attemptId,
    response,
    verdict: "revise",
    score: review.score,
    feedback: review.feedback,
    strengths: review.strengths,
    gaps: review.gaps,
    nextStep: review.nextStep,
    model: review.model,
    createdAt: now,
  };
}

/** Prefer the next uncompleted topic in the same roadmap before jumping elsewhere. */
export async function getNextPracticeTopic(
  env: Env,
  userId: string,
  roadmapSlug: string,
  currentTopicId: string,
): Promise<NextTopic | null> {
  const current = await first<{ stage_sort: number; topic_sort: number }>(
    env.DB,
    `SELECT s.sort_order AS stage_sort, t.sort_order AS topic_sort
     FROM topics t JOIN roadmap_stages s ON s.id = t.stage_id
     WHERE t.id = ?`,
    [currentTopicId],
  );

  const select = `SELECT t.id, t.title, t.slug, t.summary, t.estimated_minutes AS estimatedMinutes,
                         s.title AS stageTitle, r.title AS roadmapTitle, r.slug AS roadmapSlug,
                         r.icon AS roadmapIcon, coalesce(p.status, 'not_started') AS status
                  FROM topics t
                  JOIN roadmap_stages s ON s.id = t.stage_id
                  JOIN roadmaps r ON r.id = t.roadmap_id
                  LEFT JOIN user_topic_progress p ON p.topic_id = t.id AND p.user_id = ?
                  WHERE r.slug = ?
                    AND coalesce(p.status, 'not_started') NOT IN ('practiced', 'mastered')`;

  if (current) {
    const next = await all<NextTopic>(
      env.DB,
      `${select}
       AND (s.sort_order > ? OR (s.sort_order = ? AND t.sort_order > ?))
       ORDER BY s.sort_order, t.sort_order LIMIT 1`,
      [userId, roadmapSlug, current.stage_sort, current.stage_sort, current.topic_sort],
    );
    if (next[0]) return next[0];
  }

  const firstInRoadmap = await all<NextTopic>(
    env.DB,
    `${select} ORDER BY s.sort_order, t.sort_order LIMIT 1`,
    [userId, roadmapSlug],
  );
  return firstInRoadmap[0] ?? null;
}
