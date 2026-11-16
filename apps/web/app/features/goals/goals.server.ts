import { invalidateLearningStats } from "~/features/progress/progress.server";
import { all, first } from "~/lib/sql.server";
import { isoDate } from "~/lib/utils";

export interface Milestone {
  id: string;
  title: string;
  targetValue: number | null;
  completedAt: string | null;
  sortOrder: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
}

export async function listGoals(env: Env, userId: string): Promise<Goal[]> {
  const [goals, milestones] = await Promise.all([
    all<Omit<Goal, "milestones">>(
      env.DB,
      `SELECT id, title, description, kind, target_value AS targetValue,
              current_value AS currentValue, unit, due_at AS dueAt, status,
              created_at AS createdAt, updated_at AS updatedAt
       FROM goals WHERE user_id = ?
       ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END, due_at, created_at`,
      [userId],
    ),
    all<{
      id: string;
      goalId: string;
      title: string;
      targetValue: number | null;
      completedAt: string | null;
      sortOrder: number;
    }>(
      env.DB,
      `SELECT m.id, m.goal_id AS goalId, m.title, m.target_value AS targetValue,
              m.completed_at AS completedAt, m.sort_order AS sortOrder
       FROM goal_milestones m JOIN goals g ON g.id = m.goal_id
       WHERE g.user_id = ? ORDER BY m.sort_order`,
      [userId],
    ),
  ]);
  const byGoal = new Map<string, Milestone[]>();
  for (const milestone of milestones) {
    const list = byGoal.get(milestone.goalId) ?? [];
    list.push(milestone);
    byGoal.set(milestone.goalId, list);
  }
  return goals.map((goal) => ({ ...goal, milestones: byGoal.get(goal.id) ?? [] }));
}

export interface GoalInput {
  title: string;
  description?: string | null;
  kind: string;
  targetValue: number;
  unit: string;
  dueAt?: string | null;
}

export async function createGoal(env: Env, userId: string, input: GoalInput): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO goals (id, user_id, title, description, kind, target_value, current_value, unit, due_at, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 'active', ?, ?)`,
  )
    .bind(
      id,
      userId,
      input.title.slice(0, 160),
      input.description?.slice(0, 1000) ?? null,
      input.kind,
      Math.max(1, Math.round(input.targetValue)),
      input.unit,
      input.dueAt ?? null,
      now,
      now,
    )
    .run();
  invalidateLearningStats(userId);
  return id;
}

export async function updateGoalProgress(
  env: Env,
  userId: string,
  goalId: string,
  input: { currentValue?: number; status?: string },
): Promise<void> {
  const now = new Date().toISOString();
  if (input.currentValue !== undefined) {
    await env.DB.prepare(
      `UPDATE goals SET current_value = ?, status = CASE WHEN ? >= target_value THEN 'completed' ELSE status END, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    )
      .bind(
        Math.max(0, Math.round(input.currentValue)),
        Math.max(0, Math.round(input.currentValue)),
        now,
        goalId,
        userId,
      )
      .run();
    return;
  }
  if (input.status) {
    await env.DB.prepare("UPDATE goals SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?")
      .bind(input.status, now, goalId, userId)
      .run();
    invalidateLearningStats(userId);
  }
}

export async function createMilestone(
  env: Env,
  userId: string,
  goalId: string,
  title: string,
  targetValue?: number,
): Promise<void> {
  const owner = await first<{ id: string }>(
    env.DB,
    "SELECT id FROM goals WHERE id = ? AND user_id = ?",
    [goalId, userId],
  );
  if (!owner) throw new Response("Goal not found", { status: 404 });
  const order = await first<{ next: number }>(
    env.DB,
    "SELECT coalesce(max(sort_order), -1) + 1 AS next FROM goal_milestones WHERE goal_id = ?",
    [goalId],
  );
  await env.DB.prepare(
    `INSERT INTO goal_milestones (id, goal_id, title, target_value, completed_at, sort_order)
     VALUES (?, ?, ?, ?, NULL, ?)`,
  )
    .bind(crypto.randomUUID(), goalId, title.slice(0, 200), targetValue ?? null, order?.next ?? 0)
    .run();
}

export async function toggleMilestone(
  env: Env,
  userId: string,
  milestoneId: string,
): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE goal_milestones SET completed_at = CASE WHEN completed_at IS NULL THEN ? ELSE NULL END
     WHERE id = ? AND goal_id IN (SELECT id FROM goals WHERE user_id = ?)`,
  )
    .bind(now, milestoneId, userId)
    .run();
}

export async function archiveGoal(env: Env, userId: string, goalId: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE goals SET status = 'archived', updated_at = ? WHERE id = ? AND user_id = ?",
  )
    .bind(new Date().toISOString(), goalId, userId)
    .run();
}

export async function deleteGoal(env: Env, userId: string, goalId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?").bind(goalId, userId).run();
  invalidateLearningStats(userId);
}

export async function getGoalById(env: Env, userId: string, goalId: string): Promise<Goal | null> {
  const goal = await first<Omit<Goal, "milestones">>(
    env.DB,
    `SELECT id, title, description, kind, target_value AS targetValue, current_value AS currentValue,
            unit, due_at AS dueAt, status, created_at AS createdAt, updated_at AS updatedAt
     FROM goals WHERE id = ? AND user_id = ?`,
    [goalId, userId],
  );
  if (!goal) return null;
  const milestones = await all<Milestone>(
    env.DB,
    `SELECT id, title, target_value AS targetValue, completed_at AS completedAt, sort_order AS sortOrder
     FROM goal_milestones WHERE goal_id = ? ORDER BY sort_order`,
    [goalId],
  );
  return { ...goal, milestones };
}

/** Create the initial weekly goal once, without duplicating it on every onboarding edit. */
export async function ensureStarterGoals(
  env: Env,
  userId: string,
  weeklyMinutes: number,
): Promise<void> {
  const existing = await first<{ count: number }>(
    env.DB,
    "SELECT count(*) AS count FROM goals WHERE user_id = ?",
    [userId],
  );
  if ((existing?.count ?? 0) > 0) return;
  const weekEnd = new Date();
  weekEnd.setUTCDate(weekEnd.getUTCDate() + (7 - weekEnd.getUTCDay()));
  await createGoal(env, userId, {
    title: `Study ${weeklyMinutes} minutes this week`,
    description: "A weekly floor, not a race. Minutes come from logged sessions and reviews.",
    kind: "weekly",
    targetValue: weeklyMinutes,
    unit: "minutes",
    dueAt: isoDate(weekEnd),
  });
  await createGoal(env, userId, {
    title: "Complete your first guided topic",
    description:
      "Read, practice and mark one topic as practiced. The first artifact matters more than the count.",
    kind: "skill",
    targetValue: 1,
    unit: "topics",
    dueAt: isoDate(new Date(Date.now() + 14 * 86_400_000)),
  });
}
