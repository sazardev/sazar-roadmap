import type { TopicStatus } from "~/features/progress/progress.server";
import { all, first } from "~/lib/sql.server";

export interface RoadmapCard {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: string;
  estimatedHours: number;
  icon: string;
  status: string;
  contentStatus: string;
  sourceTopicCount: number;
  topicCount: number;
  stageCount: number;
  completedCount: number;
  learningCount: number;
}

export interface RoadmapTopic {
  id: string;
  slug: string;
  title: string;
  summary: string;
  stageId: string;
  estimatedMinutes: number;
  difficulty: string;
  sortOrder: number;
  status: TopicStatus;
  confidence: number;
  minutesSpent: number;
  resourceCount: number;
}

export interface RoadmapStage {
  id: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  estimatedHours: number;
  topics: RoadmapTopic[];
}

export interface RoadmapDetail {
  roadmap: RoadmapCard;
  stages: RoadmapStage[];
  nextTopic: RoadmapTopic | null;
  completedCount: number;
  totalTopics: number;
}

export interface TopicResource {
  id: string;
  title: string;
  url: string;
  kind: string;
  provider: string | null;
  bookmarked: boolean;
}

export interface TopicNote {
  id: string;
  title: string;
  bodyMd: string;
  updatedAt: string;
}

export interface TopicNeighbor {
  id: string;
  title: string;
  slug: string;
}

export interface TopicDetail {
  topic: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    whyItMatters: string;
    keyConcepts: string[];
    practice: string;
    pitfalls: string[];
    contentMd: string;
    sourceUrl: string | null;
    estimatedMinutes: number;
    difficulty: string;
    stageTitle: string;
    stageSlug: string;
    roadmapTitle: string;
    roadmapSlug: string;
    roadmapStatus: string;
    roadmapIcon: string;
  };
  progress: {
    status: TopicStatus;
    confidence: number;
    minutesSpent: number;
    lastStudiedAt: string | null;
    completedAt: string | null;
    notes: string | null;
  };
  resources: TopicResource[];
  notes: TopicNote[];
  cards: { total: number; due: number };
  previous: TopicNeighbor | null;
  next: TopicNeighbor | null;
  related: TopicNeighbor[];
  threads: Array<{ id: string; title: string; updatedAt: string }>;
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function listRoadmaps(
  env: Env,
  userId: string,
  filters: { q?: string; status?: string } = {},
): Promise<RoadmapCard[]> {
  const q = (filters.q ?? "").trim().toLowerCase();
  const status = filters.status && filters.status !== "all" ? filters.status : null;
  return all<RoadmapCard>(
    env.DB,
    `SELECT r.id, r.slug, r.title, r.tagline, r.description, r.level,
            r.estimated_hours AS estimatedHours, r.icon, r.status,
            r.content_status AS contentStatus, r.source_topic_count AS sourceTopicCount,
            (SELECT count(*) FROM topics t WHERE t.roadmap_id = r.id) AS topicCount,
            (SELECT count(*) FROM roadmap_stages s WHERE s.roadmap_id = r.id) AS stageCount,
            (SELECT count(*) FROM user_topic_progress p
               JOIN topics t ON t.id = p.topic_id
               WHERE t.roadmap_id = r.id AND p.user_id = ?
                 AND p.status IN ('practiced', 'mastered')) AS completedCount,
            (SELECT count(*) FROM user_topic_progress p
               JOIN topics t ON t.id = p.topic_id
               WHERE t.roadmap_id = r.id AND p.user_id = ? AND p.status = 'learning') AS learningCount
     FROM roadmaps r
     WHERE (? = '' OR lower(r.title) LIKE ? OR lower(r.description) LIKE ?)
       AND (? IS NULL OR r.status = ?)
     ORDER BY CASE r.status WHEN 'guided' THEN 0 WHEN 'reference' THEN 1 ELSE 2 END,
              CASE r.level WHEN 'beginner' THEN 0 WHEN 'intermediate' THEN 1 ELSE 2 END,
              r.sort_order, r.title`,
    [userId, userId, q, `%${q}%`, `%${q}%`, status, status],
  );
}

interface TopicRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  stageId: string;
  estimatedMinutes: number;
  difficulty: string;
  sortOrder: number;
  status: TopicStatus;
  confidence: number;
  minutesSpent: number;
  resourceCount: number;
}

export async function getRoadmapDetail(
  env: Env,
  userId: string,
  slug: string,
): Promise<RoadmapDetail | null> {
  const roadmap = await first<RoadmapCard>(
    env.DB,
    `SELECT r.id, r.slug, r.title, r.tagline, r.description, r.level,
            r.estimated_hours AS estimatedHours, r.icon, r.status,
            r.content_status AS contentStatus, r.source_topic_count AS sourceTopicCount,
            (SELECT count(*) FROM topics t WHERE t.roadmap_id = r.id) AS topicCount,
            (SELECT count(*) FROM roadmap_stages s WHERE s.roadmap_id = r.id) AS stageCount,
            (SELECT count(*) FROM user_topic_progress p
               JOIN topics t ON t.id = p.topic_id
               WHERE t.roadmap_id = r.id AND p.user_id = ?
                 AND p.status IN ('practiced', 'mastered')) AS completedCount,
            (SELECT count(*) FROM user_topic_progress p
               JOIN topics t ON t.id = p.topic_id
               WHERE t.roadmap_id = r.id AND p.user_id = ? AND p.status = 'learning') AS learningCount
     FROM roadmaps r WHERE r.slug = ? LIMIT 1`,
    [userId, userId, slug],
  );
  if (!roadmap) return null;

  const stageRows = await all<{
    id: string;
    slug: string;
    title: string;
    description: string;
    sortOrder: number;
    estimatedHours: number;
  }>(
    env.DB,
    `SELECT id, slug, title, description, sort_order AS sortOrder, estimated_hours AS estimatedHours
     FROM roadmap_stages WHERE roadmap_id = ? ORDER BY sort_order`,
    [roadmap.id],
  );

  const topicRows = await all<TopicRow>(
    env.DB,
    `SELECT t.id, t.slug, t.title, t.summary, t.stage_id AS stageId,
            t.estimated_minutes AS estimatedMinutes, t.difficulty, t.sort_order AS sortOrder,
            coalesce(p.status, 'not_started') AS status, coalesce(p.confidence, 0) AS confidence,
            coalesce(p.minutes_spent, 0) AS minutesSpent,
            (SELECT count(*) FROM resources res WHERE res.topic_id = t.id) AS resourceCount
     FROM topics t
     JOIN roadmap_stages s ON s.id = t.stage_id
     LEFT JOIN user_topic_progress p ON p.topic_id = t.id AND p.user_id = ?
     WHERE t.roadmap_id = ?
     ORDER BY s.sort_order, t.sort_order`,
    [userId, roadmap.id],
  );

  const byStage = new Map<string, RoadmapTopic[]>();
  for (const row of topicRows) {
    const list = byStage.get(row.stageId) ?? [];
    list.push(row);
    byStage.set(row.stageId, list);
  }

  const stages: RoadmapStage[] = stageRows
    .map((stage) => ({ ...stage, topics: byStage.get(stage.id) ?? [] }))
    .filter((stage) => stage.topics.length > 0);

  const nextTopic =
    topicRows.find((topic) => topic.status === "learning") ??
    topicRows.find((topic) => topic.status === "not_started") ??
    null;

  return {
    roadmap,
    stages,
    nextTopic,
    completedCount: roadmap.completedCount,
    totalTopics: roadmap.topicCount,
  };
}

export async function getTopicDetail(
  env: Env,
  userId: string,
  roadmapSlug: string,
  topicSlug: string,
): Promise<TopicDetail | null> {
  const topic = await first<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    whyItMatters: string;
    keyConcepts: string | null;
    practice: string;
    pitfalls: string | null;
    contentMd: string;
    sourceUrl: string | null;
    estimatedMinutes: number;
    difficulty: string;
    stageTitle: string;
    stageSlug: string;
    stageId: string;
    stageSort: number;
    topicSort: number;
    roadmapTitle: string;
    roadmapSlug: string;
    roadmapStatus: string;
    roadmapIcon: string;
  }>(
    env.DB,
    `SELECT t.id, t.slug, t.title, t.summary, t.why_it_matters AS whyItMatters,
            t.key_concepts AS keyConcepts, t.practice, t.pitfalls, t.content_md AS contentMd,
            t.source_url AS sourceUrl, t.estimated_minutes AS estimatedMinutes, t.difficulty,
            s.title AS stageTitle, s.slug AS stageSlug, s.id AS stageId, s.sort_order AS stageSort,
            t.sort_order AS topicSort, r.title AS roadmapTitle, r.slug AS roadmapSlug,
            r.status AS roadmapStatus, r.icon AS roadmapIcon
     FROM topics t
     JOIN roadmap_stages s ON s.id = t.stage_id
     JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE r.slug = ? AND t.slug = ?
     LIMIT 1`,
    [roadmapSlug, topicSlug],
  );
  if (!topic) return null;

  const [progress, resources, notes, cards, previous, next, related, threads] = await Promise.all([
    first<{
      status: TopicStatus;
      confidence: number;
      minutesSpent: number;
      lastStudiedAt: string | null;
      completedAt: string | null;
      notes: string | null;
    }>(
      env.DB,
      `SELECT status, confidence, minutes_spent AS minutesSpent, last_studied_at AS lastStudiedAt,
              completed_at AS completedAt, notes
       FROM user_topic_progress WHERE user_id = ? AND topic_id = ?`,
      [userId, topic.id],
    ),
    all<{
      id: string;
      title: string;
      url: string;
      kind: string;
      provider: string | null;
      bookmarked: number;
    }>(
      env.DB,
      `SELECT res.id, res.title, res.url, res.kind, res.provider,
              CASE WHEN b.resource_id IS NULL THEN 0 ELSE 1 END AS bookmarked
       FROM resources res
       LEFT JOIN bookmarks b ON b.resource_id = res.id AND b.user_id = ?
       WHERE res.topic_id = ? ORDER BY res.sort_order, res.title`,
      [userId, topic.id],
    ),
    all<{ id: string; title: string; bodyMd: string; updatedAt: string }>(
      env.DB,
      `SELECT id, title, body_md AS bodyMd, updated_at AS updatedAt
       FROM notes WHERE user_id = ? AND topic_id = ? ORDER BY updated_at DESC`,
      [userId, topic.id],
    ),
    first<{ total: number; due: number }>(
      env.DB,
      `SELECT count(*) AS total,
              coalesce(sum(CASE WHEN rev.card_id IS NULL OR rev.due_at <= ? THEN 1 ELSE 0 END), 0) AS due
       FROM flashcards c
       LEFT JOIN flashcard_reviews rev ON rev.card_id = c.id AND rev.user_id = ?
       WHERE c.topic_id = ?`,
      [new Date().toISOString(), userId, topic.id],
    ),
    first<{ id: string; title: string; slug: string }>(
      env.DB,
      `SELECT t.id, t.title, t.slug
       FROM topics t JOIN roadmap_stages s ON s.id = t.stage_id
       WHERE t.roadmap_id = (SELECT roadmap_id FROM topics WHERE id = ?)
         AND (s.sort_order < ? OR (s.sort_order = ? AND t.sort_order < ?))
       ORDER BY s.sort_order DESC, t.sort_order DESC LIMIT 1`,
      [topic.id, topic.stageSort, topic.stageSort, topic.topicSort],
    ),
    first<{ id: string; title: string; slug: string }>(
      env.DB,
      `SELECT t.id, t.title, t.slug
       FROM topics t JOIN roadmap_stages s ON s.id = t.stage_id
       WHERE t.roadmap_id = (SELECT roadmap_id FROM topics WHERE id = ?)
         AND (s.sort_order > ? OR (s.sort_order = ? AND t.sort_order > ?))
       ORDER BY s.sort_order ASC, t.sort_order ASC LIMIT 1`,
      [topic.id, topic.stageSort, topic.stageSort, topic.topicSort],
    ),
    all<{ id: string; title: string; slug: string }>(
      env.DB,
      `SELECT id, title, slug FROM topics
       WHERE stage_id = ? AND id != ? ORDER BY sort_order LIMIT 4`,
      [topic.stageId, topic.id],
    ),
    all<{ id: string; title: string; updatedAt: string }>(
      env.DB,
      `SELECT id, title, updated_at AS updatedAt FROM coach_threads
       WHERE user_id = ? AND topic_id = ? ORDER BY updated_at DESC LIMIT 3`,
      [userId, topic.id],
    ),
  ]);

  return {
    topic: {
      ...topic,
      keyConcepts: parseList(topic.keyConcepts),
      pitfalls: parseList(topic.pitfalls),
    },
    progress: progress ?? {
      status: "not_started",
      confidence: 0,
      minutesSpent: 0,
      lastStudiedAt: null,
      completedAt: null,
      notes: null,
    },
    resources: resources.map((resource) => ({
      ...resource,
      bookmarked: resource.bookmarked === 1,
    })),
    notes,
    cards: cards ?? { total: 0, due: 0 },
    previous,
    next,
    related,
    threads,
  };
}

export async function getRoadmapOptions(
  env: Env,
): Promise<Array<{ id: string; slug: string; title: string; status: string }>> {
  return all<{ id: string; slug: string; title: string; status: string }>(
    env.DB,
    `SELECT id, slug, title, status FROM roadmaps
     WHERE status IN ('guided', 'reference') ORDER BY sort_order, title`,
  );
}
