import { Check, Circle, Plus, Target, Trash2 } from "lucide-react";
import { Form, redirect, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input, Select, Textarea } from "~/components/ui/field";
import { ProgressBar } from "~/components/ui/progress";
import { Card, CardBody, EmptyState, PageHeader } from "~/components/ui/surfaces";
import {
  archiveGoal,
  createGoal,
  createMilestone,
  deleteGoal,
  type Goal,
  listGoals,
  toggleMilestone,
  updateGoalProgress,
} from "~/features/goals/goals.server";
import { getLearningStats } from "~/features/progress/progress.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { formatMinutes, isoDate, percent } from "~/lib/utils";
import type { Route } from "./+types/goals";

export const meta = () => pageMeta("Goals");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const [goals, stats] = await Promise.all([
    listGoals(env, user.id),
    getLearningStats(env, user.id),
  ]);
  return {
    goals,
    stats,
    weeklyGoal: user.settings.weeklyGoalMinutes,
    newGoal: url.searchParams.get("new") === "1",
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const title = String(form.get("title") ?? "").trim();
    const targetValue = Number(form.get("targetValue") ?? 0);
    const unit = String(form.get("unit") ?? "minutes");
    const kind = String(form.get("kind") ?? "weekly");
    if (title.length < 3 || !Number.isFinite(targetValue) || targetValue < 1) {
      return Response.json(
        { error: "A goal needs a title and a target above zero." },
        { status: 400 },
      );
    }
    await createGoal(env, user.id, {
      title,
      description: String(form.get("description") ?? "").trim() || null,
      kind,
      targetValue,
      unit,
      dueAt: String(form.get("dueAt") ?? "") || null,
    });
    return redirect("/goals");
  }

  if (intent === "progress") {
    const goalId = String(form.get("goalId") ?? "");
    const currentValue = Number(form.get("currentValue") ?? 0);
    if (goalId && Number.isFinite(currentValue)) {
      await updateGoalProgress(env, user.id, goalId, { currentValue });
    }
    return redirect("/goals");
  }

  if (intent === "complete") {
    const goalId = String(form.get("goalId") ?? "");
    if (goalId) await updateGoalProgress(env, user.id, goalId, { status: "completed" });
    return redirect("/goals");
  }

  if (intent === "archive") {
    const goalId = String(form.get("goalId") ?? "");
    if (goalId) await archiveGoal(env, user.id, goalId);
    return redirect("/goals");
  }

  if (intent === "delete") {
    const goalId = String(form.get("goalId") ?? "");
    if (goalId) await deleteGoal(env, user.id, goalId);
    return redirect("/goals");
  }

  if (intent === "milestone") {
    const goalId = String(form.get("goalId") ?? "");
    const title = String(form.get("title") ?? "").trim();
    const target = Number(form.get("targetValue") ?? 0);
    if (goalId && title.length > 1) {
      await createMilestone(
        env,
        user.id,
        goalId,
        title,
        Number.isFinite(target) && target > 0 ? target : undefined,
      );
    }
    return redirect("/goals");
  }

  if (intent === "toggle-milestone") {
    const milestoneId = String(form.get("milestoneId") ?? "");
    if (milestoneId) await toggleMilestone(env, user.id, milestoneId);
    return redirect("/goals");
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export default function GoalsPage({ loaderData }: Route.ComponentProps) {
  const { goals, stats, weeklyGoal, newGoal } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const active = goals.filter((goal) => goal.status === "active");
  const completed = goals.filter((goal) => goal.status !== "active");
  const weeklyPercent = percent(stats.minutesThisWeek, weeklyGoal);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Direction"
        title="Goals"
        description="A goal is a measurable change in behavior, not a wish. Keep the list short enough to remember."
        actions={
          <a
            href="#new-goal"
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-canvas"
          >
            <Plus size={15} /> New goal
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="space-y-2 p-5">
            <p className="text-xs text-muted">This week</p>
            <p className="font-mono text-2xl">{formatMinutes(stats.minutesThisWeek)}</p>
            <ProgressBar value={stats.minutesThisWeek} max={weeklyGoal} />
            <p className="text-[10px] text-muted">
              {weeklyPercent}% of the {formatMinutes(weeklyGoal)} weekly target
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-2 p-5">
            <p className="text-xs text-muted">Active goals</p>
            <p className="font-mono text-2xl">{active.length}</p>
            <p className="text-[10px] text-muted">{completed.length} completed or archived</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-2 p-5">
            <p className="text-xs text-muted">Streak</p>
            <p className="font-mono text-2xl">{stats.streak} days</p>
            <p className="text-[10px] text-muted">Any logged session keeps it alive</p>
          </CardBody>
        </Card>
      </div>

      <section className="space-y-3" aria-labelledby="active-goals">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="active-goals" className="text-lg font-semibold tracking-tight">
              Active
            </h2>
            <p className="text-sm text-muted">
              Progress updates automatically from sessions, reviews and completed topics.
            </p>
          </div>
          <Badge tone="outline">{active.length} goals</Badge>
        </div>
        {active.length === 0 ? (
          <EmptyState
            title="No active goals"
            description="Start with one weekly time goal and one topic goal. Two is enough for a useful week."
            icon={<Target size={20} />}
            action={
              <a href="#new-goal" className="text-sm underline">
                Create the first goal
              </a>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((goal) => (
              <GoalCard key={goal.id} goal={goal} busy={busy} />
            ))}
          </div>
        )}
      </section>

      <details className="rounded-md border border-line" open={newGoal} id="new-goal">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <Plus size={15} /> Create a goal
        </summary>
        <Form method="post" className="grid gap-4 border-t border-line p-5 sm:grid-cols-2">
          <input type="hidden" name="intent" value="create" />
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <Input name="title" required placeholder="Finish the frontend performance stage" />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Why this matters</span>
            <Textarea
              name="description"
              className="min-h-20"
              placeholder="Optional. What changes when this is done?"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Kind</span>
            <Select name="kind" defaultValue="weekly">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="skill">Skill</option>
              <option value="roadmap">Roadmap</option>
              <option value="habit">Habit</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Unit</span>
            <Select name="unit" defaultValue="minutes">
              <option value="minutes">Minutes</option>
              <option value="topics">Topics</option>
              <option value="cards">Cards</option>
              <option value="sessions">Sessions</option>
              <option value="projects">Projects</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Target</span>
            <Input name="targetValue" type="number" min={1} defaultValue={180} required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Due date</span>
            <Input
              name="dueAt"
              type="date"
              defaultValue={isoDate(new Date(Date.now() + 7 * 86_400_000))}
            />
          </label>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Button type="submit" disabled={busy}>
              Create goal
            </Button>
            <p className="text-[11px] text-muted">
              The weekly time goal is updated automatically when you log a session.
            </p>
          </div>
        </Form>
      </details>

      {completed.length > 0 ? (
        <details className="rounded-md border border-line">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-muted [&::-webkit-details-marker]:hidden">
            Completed and archived ({completed.length})
          </summary>
          <div className="space-y-3 border-t border-line p-5">
            {completed.map((goal) => (
              <GoalCard key={goal.id} goal={goal} busy={busy} compact />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function GoalCard({
  goal,
  busy,
  compact = false,
}: {
  goal: Goal;
  busy: boolean;
  compact?: boolean;
}) {
  const progress = percent(goal.currentValue, goal.targetValue);
  return (
    <Card className={compact ? "bg-surface" : ""}>
      <CardBody className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{goal.title}</h3>
              <Badge tone={goal.status === "completed" ? "success" : "outline"}>
                {goal.status}
              </Badge>
              <Badge tone="outline">{goal.kind}</Badge>
            </div>
            {goal.description ? (
              <p className="text-xs leading-relaxed text-muted">{goal.description}</p>
            ) : null}
          </div>
          <span className="shrink-0 font-mono text-[11px] text-muted">{progress}%</span>
        </div>

        <div className="space-y-1.5">
          <ProgressBar value={goal.currentValue} max={goal.targetValue} />
          <div className="flex items-center justify-between text-[10px] text-muted">
            <span>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </span>
            {goal.dueAt ? <span>Due {goal.dueAt}</span> : null}
          </div>
        </div>

        {goal.milestones.length > 0 ? (
          <ul className="space-y-1.5 border-t border-line pt-3">
            {goal.milestones.map((milestone) => (
              <li key={milestone.id}>
                <Form method="post" className="flex items-center gap-2">
                  <input type="hidden" name="intent" value="toggle-milestone" />
                  <input type="hidden" name="milestoneId" value={milestone.id} />
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex size-5 items-center justify-center rounded-full border border-line text-muted hover:bg-hover hover:text-ink disabled:opacity-50"
                    aria-label={milestone.completedAt ? "Mark incomplete" : "Mark complete"}
                  >
                    {milestone.completedAt ? <Check size={11} /> : <Circle size={9} />}
                  </button>
                  <span
                    className={`flex-1 text-xs ${milestone.completedAt ? "text-muted line-through" : ""}`}
                  >
                    {milestone.title}
                  </span>
                  {milestone.targetValue ? (
                    <span className="font-mono text-[10px] text-muted">
                      {milestone.targetValue}
                    </span>
                  ) : null}
                </Form>
              </li>
            ))}
          </ul>
        ) : null}

        {!compact ? (
          <>
            <details className="border-t border-line pt-3">
              <summary className="cursor-pointer text-xs text-muted underline decoration-line underline-offset-4 [&::-webkit-details-marker]:hidden">
                Add milestone
              </summary>
              <Form method="post" className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="intent" value="milestone" />
                <input type="hidden" name="goalId" value={goal.id} />
                <Input name="title" placeholder="Milestone" className="h-9 flex-1" />
                <Input
                  name="targetValue"
                  type="number"
                  min={1}
                  placeholder="Target"
                  className="h-9 w-24"
                />
                <Button type="submit" size="sm" variant="secondary" disabled={busy}>
                  Add
                </Button>
              </Form>
            </details>

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <Form method="post">
                <input type="hidden" name="intent" value="complete" />
                <input type="hidden" name="goalId" value={goal.id} />
                <Button type="submit" variant="secondary" size="sm" disabled={busy}>
                  Mark complete
                </Button>
              </Form>
              <Form method="post">
                <input type="hidden" name="intent" value="archive" />
                <input type="hidden" name="goalId" value={goal.id} />
                <Button type="submit" variant="ghost" size="sm" disabled={busy}>
                  Archive
                </Button>
              </Form>
              <Form method="post" className="ml-auto">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="goalId" value={goal.id} />
                <button
                  type="submit"
                  aria-label={`Delete ${goal.title}`}
                  disabled={busy}
                  className="inline-flex size-8 items-center justify-center rounded-sm text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </Form>
            </div>
          </>
        ) : null}
      </CardBody>
    </Card>
  );
}
