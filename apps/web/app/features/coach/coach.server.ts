import type { LearningStats } from "~/features/progress/progress.server";
import { all, first } from "~/lib/sql.server";

export interface CoachThread {
  id: string;
  title: string;
  topicId: string | null;
  mode: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  topicTitle: string | null;
  topicSlug: string | null;
  roadmapSlug: string | null;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: string[];
  model: string | null;
  createdAt: string;
}

export interface CoachSource {
  id: string;
  title: string;
  slug: string;
  roadmapSlug: string;
  roadmapTitle: string;
  summary: string;
  why: string;
  concepts: string[];
  practice: string;
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

export async function listThreads(env: Env, userId: string, limit = 20): Promise<CoachThread[]> {
  return all<CoachThread>(
    env.DB,
    `SELECT th.id, th.title, th.topic_id AS topicId, th.mode, th.created_at AS createdAt,
            th.updated_at AS updatedAt,
            (SELECT count(*) FROM coach_messages m WHERE m.thread_id = th.id) AS messageCount,
            t.title AS topicTitle, t.slug AS topicSlug, r.slug AS roadmapSlug
     FROM coach_threads th
     LEFT JOIN topics t ON t.id = th.topic_id
     LEFT JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE th.user_id = ? ORDER BY th.updated_at DESC LIMIT ?`,
    [userId, limit],
  );
}

export async function getThread(
  env: Env,
  userId: string,
  threadId: string,
): Promise<{ thread: CoachThread; messages: CoachMessage[] } | null> {
  const thread = await first<CoachThread>(
    env.DB,
    `SELECT th.id, th.title, th.topic_id AS topicId, th.mode, th.created_at AS createdAt,
            th.updated_at AS updatedAt,
            (SELECT count(*) FROM coach_messages m WHERE m.thread_id = th.id) AS messageCount,
            t.title AS topicTitle, t.slug AS topicSlug, r.slug AS roadmapSlug
     FROM coach_threads th
     LEFT JOIN topics t ON t.id = th.topic_id
     LEFT JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE th.id = ? AND th.user_id = ? LIMIT 1`,
    [threadId, userId],
  );
  if (!thread) return null;
  const rows = await all<{
    id: string;
    role: string;
    content: string;
    citations: string;
    model: string | null;
    createdAt: string;
  }>(
    env.DB,
    `SELECT id, role, content, citations, model, created_at AS createdAt
     FROM coach_messages WHERE thread_id = ? ORDER BY created_at`,
    [thread.id],
  );
  return {
    thread,
    messages: rows.map((row) => ({
      id: row.id,
      role: row.role === "assistant" ? "assistant" : row.role === "system" ? "system" : "user",
      content: row.content,
      citations: parseList(row.citations),
      model: row.model,
      createdAt: row.createdAt,
    })),
  };
}

export async function createThread(
  env: Env,
  userId: string,
  input: { title?: string; topicId?: string | null; mode?: string },
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO coach_threads (id, user_id, title, topic_id, mode, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      userId,
      input.title?.slice(0, 120) || "New session",
      input.topicId ?? null,
      input.mode ?? "coach",
      now,
      now,
    )
    .run();
  return id;
}

export async function deleteThread(env: Env, userId: string, threadId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM coach_threads WHERE id = ? AND user_id = ?")
    .bind(threadId, userId)
    .run();
}

export async function retrieveSources(
  env: Env,
  userId: string,
  query: string,
  topicId: string | null,
  limit = 5,
): Promise<CoachSource[]> {
  const sources = new Map<string, CoachSource>();

  if (topicId) {
    const current = await first<{
      id: string;
      title: string;
      slug: string;
      roadmapSlug: string;
      roadmapTitle: string;
      summary: string;
      why: string;
      concepts: string;
      practice: string;
    }>(
      env.DB,
      `SELECT t.id, t.title, t.slug, r.slug AS roadmapSlug, r.title AS roadmapTitle,
              t.summary, t.why_it_matters AS why, t.key_concepts AS concepts, t.practice
       FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id WHERE t.id = ?`,
      [topicId],
    );
    if (current) {
      sources.set(current.id, {
        ...current,
        concepts: parseList(current.concepts),
      });
    }
  }

  const terms = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .flatMap((term) => term.split("-"))
    .filter((term) => term.length > 1)
    .slice(0, 8);
  if (terms.length > 0) {
    const match = terms.map((term) => `${term}*`).join(" AND ");
    try {
      const rows = await all<{
        id: string;
        title: string;
        slug: string;
        roadmapSlug: string;
        roadmapTitle: string;
        summary: string;
        why: string;
        concepts: string;
        practice: string;
      }>(
        env.DB,
        `SELECT t.id, t.title, t.slug, r.slug AS roadmapSlug, r.title AS roadmapTitle,
                t.summary, t.why_it_matters AS why, t.key_concepts AS concepts, t.practice
         FROM topics_fts
         JOIN topics t ON t.rowid = topics_fts.rowid
         JOIN roadmaps r ON r.id = t.roadmap_id
         WHERE topics_fts MATCH ?
         ORDER BY bm25(topics_fts) LIMIT ?`,
        [match, limit],
      );
      for (const row of rows) {
        if (!sources.has(row.id))
          sources.set(row.id, { ...row, concepts: parseList(row.concepts) });
      }
    } catch {
      // FTS syntax errors fall through to the progress-based context below.
    }
  }

  if (sources.size < limit) {
    const rows = await all<{
      id: string;
      title: string;
      slug: string;
      roadmapSlug: string;
      roadmapTitle: string;
      summary: string;
      why: string;
      concepts: string;
      practice: string;
    }>(
      env.DB,
      `SELECT t.id, t.title, t.slug, r.slug AS roadmapSlug, r.title AS roadmapTitle,
              t.summary, t.why_it_matters AS why, t.key_concepts AS concepts, t.practice
       FROM topics t
       JOIN roadmaps r ON r.id = t.roadmap_id
       LEFT JOIN user_topic_progress p ON p.topic_id = t.id AND p.user_id = ?
       WHERE r.status = 'guided'
       ORDER BY
         CASE WHEN p.status = 'learning' THEN 0 WHEN p.status IS NULL THEN 1 ELSE 2 END,
         r.sort_order, t.sort_order
       LIMIT ?`,
      [userId, Math.max(0, limit - sources.size)],
    );
    for (const row of rows) {
      if (!sources.has(row.id)) sources.set(row.id, { ...row, concepts: parseList(row.concepts) });
    }
  }

  return [...sources.values()].slice(0, limit);
}

function contextBlock(sources: CoachSource[]): string {
  if (sources.length === 0) return "No topic context was retrieved.";
  return sources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.title} (${source.roadmapTitle})\n` +
        `Summary: ${source.summary}\n` +
        `Why it matters: ${source.why}\n` +
        `Key concepts: ${source.concepts.join("; ") || "not recorded"}\n` +
        `Practice: ${source.practice}`,
    )
    .join("\n\n");
}

function systemPrompt(userName: string, stats: LearningStats, sources: CoachSource[]): string {
  return [
    `You are the Sazar Roadmap coach, a senior software engineer and teacher working with ${userName}.`,
    "The learner is building depth across frontend, backend, AI engineering and the Cloudflare platform.",
    "Be direct, concrete and calm. No emojis, no filler, no motivational speeches.",
    "Use the retrieved context when it is relevant. If it is insufficient, say what is missing instead of inventing facts.",
    "Cite the topic titles you use in square brackets, for example [HTTP caching].",
    "Prefer short sections with descriptive headings, then a single next action.",
    "When the learner asks for a plan, make it concrete and time-boxed, with a measurable artifact per step.",
    "When the learner asks to be quizzed, ask one question at a time and wait for the answer.",
    "",
    `Learner snapshot: ${stats.completed} topics completed, ${stats.mastered} mastered, ` +
      `${stats.learning} in progress, ${stats.dueReviews} reviews due, ${stats.minutesThisWeek} minutes this week.`,
    "",
    "Retrieved context:",
    contextBlock(sources),
  ].join("\n");
}

function fallbackReply(sources: CoachSource[], stats: LearningStats): string {
  const primary = sources[0];
  if (!primary) {
    return [
      "## Start with a concrete question",
      "I could not retrieve a topic for this message. Tell me what you are trying to build or which roadmap you are following, and I will turn it into a short plan.",
      "",
      "## Next step",
      "Open a roadmap, pick one topic, and ask again with the topic in context.",
    ].join("\n");
  }
  return [
    `## Focus: ${primary.title}`,
    primary.summary,
    "",
    "## Why it matters",
    primary.why,
    "",
    "## Practice",
    primary.practice,
    "",
    "## Next step",
    `Spend 25 minutes on this, then log the session. You have ${stats.dueReviews} reviews due and ${stats.activeGoals} active goals.`,
    "",
    `Sources: ${sources.map((source) => `[${source.title}]`).join(" ")}`,
  ].join("\n");
}

async function runModel(
  env: Env,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): Promise<string | null> {
  if (!env.AI) return null;
  const run = env.AI.run.bind(env.AI) as (model: string, inputs: unknown) => Promise<unknown>;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const output = await Promise.race([
    run(env.AI_MODEL, {
      messages,
      max_tokens: 1400,
      temperature: 0.35,
    }),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("AI timeout")), 28_000);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
  const record = output as {
    response?: unknown;
    result?: { response?: unknown };
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content =
    typeof record.response === "string"
      ? record.response
      : typeof record.result?.response === "string"
        ? record.result.response
        : typeof record.choices?.[0]?.message?.content === "string"
          ? record.choices[0].message.content
          : null;
  return content?.trim() || null;
}

export interface SendCoachResult {
  message: CoachMessage;
  sources: CoachSource[];
}

export async function sendCoachMessage(
  env: Env,
  userId: string,
  threadId: string,
  content: string,
  stats: LearningStats,
  userName = "the learner",
): Promise<SendCoachResult> {
  const thread = await getThread(env, userId, threadId);
  if (!thread) throw new Response("Thread not found", { status: 404 });

  const trimmed = content.trim().slice(0, 6000);
  if (trimmed.length < 2) throw new Response("Message is too short", { status: 400 });

  const recent = await first<{ count: number }>(
    env.DB,
    `SELECT count(*) AS count FROM coach_messages m
     JOIN coach_threads t ON t.id = m.thread_id
     WHERE t.user_id = ? AND m.role = 'user' AND m.created_at >= ?`,
    [userId, new Date(Date.now() - 10 * 60_000).toISOString()],
  );
  if ((recent?.count ?? 0) >= 8) {
    throw new Response("You are sending messages too quickly. Wait a minute and try again.", {
      status: 429,
    });
  }

  const now = new Date().toISOString();
  const userMessageId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO coach_messages (id, thread_id, role, content, citations, model, created_at)
     VALUES (?, ?, 'user', ?, '[]', NULL, ?)`,
  )
    .bind(userMessageId, threadId, trimmed, now)
    .run();

  const sources = await retrieveSources(env, userId, trimmed, thread.thread.topicId);
  const history = thread.messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-10)
    .map((message) => ({ role: message.role as "user" | "assistant", content: message.content }));

  let reply: string | null = null;
  let model: string | null = null;
  try {
    reply = await runModel(env, [
      { role: "system", content: systemPrompt(userName, stats, sources) },
      ...history,
      { role: "user", content: trimmed },
    ]);
    if (reply) model = env.AI_MODEL;
  } catch {
    reply = null;
  }
  if (!reply) reply = fallbackReply(sources, stats);

  const assistantId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const title =
    thread.thread.messageCount === 0
      ? trimmed.replace(/\s+/g, " ").slice(0, 80)
      : thread.thread.title;
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO coach_messages (id, thread_id, role, content, citations, model, created_at)
       VALUES (?, ?, 'assistant', ?, ?, ?, ?)`,
    ).bind(
      assistantId,
      threadId,
      reply,
      JSON.stringify(sources.map((source) => source.id)),
      model,
      createdAt,
    ),
    env.DB.prepare(
      "UPDATE coach_threads SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    ).bind(title, createdAt, threadId, userId),
    env.DB.prepare(
      `INSERT INTO activity_events (id, user_id, kind, entity_type, entity_id, metadata, created_at)
       VALUES (?, ?, 'coach', 'thread', ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      userId,
      threadId,
      JSON.stringify({ question: trimmed.slice(0, 140) }),
      createdAt,
    ),
  ]);

  return {
    message: {
      id: assistantId,
      role: "assistant",
      content: reply,
      citations: sources.map((source) => source.id),
      model,
      createdAt,
    },
    sources,
  };
}

export async function getSourcesByIds(env: Env, ids: string[]): Promise<CoachSource[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const rows = await all<{
    id: string;
    title: string;
    slug: string;
    roadmapSlug: string;
    roadmapTitle: string;
    summary: string;
    why: string;
    concepts: string;
    practice: string;
  }>(
    env.DB,
    `SELECT t.id, t.title, t.slug, r.slug AS roadmapSlug, r.title AS roadmapTitle,
            t.summary, t.why_it_matters AS why, t.key_concepts AS concepts, t.practice
     FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id
     WHERE t.id IN (${placeholders})`,
    ids,
  );
  return rows.map((row) => ({ ...row, concepts: parseList(row.concepts) }));
}
