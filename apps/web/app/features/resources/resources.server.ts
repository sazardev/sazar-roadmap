import { all, first } from "~/lib/sql.server";

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  kind: string;
  provider: string | null;
  description: string | null;
  estimatedMinutes: number | null;
  isFree: boolean;
  topicId: string | null;
  topicTitle: string | null;
  topicSlug: string | null;
  roadmapSlug: string | null;
  roadmapTitle: string | null;
  bookmarked: boolean;
}

export interface ResourceFilters {
  q?: string;
  kind?: string;
  roadmap?: string;
  saved?: boolean;
  page?: number;
  limit?: number;
}

const PAGE_SIZE = 24;

export async function listResources(
  env: Env,
  userId: string,
  filters: ResourceFilters = {},
): Promise<{ items: ResourceItem[]; total: number; page: number; pages: number }> {
  const q = (filters.q ?? "").trim().toLowerCase();
  const kind = filters.kind && filters.kind !== "all" ? filters.kind : null;
  const roadmap = filters.roadmap && filters.roadmap !== "all" ? filters.roadmap : null;
  const saved = filters.saved ? 1 : 0;
  const limit = Math.min(60, Math.max(1, filters.limit ?? PAGE_SIZE));
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * limit;

  const where = `WHERE (? = '' OR lower(res.title) LIKE ? OR lower(res.provider) LIKE ? OR lower(t.title) LIKE ?)
       AND (? IS NULL OR res.kind = ?)
       AND (? IS NULL OR r.slug = ?)
       AND (? = 0 OR b.resource_id IS NOT NULL)`;
  const bindings = [q, `%${q}%`, `%${q}%`, `%${q}%`, kind, kind, roadmap, roadmap, saved];

  const count = await first<{ total: number }>(
    env.DB,
    `SELECT count(*) AS total
     FROM resources res
     LEFT JOIN topics t ON t.id = res.topic_id
     LEFT JOIN roadmaps r ON r.id = coalesce(res.roadmap_id, t.roadmap_id)
     LEFT JOIN bookmarks b ON b.resource_id = res.id AND b.user_id = ?
     ${where}`,
    [userId, ...bindings],
  );
  const items = await all<{
    id: string;
    title: string;
    url: string;
    kind: string;
    provider: string | null;
    description: string | null;
    estimatedMinutes: number | null;
    isFree: number;
    topicId: string | null;
    topicTitle: string | null;
    topicSlug: string | null;
    roadmapSlug: string | null;
    roadmapTitle: string | null;
    bookmarked: number;
  }>(
    env.DB,
    `SELECT res.id, res.title, res.url, res.kind, res.provider, res.description,
            res.estimated_minutes AS estimatedMinutes, res.is_free AS isFree,
            t.id AS topicId, t.title AS topicTitle, t.slug AS topicSlug,
            r.slug AS roadmapSlug, r.title AS roadmapTitle,
            CASE WHEN b.resource_id IS NULL THEN 0 ELSE 1 END AS bookmarked
     FROM resources res
     LEFT JOIN topics t ON t.id = res.topic_id
     LEFT JOIN roadmaps r ON r.id = coalesce(res.roadmap_id, t.roadmap_id)
     LEFT JOIN bookmarks b ON b.resource_id = res.id AND b.user_id = ?
     ${where}
     ORDER BY CASE res.kind WHEN 'docs' THEN 0 WHEN 'article' THEN 1 WHEN 'video' THEN 2 ELSE 3 END,
              res.title
     LIMIT ? OFFSET ?`,
    [userId, ...bindings, limit, offset],
  );

  const total = count?.total ?? 0;
  return {
    items: items.map((item) => ({
      ...item,
      isFree: item.isFree === 1,
      bookmarked: item.bookmarked === 1,
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function toggleBookmark(
  env: Env,
  userId: string,
  resourceId: string,
): Promise<boolean> {
  const existing = await first<{ resourceId: string }>(
    env.DB,
    "SELECT resource_id AS resourceId FROM bookmarks WHERE user_id = ? AND resource_id = ?",
    [userId, resourceId],
  );
  if (existing) {
    await env.DB.prepare("DELETE FROM bookmarks WHERE user_id = ? AND resource_id = ?")
      .bind(userId, resourceId)
      .run();
    return false;
  }
  await env.DB.prepare("INSERT INTO bookmarks (user_id, resource_id, created_at) VALUES (?, ?, ?)")
    .bind(userId, resourceId, new Date().toISOString())
    .run();
  return true;
}

export async function getResourceRoadmaps(
  env: Env,
): Promise<Array<{ slug: string; title: string }>> {
  return all<{ slug: string; title: string }>(
    env.DB,
    `SELECT DISTINCT r.slug, r.title
     FROM roadmaps r JOIN resources res ON res.roadmap_id = r.id OR res.topic_id IN (SELECT id FROM topics WHERE roadmap_id = r.id)
     ORDER BY r.title`,
  );
}
