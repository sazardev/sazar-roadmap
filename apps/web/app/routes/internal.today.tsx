import { listGoals } from "~/features/goals/goals.server";
import { getLearningStats, getNextTopic } from "~/features/progress/progress.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/internal.today";

function authorized(request: Request, env: Env): boolean {
  const key = env.INTEGRATION_KEY;
  return Boolean(key) && request.headers.get("x-integration-key") === key;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = getEnv(context);
  if (!authorized(request, env)) return new Response("Forbidden", { status: 403 });

  const profile = await env.DB.prepare(
    "SELECT id FROM profiles ORDER BY created_at LIMIT 1",
  ).first<{ id: string }>();
  if (!profile) {
    return Response.json(
      {
        due: 0,
        newCards: 0,
        minutesToday: 0,
        minutesThisWeek: 0,
        streak: 0,
        next: null,
        goals: [],
        url: env.PUBLIC_URL,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const [stats, next, goals] = await Promise.all([
    getLearningStats(env, profile.id),
    getNextTopic(env, profile.id),
    listGoals(env, profile.id),
  ]);

  return Response.json(
    {
      due: stats.dueReviews,
      newCards: stats.newCards,
      minutesToday: stats.minutesToday,
      minutesThisWeek: stats.minutesThisWeek,
      streak: stats.streak,
      completed: stats.completed,
      totalTopics: stats.totalTopics,
      next: next
        ? {
            title: next.title,
            url: `${env.PUBLIC_URL}/roadmaps/${next.roadmapSlug}/${next.slug}`,
          }
        : null,
      goals: goals
        .filter((goal) => goal.status === "active")
        .slice(0, 4)
        .map((goal) => ({
          title: goal.title,
          current: goal.currentValue,
          target: goal.targetValue,
          unit: goal.unit,
        })),
      url: env.PUBLIC_URL,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
