import { all, first } from "~/lib/sql.server";
import { isoDate, startOfWeek } from "~/lib/utils";

export const TOPIC_STATUSES = ["not_started", "learning", "practiced", "mastered"] as const;
export type TopicStatus = (typeof TOPIC_STATUSES)[number];

export const STUDY_KINDS = ["read", "practice", "review", "coach", "video"] as const;
export type StudyKind = (typeof STUDY_KINDS)[number];

export interface LearningStats {
  totalTopics: number;
  completed: number;
  learning: number;
  mastered: number;
  minutesThisWeek: number;
  minutesToday: number;
  sessionsThisWeek: number;
  dueReviews: number;
  newCards: number;
  activeGoals: number;
  streak: number;
}

export interface NextTopic {
  id: string;
  title: string;
  slug: string;
  summary: string;
  estimatedMinutes: number;
  stageTitle: string;
  roadmapTitle: string;
  roadmapSlug: string;
  roadmapIcon: string;
  status: TopicStatus;
}

export interface ActivityItem {
  id: string;
  kind: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const nowIso = (): string => new Date().toISOString();

const STATS_TTL_MS = 15_000;
const statsCache = new Map<string, { expiresAt: number; promise: Promise<LearningStats> }>();

/** Clear cached stats after any action that changes progress, cards or goals. */
export function invalidateLearningStats(userId: string): void {
  statsCache.delete(userId);
}

export async function getLearningStats(
  env: Env,
  userId: string,
  weekStartsOn = 1,
): Promise<LearningStats> {
  const now = Date.now();
  const cached = statsCache.get(userId);
  if (cached && cached.expiresAt > now) return cached.promise;

  const promise = computeLearningStats(env, userId, weekStartsOn).catch((error: unknown) => {
    statsCache.delete(userId);
    throw error;
  });
  statsCache.set(userId, { expiresAt: now + STATS_TTL_MS, promise });
  return promise;
}

async function computeLearningStats(
  env: Env,
  userId: string,
  weekStartsOn = 1,
): Promise<LearningStats> {
  const now = nowIso();
  const weekStart = startOfWeek(new Date(), weekStartsOn).toISOString();
  const today = isoDate();
  const [totals, statusRows, cardRows, sessionRows, goalRow, dates] = await Promise.all([
    first<{ total: number }>(
      env.DB,
      `SELECT count(*) AS total
       FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE r.status IN ('guided', 'reference')`,
    ),
    all<{ status: string; count: number }>(
      env.DB,
      `SELECT coalesce(p.status, 'not_started') AS status, count(*) AS count
       FROM topics t
       JOIN roadmaps r ON r.id = t.roadmap_id
       LEFT JOIN user_topic_progress p ON p.topic_id = t.id AND p.user_id = ?
       WHERE r.status IN ('guided', 'reference')
       GROUP BY coalesce(p.status, 'not_started')`,
      [userId],
    ),
    first<{ due_reviews: number; new_cards: number }>(
      env.DB,
      `SELECT
         coalesce(sum(CASE WHEN rev.card_id IS NOT NULL AND rev.due_at <= ? THEN 1 ELSE 0 END), 0) AS due_reviews,
         coalesce(sum(CASE WHEN rev.card_id IS NULL THEN 1 ELSE 0 END), 0) AS new_cards
       FROM flashcards c
       LEFT JOIN flashcard_reviews rev ON rev.card_id = c.id AND rev.user_id = ?`,
      [now, userId],
    ),
    first<{ week_minutes: number; today_minutes: number; week_sessions: number }>(
      env.DB,
      `SELECT
         coalesce(sum(CASE WHEN started_at >= ? THEN minutes ELSE 0 END), 0) AS week_minutes,
         coalesce(sum(CASE WHEN substr(started_at, 1, 10) = ? THEN minutes ELSE 0 END), 0) AS today_minutes,
         coalesce(sum(CASE WHEN started_at >= ? THEN 1 ELSE 0 END), 0) AS week_sessions
       FROM study_sessions WHERE user_id = ?`,
      [weekStart, today, weekStart, userId],
    ),
    first<{ count: number }>(
      env.DB,
      "SELECT count(*) AS count FROM goals WHERE user_id = ? AND status = 'active'",
      [userId],
    ),
    all<{ day: string }>(
      env.DB,
      `SELECT DISTINCT substr(started_at, 1, 10) AS day
       FROM study_sessions WHERE user_id = ? AND started_at >= ?
       ORDER BY day DESC LIMIT 180`,
      [userId, new Date(Date.now() - 180 * 86_400_000).toISOString()],
    ),
  ]);

  const statusCounts = new Map(statusRows.map((row) => [row.status, row.count]));
  return {
    totalTopics: totals?.total ?? 0,
    completed: (statusCounts.get("practiced") ?? 0) + (statusCounts.get("mastered") ?? 0),
    learning: statusCounts.get("learning") ?? 0,
    mastered: statusCounts.get("mastered") ?? 0,
    minutesThisWeek: sessionRows?.week_minutes ?? 0,
    minutesToday: sessionRows?.today_minutes ?? 0,
    sessionsThisWeek: sessionRows?.week_sessions ?? 0,
    dueReviews: cardRows?.due_reviews ?? 0,
    newCards: cardRows?.new_cards ?? 0,
    activeGoals: goalRow?.count ?? 0,
    streak: calculateStreak(dates.map((row) => row.day)),
  };
}

export function calculateStreak(days: string[], now = new Date()): number {
  if (days.length === 0) return 0;
  const unique = [...new Set(days)].sort().reverse();
  const today = isoDate(now);
  const yesterday = isoDate(new Date(now.getTime() - 86_400_000));
  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 0;
  let cursor = new Date(`${unique[0]}T00:00:00.000Z`);
  for (const day of unique) {
    const expected = isoDate(cursor);
    if (day === expected) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86_400_000);
    } else if (day < expected) {
      break;
    }
  }
  return streak;
}

export async function getNextTopic(env: Env, userId: string): Promise<NextTopic | null> {
  return first<NextTopic>(
    env.DB,
    `SELECT t.id, t.title, t.slug, t.summary, t.estimated_minutes AS estimatedMinutes,
            s.title AS stageTitle, r.title AS roadmapTitle, r.slug AS roadmapSlug, r.icon AS roadmapIcon,
            coalesce(p.status, 'not_started') AS status
     FROM topics t
     JOIN roadmap_stages s ON s.id = t.stage_id
     JOIN roadmaps r ON r.id = t.roadmap_id
     LEFT JOIN user_topic_progress p ON p.topic_id = t.id AND p.user_id = ?
     WHERE r.status IN ('guided', 'reference')
       AND coalesce(p.status, 'not_started') NOT IN ('practiced', 'mastered')
     ORDER BY
       CASE WHEN p.status = 'learning' THEN 0 ELSE 1 END,
       CASE r.status WHEN 'guided' THEN 0 ELSE 1 END,
       r.sort_order, s.sort_order, t.sort_order
     LIMIT 1`,
    [userId],
  );
}

export async function getContinueTopics(env: Env, userId: string, limit = 4): Promise<NextTopic[]> {
  return all<NextTopic>(
    env.DB,
    `SELECT t.id, t.title, t.slug, t.summary, t.estimated_minutes AS estimatedMinutes,
            s.title AS stageTitle, r.title AS roadmapTitle, r.slug AS roadmapSlug, r.icon AS roadmapIcon,
            coalesce(p.status, 'not_started') AS status
     FROM topics t
     JOIN roadmap_stages s ON s.id = t.stage_id
     JOIN roadmaps r ON r.id = t.roadmap_id
     LEFT JOIN user_topic_progress p ON p.topic_id = t.id AND p.user_id = ?
     WHERE r.status IN ('guided', 'reference')
       AND coalesce(p.status, 'not_started') NOT IN ('practiced', 'mastered')
     ORDER BY
       CASE WHEN p.status = 'learning' THEN 0 ELSE 1 END,
       CASE r.status WHEN 'guided' THEN 0 ELSE 1 END,
       r.sort_order, s.sort_order, t.sort_order
     LIMIT ?`,
    [userId, limit],
  );
}

export async function getWeeklyActivity(
  env: Env,
  userId: string,
): Promise<Array<{ date: string; label: string; minutes: number; sessions: number }>> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 6);
  const rows = await all<{ day: string; minutes: number; sessions: number }>(
    env.DB,
    `SELECT substr(started_at, 1, 10) AS day, coalesce(sum(minutes), 0) AS minutes, count(*) AS sessions
     FROM study_sessions
     WHERE user_id = ? AND started_at >= ?
     GROUP BY day ORDER BY day`,
    [userId, start.toISOString()],
  );
  const byDay = new Map(rows.map((row) => [row.day, row]));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start.getTime() + index * 86_400_000);
    const day = isoDate(date);
    const row = byDay.get(day);
    return {
      date: day,
      label: date.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }),
      minutes: row?.minutes ?? 0,
      sessions: row?.sessions ?? 0,
    };
  });
}

export async function getRecentActivity(
  env: Env,
  userId: string,
  limit = 8,
): Promise<ActivityItem[]> {
  const rows = await all<{
    id: string;
    kind: string;
    entity_type: string | null;
    entity_id: string | null;
    metadata: string;
    created_at: string;
  }>(
    env.DB,
    `SELECT id, kind, entity_type, entity_id, metadata, created_at
     FROM activity_events WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit],
  );
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: safeJson(row.metadata),
    createdAt: row.created_at,
  }));
}

export function safeJson(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export interface DailyPlan {
  id: string;
  planDate: string;
  focusTopicId: string | null;
  targetMinutes: number;
  completedMinutes: number;
  status: string;
  focusTitle: string | null;
  focusSlug: string | null;
  roadmapSlug: string | null;
  roadmapTitle: string | null;
}

export async function getDailyPlan(env: Env, userId: string): Promise<DailyPlan | null> {
  return first<DailyPlan>(
    env.DB,
    `SELECT d.id, d.plan_date AS planDate, d.focus_topic_id AS focusTopicId,
            d.target_minutes AS targetMinutes, d.completed_minutes AS completedMinutes, d.status,
            t.title AS focusTitle, t.slug AS focusSlug, r.slug AS roadmapSlug, r.title AS roadmapTitle
     FROM daily_plans d
     LEFT JOIN topics t ON t.id = d.focus_topic_id
     LEFT JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE d.user_id = ? AND d.plan_date = ? LIMIT 1`,
    [userId, isoDate()],
  );
}

export async function ensureDailyPlan(
  env: Env,
  userId: string,
  targetMinutes: number,
): Promise<void> {
  const existing = await getDailyPlan(env, userId);
  if (existing) return;
  const next = await getNextTopic(env, userId);
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO daily_plans (id, user_id, plan_date, focus_topic_id, target_minutes, completed_minutes, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, 'planned', ?, ?)
     ON CONFLICT(user_id, plan_date) DO NOTHING`,
  )
    .bind(crypto.randomUUID(), userId, isoDate(), next?.id ?? null, targetMinutes, now, now)
    .run();
}

interface RecordStudyInput {
  topicId: string;
  kind: StudyKind;
  minutes: number;
  confidence?: number | undefined;
  notes?: string | undefined;
}

export interface RecordStudyResult {
  status: TopicStatus;
  topicCompleted: boolean;
  minutes: number;
}

export async function recordStudy(
  env: Env,
  userId: string,
  input: RecordStudyInput,
): Promise<RecordStudyResult> {
  const minutes = Math.min(480, Math.max(1, Math.round(input.minutes)));
  const now = nowIso();
  const today = isoDate();
  const existing = await first<{
    status: TopicStatus;
    confidence: number;
    minutes_spent: number;
    completed_at: string | null;
  }>(
    env.DB,
    "SELECT status, confidence, minutes_spent, completed_at FROM user_topic_progress WHERE user_id = ? AND topic_id = ?",
    [userId, input.topicId],
  );

  const previousStatus: TopicStatus = existing?.status ?? "not_started";
  const wasComplete = previousStatus === "practiced" || previousStatus === "mastered";
  let nextStatus: TopicStatus = previousStatus;
  if (previousStatus !== "mastered") {
    if (input.kind === "practice" || input.kind === "review") nextStatus = "practiced";
    else if (!wasComplete) nextStatus = "learning";
  }
  const topicCompleted = !wasComplete && (nextStatus === "practiced" || nextStatus === "mastered");
  const confidence =
    input.confidence !== undefined
      ? Math.min(5, Math.max(0, Math.round(input.confidence)))
      : (existing?.confidence ?? 0);
  const completedAt =
    nextStatus === "practiced" || nextStatus === "mastered"
      ? (existing?.completed_at ?? now)
      : null;

  const topic = await first<{ title: string; slug: string; roadmap_slug: string }>(
    env.DB,
    `SELECT t.title, t.slug, r.slug AS roadmap_slug
     FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id WHERE t.id = ?`,
    [input.topicId],
  );
  if (!topic) throw new Response("Topic not found", { status: 404 });

  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO user_topic_progress (user_id, topic_id, status, confidence, minutes_spent, last_studied_at, completed_at, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, topic_id) DO UPDATE SET
         status = CASE
           WHEN user_topic_progress.status IN ('practiced', 'mastered') THEN user_topic_progress.status
           WHEN excluded.status = 'practiced' THEN 'practiced'
           ELSE 'learning'
         END,
         confidence = excluded.confidence,
         minutes_spent = user_topic_progress.minutes_spent + excluded.minutes_spent,
         last_studied_at = excluded.last_studied_at,
         completed_at = coalesce(user_topic_progress.completed_at, excluded.completed_at),
         notes = coalesce(excluded.notes, user_topic_progress.notes),
         updated_at = excluded.updated_at`,
    ).bind(
      userId,
      input.topicId,
      nextStatus,
      confidence,
      minutes,
      now,
      completedAt,
      input.notes?.slice(0, 4000) ?? null,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO study_sessions (id, user_id, topic_id, kind, started_at, ended_at, minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      input.topicId,
      input.kind,
      now,
      now,
      minutes,
      input.notes?.slice(0, 1000) ?? null,
    ),
    env.DB.prepare(
      `INSERT INTO activity_events (id, user_id, kind, entity_type, entity_id, metadata, created_at)
       VALUES (?, ?, 'study', 'topic', ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      input.topicId,
      JSON.stringify({
        topic: topic.title,
        roadmap: topic.roadmap_slug,
        minutes,
        kind: input.kind,
        status: nextStatus,
      }),
      now,
    ),
    env.DB.prepare(
      `UPDATE goals SET current_value = min(target_value, current_value + ?), updated_at = ?
       WHERE user_id = ? AND status = 'active' AND unit = 'minutes'`,
    ).bind(minutes, now, userId),
    env.DB.prepare(
      `UPDATE daily_plans SET completed_minutes = completed_minutes + ?, updated_at = ?
       WHERE user_id = ? AND plan_date = ?`,
    ).bind(minutes, now, userId, today),
  ];

  if (topicCompleted) {
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
  return { status: nextStatus, topicCompleted, minutes };
}

export function parseStudyKind(value: FormDataEntryValue | null): StudyKind {
  return typeof value === "string" && (STUDY_KINDS as readonly string[]).includes(value)
    ? (value as StudyKind)
    : "read";
}
