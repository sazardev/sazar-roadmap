import { all, first } from "~/lib/sql.server";

export interface NoteItem {
  id: string;
  title: string;
  bodyMd: string;
  topicId: string | null;
  topicTitle: string | null;
  topicSlug: string | null;
  roadmapSlug: string | null;
  source: string;
  externalId: string | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listNotes(
  env: Env,
  userId: string,
  filter: { q?: string; topicId?: string | null } = {},
): Promise<NoteItem[]> {
  const q = (filter.q ?? "").trim().toLowerCase();
  const topicId = filter.topicId ?? null;
  return all<NoteItem>(
    env.DB,
    `SELECT n.id, n.title, n.body_md AS bodyMd, n.topic_id AS topicId,
            t.title AS topicTitle, t.slug AS topicSlug, r.slug AS roadmapSlug,
            n.source, n.external_id AS externalId, n.external_url AS externalUrl,
            n.created_at AS createdAt, n.updated_at AS updatedAt
     FROM notes n
     LEFT JOIN topics t ON t.id = n.topic_id
     LEFT JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE n.user_id = ?
       AND (? IS NULL OR n.topic_id = ?)
       AND (? = '' OR lower(n.title) LIKE ? OR lower(n.body_md) LIKE ?)
     ORDER BY n.updated_at DESC`,
    [userId, topicId, topicId, q, `%${q}%`, `%${q}%`],
  );
}

export async function getNote(env: Env, userId: string, noteId: string): Promise<NoteItem | null> {
  return first<NoteItem>(
    env.DB,
    `SELECT n.id, n.title, n.body_md AS bodyMd, n.topic_id AS topicId,
            t.title AS topicTitle, t.slug AS topicSlug, r.slug AS roadmapSlug,
            n.source, n.external_id AS externalId, n.external_url AS externalUrl,
            n.created_at AS createdAt, n.updated_at AS updatedAt
     FROM notes n
     LEFT JOIN topics t ON t.id = n.topic_id
     LEFT JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE n.id = ? AND n.user_id = ?`,
    [noteId, userId],
  );
}

export async function createNote(
  env: Env,
  userId: string,
  input: {
    title: string;
    bodyMd: string;
    topicId?: string | null;
    source?: string;
    externalId?: string | null;
    externalUrl?: string | null;
  },
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO notes (id, user_id, title, body_md, topic_id, source, external_id, external_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      userId,
      input.title.slice(0, 200),
      input.bodyMd.slice(0, 40_000),
      input.topicId ?? null,
      input.source ?? "internal",
      input.externalId ?? null,
      input.externalUrl ?? null,
      now,
      now,
    )
    .run();
  return id;
}

export async function updateNote(
  env: Env,
  userId: string,
  noteId: string,
  input: { title: string; bodyMd: string },
): Promise<void> {
  await env.DB.prepare(
    `UPDATE notes SET title = ?, body_md = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
  )
    .bind(
      input.title.slice(0, 200),
      input.bodyMd.slice(0, 40_000),
      new Date().toISOString(),
      noteId,
      userId,
    )
    .run();
}

export async function deleteNote(env: Env, userId: string, noteId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").bind(noteId, userId).run();
}
