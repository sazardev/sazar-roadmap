import { all, first } from "~/lib/sql.server";

export interface Person {
  id: string;
  name: string;
  role: string | null;
  expertise: string[];
  url: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  body: string;
  status: string;
  answer: string | null;
  topicId: string | null;
  topicTitle: string | null;
  topicSlug: string | null;
  roadmapSlug: string | null;
  personId: string | null;
  personName: string | null;
  createdAt: string;
  answeredAt: string | null;
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

export async function listPeople(env: Env, userId: string): Promise<Person[]> {
  const rows = await all<Omit<Person, "expertise"> & { expertise: string }>(
    env.DB,
    `SELECT id, name, role, expertise, url, notes, last_contacted_at AS lastContactedAt,
            created_at AS createdAt, updated_at AS updatedAt
     FROM people WHERE user_id = ? ORDER BY name`,
    [userId],
  );
  return rows.map((row) => ({ ...row, expertise: parseList(row.expertise) }));
}

export async function createPerson(
  env: Env,
  userId: string,
  input: {
    name: string;
    role?: string | undefined;
    expertise: string[];
    url?: string | undefined;
    notes?: string | undefined;
  },
): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO people (id, user_id, name, role, expertise, url, notes, last_contacted_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      userId,
      input.name.slice(0, 120),
      input.role?.slice(0, 160) ?? null,
      JSON.stringify(input.expertise.slice(0, 12)),
      input.url?.slice(0, 500) ?? null,
      input.notes?.slice(0, 2000) ?? null,
      now,
      now,
    )
    .run();
}

export async function updatePersonContact(
  env: Env,
  userId: string,
  personId: string,
): Promise<void> {
  await env.DB.prepare(
    "UPDATE people SET last_contacted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?",
  )
    .bind(new Date().toISOString(), new Date().toISOString(), personId, userId)
    .run();
}

export async function deletePerson(env: Env, userId: string, personId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM people WHERE id = ? AND user_id = ?")
    .bind(personId, userId)
    .run();
}

export async function listQuestions(env: Env, userId: string): Promise<Question[]> {
  return all<Question>(
    env.DB,
    `SELECT q.id, q.body, q.status, q.answer, q.topic_id AS topicId,
            t.title AS topicTitle, t.slug AS topicSlug, r.slug AS roadmapSlug,
            q.person_id AS personId, p.name AS personName,
            q.created_at AS createdAt, q.answered_at AS answeredAt
     FROM questions q
     LEFT JOIN topics t ON t.id = q.topic_id
     LEFT JOIN roadmaps r ON r.id = t.roadmap_id
     LEFT JOIN people p ON p.id = q.person_id
     WHERE q.user_id = ?
     ORDER BY CASE q.status WHEN 'open' THEN 0 ELSE 1 END, q.created_at DESC`,
    [userId],
  );
}

export async function createQuestion(
  env: Env,
  userId: string,
  input: { body: string; topicId?: string | null; personId?: string | null },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO questions (id, user_id, topic_id, person_id, body, status, answer, created_at, answered_at)
     VALUES (?, ?, ?, ?, ?, 'open', NULL, ?, NULL)`,
  )
    .bind(
      crypto.randomUUID(),
      userId,
      input.topicId ?? null,
      input.personId ?? null,
      input.body.slice(0, 4000),
      new Date().toISOString(),
    )
    .run();
}

export async function answerQuestion(
  env: Env,
  userId: string,
  questionId: string,
  answer: string,
): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE questions SET status = 'answered', answer = ?, answered_at = ? WHERE id = ? AND user_id = ?`,
  )
    .bind(answer.slice(0, 8000), now, questionId, userId)
    .run();
}

export async function getQuestion(
  env: Env,
  userId: string,
  questionId: string,
): Promise<{ id: string; body: string; personId: string | null } | null> {
  return first<{ id: string; body: string; personId: string | null }>(
    env.DB,
    "SELECT id, body, person_id AS personId FROM questions WHERE id = ? AND user_id = ?",
    [questionId, userId],
  );
}
