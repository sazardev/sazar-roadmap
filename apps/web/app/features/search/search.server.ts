import { all } from "~/lib/sql.server";

export type SearchKind = "topic" | "resource" | "note";

export interface SearchHit {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  url: string;
  snippet?: string | undefined;
}

export interface SearchResults {
  topics: SearchHit[];
  resources: SearchHit[];
  notes: SearchHit[];
  total: number;
}

export function toFtsQuery(query: string): string | null {
  const terms = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .flatMap((term) => term.split("-"))
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .slice(0, 8);
  if (terms.length === 0) return null;
  return terms.map((term) => `${term}*`).join(" AND ");
}

interface TopicRow {
  id: string;
  title: string;
  summary: string;
  slug: string;
  roadmap_slug: string;
  roadmap_title: string;
  snippet: string | null;
}

interface ResourceRow {
  id: string;
  title: string;
  url: string;
  kind: string;
  provider: string | null;
  topic_title: string | null;
  roadmap_slug: string | null;
  snippet: string | null;
}

interface NoteRow {
  id: string;
  title: string;
  topic_title: string | null;
  roadmap_slug: string | null;
  snippet: string | null;
}

async function searchTopics(env: Env, query: string, limit: number): Promise<SearchHit[]> {
  const match = toFtsQuery(query);
  if (!match) return [];
  try {
    const rows = await all<TopicRow>(
      env.DB,
      `SELECT t.id, t.title, t.summary, t.slug, r.slug AS roadmap_slug, r.title AS roadmap_title,
              snippet(topics_fts, 1, '', '', '…', 24) AS snippet
       FROM topics_fts
       JOIN topics t ON t.rowid = topics_fts.rowid
       JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE topics_fts MATCH ?
       ORDER BY bm25(topics_fts)
       LIMIT ?`,
      [match, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      kind: "topic",
      title: row.title,
      subtitle: `${row.roadmap_title} · ${row.summary.slice(0, 140)}`,
      url: `/roadmaps/${row.roadmap_slug}/${row.slug}`,
      snippet: row.snippet ?? undefined,
    }));
  } catch {
    const like = `%${query.toLowerCase()}%`;
    const rows = await all<TopicRow>(
      env.DB,
      `SELECT t.id, t.title, t.summary, t.slug, r.slug AS roadmap_slug, r.title AS roadmap_title,
              NULL AS snippet
       FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE lower(t.title) LIKE ? OR lower(t.summary) LIKE ?
       ORDER BY CASE WHEN lower(t.title) LIKE ? THEN 0 ELSE 1 END, t.title
       LIMIT ?`,
      [like, like, `${query.toLowerCase()}%`, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      kind: "topic",
      title: row.title,
      subtitle: `${row.roadmap_title} · ${row.summary.slice(0, 140)}`,
      url: `/roadmaps/${row.roadmap_slug}/${row.slug}`,
    }));
  }
}

async function searchResources(env: Env, query: string, limit: number): Promise<SearchHit[]> {
  const match = toFtsQuery(query);
  if (!match) return [];
  try {
    const rows = await all<ResourceRow>(
      env.DB,
      `SELECT res.id, res.title, res.url, res.kind, res.provider,
              t.title AS topic_title, r.slug AS roadmap_slug,
              snippet(resources_fts, 0, '', '', '…', 20) AS snippet
       FROM resources_fts
       JOIN resources res ON res.rowid = resources_fts.rowid
       LEFT JOIN topics t ON t.id = res.topic_id
       LEFT JOIN roadmaps r ON r.id = res.roadmap_id
       WHERE resources_fts MATCH ?
       ORDER BY bm25(resources_fts)
       LIMIT ?`,
      [match, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      kind: "resource",
      title: row.title,
      subtitle: `${row.provider ?? row.kind}${row.topic_title ? ` · ${row.topic_title}` : ""}`,
      url: row.url,
      snippet: row.snippet ?? undefined,
    }));
  } catch {
    const like = `%${query.toLowerCase()}%`;
    const rows = await all<ResourceRow>(
      env.DB,
      `SELECT res.id, res.title, res.url, res.kind, res.provider,
              t.title AS topic_title, r.slug AS roadmap_slug, NULL AS snippet
       FROM resources res
       LEFT JOIN topics t ON t.id = res.topic_id
       LEFT JOIN roadmaps r ON r.id = res.roadmap_id
       WHERE lower(res.title) LIKE ? OR lower(res.provider) LIKE ?
       ORDER BY res.title LIMIT ?`,
      [like, like, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      kind: "resource",
      title: row.title,
      subtitle: `${row.provider ?? row.kind}${row.topic_title ? ` · ${row.topic_title}` : ""}`,
      url: row.url,
    }));
  }
}

async function searchNotes(
  env: Env,
  userId: string,
  query: string,
  limit: number,
): Promise<SearchHit[]> {
  const match = toFtsQuery(query);
  if (!match) return [];
  try {
    const rows = await all<NoteRow>(
      env.DB,
      `SELECT n.id, n.title, t.title AS topic_title, r.slug AS roadmap_slug,
              snippet(notes_fts, 1, '', '', '…', 24) AS snippet
       FROM notes_fts
       JOIN notes n ON n.rowid = notes_fts.rowid
       LEFT JOIN topics t ON t.id = n.topic_id
       LEFT JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE notes_fts MATCH ? AND n.user_id = ?
       ORDER BY bm25(notes_fts)
       LIMIT ?`,
      [match, userId, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      kind: "note",
      title: row.title,
      subtitle: `Your note${row.topic_title ? ` · ${row.topic_title}` : ""}`,
      url: `/notes#note-${row.id}`,
      snippet: row.snippet ?? undefined,
    }));
  } catch {
    const like = `%${query.toLowerCase()}%`;
    const rows = await all<NoteRow>(
      env.DB,
      `SELECT n.id, n.title, t.title AS topic_title, r.slug AS roadmap_slug, NULL AS snippet
       FROM notes n
       LEFT JOIN topics t ON t.id = n.topic_id
       LEFT JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE n.user_id = ? AND (lower(n.title) LIKE ? OR lower(n.body_md) LIKE ?)
       ORDER BY n.updated_at DESC LIMIT ?`,
      [userId, like, like, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      kind: "note",
      title: row.title,
      subtitle: `Your note${row.topic_title ? ` · ${row.topic_title}` : ""}`,
      url: `/notes#note-${row.id}`,
    }));
  }
}

export async function searchAll(
  env: Env,
  userId: string,
  query: string,
  limitPerGroup = 10,
): Promise<SearchResults> {
  const trimmed = query.trim().slice(0, 120);
  if (trimmed.length < 2) {
    return { topics: [], resources: [], notes: [], total: 0 };
  }
  const [topics, resources, notes] = await Promise.all([
    searchTopics(env, trimmed, limitPerGroup),
    searchResources(env, trimmed, Math.min(limitPerGroup, 5)),
    searchNotes(env, userId, trimmed, Math.min(limitPerGroup, 5)),
  ]);
  return {
    topics,
    resources,
    notes,
    total: topics.length + resources.length + notes.length,
  };
}

export async function searchForPalette(
  env: Env,
  userId: string,
  query: string,
): Promise<SearchHit[]> {
  const results = await searchAll(env, userId, query, 4);
  return [...results.topics, ...results.resources.slice(0, 2), ...results.notes.slice(0, 2)];
}
