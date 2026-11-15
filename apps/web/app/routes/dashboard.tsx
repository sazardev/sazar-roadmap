import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { Form, Link, redirect, useRouteLoaderData } from "react-router";
import { TopicStatusBadge } from "~/components/status";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import { ProgressBar, ProgressRing } from "~/components/ui/progress";
import { Card, CardBody, CardHeader, EmptyState, PageHeader, Stat } from "~/components/ui/surfaces";
import { WeeklyBars } from "~/components/weekly-bars";
import { getDueCards } from "~/features/flashcards/flashcards.server";
import { listGoals } from "~/features/goals/goals.server";
import {
  getEnglishToday,
  getReading,
  getTasksToday,
  getTopNews,
  integrationStatus,
} from "~/features/integrations/integrations.server";
import {
  ensureDailyPlan,
  getContinueTopics,
  getDailyPlan,
  getNextTopic,
  getRecentActivity,
  getWeeklyActivity,
  parseStudyKind,
  recordStudy,
} from "~/features/progress/progress.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { formatMinutes, percent, relativeDay } from "~/lib/utils";
import type { Route } from "./+types/dashboard";

export const meta = () => pageMeta("Today");

import { pageMeta } from "~/lib/meta";
import type { loader as appShellLoader } from "./app-shell";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const status = integrationStatus(env);

  const [
    next,
    continueTopics,
    weekly,
    activity,
    plan,
    goals,
    dueCards,
    tasks,
    reading,
    news,
    english,
  ] = await Promise.all([
    getNextTopic(env, user.id),
    getContinueTopics(env, user.id, 4),
    getWeeklyActivity(env, user.id),
    getRecentActivity(env, user.id, 6),
    getDailyPlan(env, user.id),
    listGoals(env, user.id),
    getDueCards(env, user.id, { limit: 3 }),
    status.tasks ? getTasksToday(env) : Promise.resolve(null),
    status.learn ? getReading(env) : Promise.resolve([]),
    status.news ? getTopNews(env, 3) : Promise.resolve([]),
    status.english ? getEnglishToday(env) : Promise.resolve(null),
  ]);

  return {
    next,
    continueTopics,
    weekly,
    activity,
    plan,
    goals: goals.filter((goal) => goal.status === "active").slice(0, 3),
    dueCards,
    dailyGoalMinutes: user.settings.dailyGoalMinutes,
    weeklyGoalMinutes: user.settings.weeklyGoalMinutes,
    integrations: {
      status,
      tasks,
      reading,
      news,
      english,
    },
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const env = getEnv(context);

  if (intent === "log") {
    const topicId = String(form.get("topicId") ?? "");
    const minutes = Number(form.get("minutes") ?? 15);
    if (!topicId) return Response.json({ error: "Missing topic" }, { status: 400 });
    await recordStudy(env, user.id, {
      topicId,
      minutes: Number.isFinite(minutes) ? minutes : 15,
      kind: parseStudyKind(form.get("kind")),
    });
    return redirect("/");
  }

  if (intent === "plan") {
    await ensureDailyPlan(env, user.id, user.settings.dailyGoalMinutes);
    return redirect("/");
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

const activityLabels: Record<string, string> = {
  study: "logged a study session",
  status: "updated a topic",
  review: "reviewed a flashcard",
  coach: "asked the coach",
  progress_reset: "reset a topic",
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const shell = useRouteLoaderData<typeof appShellLoader>("routes/app-shell");
  const stats = shell?.stats;
  const {
    next,
    continueTopics,
    weekly,
    activity,
    plan,
    goals,
    dueCards,
    dailyGoalMinutes,
    integrations,
  } = loaderData;
  const firstName = shell?.user.name.split(/\s+/)[0] ?? "there";
  const dateLabel = new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const overall = stats ? percent(stats.completed, stats.totalTopics) : 0;
  const todayMinutes = stats?.minutesToday ?? 0;
  const todayPercent = percent(todayMinutes, dailyGoalMinutes);
  const planDone = plan?.completedMinutes ?? 0;
  const planTarget = plan?.targetMinutes ?? dailyGoalMinutes;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${dateLabel} · Private workspace`}
        title={`Good ${greeting()}, ${firstName}.`}
        description="A small, deliberate session beats a heroic one. Pick the next thing, do the work, then log what changed."
        actions={
          <>
            {next ? (
              <LinkButton
                to={`/roadmaps/${next.roadmapSlug}/${next.slug}`}
                icon={<ArrowRight size={15} />}
              >
                Continue {next.roadmapTitle}
              </LinkButton>
            ) : (
              <LinkButton to="/roadmaps" icon={<ArrowRight size={15} />}>
                Choose a path
              </LinkButton>
            )}
            <LinkButton to="/coach" variant="secondary" icon={<Sparkles size={15} />}>
              Ask the coach
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Target size={14} strokeWidth={1.8} />
              <span className="font-medium text-ink">Today's focus</span>
              {plan ? (
                <Badge tone="outline">Plan created</Badge>
              ) : (
                <Badge tone="outline">Suggested</Badge>
              )}
            </div>
            <span className="font-mono text-[10px] text-muted">
              {planDone}/{planTarget} min
            </span>
          </div>
          {next ? (
            <CardBody className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {next.roadmapTitle} / {next.stageTitle}
                </p>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight">
                  {next.title}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-muted">{next.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={13} /> {next.estimatedMinutes} min
                </span>
                <TopicStatusBadge status={next.status} />
                <span>{next.stageTitle}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LinkButton
                  to={`/roadmaps/${next.roadmapSlug}/${next.slug}`}
                  icon={<ArrowRight size={15} />}
                >
                  Open topic
                </LinkButton>
                <Form method="post">
                  <input type="hidden" name="intent" value="log" />
                  <input type="hidden" name="topicId" value={next.id} />
                  <input type="hidden" name="minutes" value="15" />
                  <input type="hidden" name="kind" value="read" />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-2 rounded-sm border border-line px-4 text-sm font-medium transition-colors duration-fast hover:bg-hover"
                  >
                    <Check size={14} /> Log 15 minutes
                  </button>
                </Form>
                <Link
                  to={`/coach?topic=${next.id}`}
                  className="inline-flex h-10 items-center gap-2 rounded-sm px-3 text-sm text-muted transition-colors duration-fast hover:bg-hover hover:text-ink"
                >
                  <Sparkles size={14} /> Ask about this
                </Link>
              </div>
            </CardBody>
          ) : (
            <CardBody>
              <EmptyState
                title="You have reached the end of the guided paths"
                description="Review what you have learned, or import another roadmap from the content library."
                action={
                  <LinkButton to="/roadmaps" variant="secondary">
                    Browse the library
                  </LinkButton>
                }
              />
            </CardBody>
          )}
        </Card>

        <Card>
          <CardHeader
            title="At a glance"
            description="The smallest useful dashboard: time, streak, reviews and depth."
          />
          <CardBody className="space-y-5">
            <div className="flex items-center gap-5">
              <ProgressRing
                value={overall}
                label={`${overall}% of guided topics completed`}
                size={64}
              />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">{overall}% of the guided path</p>
                <p className="text-xs text-muted">
                  {stats?.completed ?? 0} practiced or mastered of {stats?.totalTopics ?? 0} topics
                </p>
                <Link to="/roadmaps" className="inline-flex items-center gap-1 text-xs underline">
                  See the map <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <Stat
                label="Today"
                value={`${todayMinutes}m`}
                hint={`${todayPercent}% of ${dailyGoalMinutes}m`}
              />
              <Stat
                label="This week"
                value={formatMinutes(stats?.minutesThisWeek ?? 0)}
                hint={`${stats?.sessionsThisWeek ?? 0} sessions`}
              />
              <Stat
                label="Streak"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Flame size={18} /> {stats?.streak ?? 0}
                  </span>
                }
                hint="Consecutive days with a session"
              />
              <Stat
                label="Due reviews"
                value={stats?.dueReviews ?? 0}
                hint={`${stats?.newCards ?? 0} new cards available`}
              />
            </div>
            <ProgressBar value={planDone} max={planTarget} label="Today's plan" showValue />
            {!plan ? (
              <Form method="post">
                <input type="hidden" name="intent" value="plan" />
                <button
                  type="submit"
                  className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink"
                >
                  Turn this suggestion into today's plan
                </button>
              </Form>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="This week"
            description={`Minutes logged against a ${dailyGoalMinutes}-minute daily floor.`}
            action={
              <Link to="/goals" className="text-xs text-muted underline">
                Goals
              </Link>
            }
          />
          <CardBody>
            <WeeklyBars days={weekly} goalMinutes={dailyGoalMinutes} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
              <span>
                {formatMinutes(weekly.reduce((total, day) => total + day.minutes, 0))} logged in 7
                days
              </span>
              <span>{weekly.reduce((total, day) => total + day.sessions, 0)} sessions</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Due reviews"
            description="Retrieval is where knowledge becomes durable."
            action={
              <Link to="/flashcards" className="text-xs text-muted underline">
                Open deck
              </Link>
            }
          />
          <CardBody>
            {dueCards.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted">No cards are due right now.</p>
                <LinkButton
                  to="/flashcards"
                  variant="secondary"
                  size="sm"
                  icon={<GraduationCap size={14} />}
                >
                  Study ahead
                </LinkButton>
              </div>
            ) : (
              <ul className="space-y-3">
                {dueCards.map((card) => (
                  <li
                    key={card.id}
                    className="space-y-1 border-b border-line pb-3 last:border-0 last:pb-0"
                  >
                    <p className="line-clamp-2 text-sm font-medium">{card.front}</p>
                    <p className="truncate text-[11px] text-muted">{card.topicTitle}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Continue the path"
            description="Next topics in your guided and reference roadmaps."
            action={
              <Link to="/roadmaps" className="text-xs text-muted underline">
                All roadmaps
              </Link>
            }
          />
          <CardBody className="divide-y divide-line p-0">
            {continueTopics.length === 0 ? (
              <div className="p-5 text-sm text-muted">Nothing queued. Add another roadmap.</div>
            ) : (
              continueTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
                  className="flex items-center gap-4 px-5 py-3 transition-colors duration-fast hover:bg-hover"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-muted">
                      {topic.roadmapTitle} / {topic.stageTitle}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-medium">{topic.title}</span>
                  </span>
                  <span className="hidden text-[11px] text-muted sm:block">
                    {topic.estimatedMinutes} min
                  </span>
                  <TopicStatusBadge status={topic.status} />
                  <ArrowRight size={14} className="shrink-0 text-muted" />
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Goals"
            description="Targets that move the path forward."
            action={
              <Link to="/goals" className="text-xs text-muted underline">
                Manage
              </Link>
            }
          />
          <CardBody className="space-y-5">
            {goals.length === 0 ? (
              <p className="text-sm text-muted">No active goals. Create one from the Goals page.</p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium">{goal.title}</p>
                    <span className="shrink-0 font-mono text-[10px] text-muted">
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <ProgressBar value={goal.currentValue} max={goal.targetValue} />
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <section aria-labelledby="apps-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="apps-heading" className="text-lg font-semibold tracking-tight">
              From your other apps
            </h2>
            <p className="text-sm text-muted">
              The rest of the sazardev workspace, read-only unless you take an action.
            </p>
          </div>
          <Link to="/settings" className="text-xs text-muted underline">
            Integrations
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <IntegrationCard
            icon={<Check size={15} />}
            title="Tasks"
            available={integrations.status.tasks}
            href="https://tasks.sazardev.stream"
            empty="No tasks are due today."
          >
            {integrations.tasks ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">{integrations.tasks.today}</span> due today ·{" "}
                  <span className="font-medium text-danger">{integrations.tasks.overdue}</span>{" "}
                  overdue
                </p>
                {integrations.tasks.tasks.slice(0, 3).map((task) => (
                  <p key={task.id} className="truncate text-xs text-muted">
                    {task.title}
                  </p>
                ))}
              </div>
            ) : null}
          </IntegrationCard>

          <IntegrationCard
            icon={<BookOpen size={15} />}
            title="Learn"
            available={integrations.status.learn}
            href="https://learn.sazardev.stream"
            empty="No reading in progress."
          >
            {integrations.reading.length > 0 ? (
              <div className="space-y-2">
                {integrations.reading.slice(0, 3).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <p className="truncate text-xs font-medium">{item.title}</p>
                    <ProgressBar value={Math.round(item.progress * 100)} max={100} />
                  </div>
                ))}
              </div>
            ) : null}
          </IntegrationCard>

          <IntegrationCard
            icon={<CalendarDays size={15} />}
            title="News"
            available={integrations.status.news}
            href="https://news.sazardev.stream"
            empty="No stories today."
          >
            {integrations.news.length > 0 ? (
              <div className="space-y-2">
                {integrations.news.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    className="block truncate text-xs text-muted underline"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            ) : null}
          </IntegrationCard>

          <IntegrationCard
            icon={<GraduationCap size={15} />}
            title="English"
            available={integrations.status.english}
            href="https://english.sazardev.stream"
            empty="No English session today."
          >
            {integrations.english ? (
              <div className="space-y-1.5 text-xs">
                <p className="text-sm font-medium">{integrations.english.focus}</p>
                <p className="text-muted">
                  Day {integrations.english.day} · {integrations.english.streak}-day streak
                </p>
                <p className="text-muted">
                  {integrations.english.due} cards due · {integrations.english.reviews} reviews
                </p>
              </div>
            ) : null}
          </IntegrationCard>
        </div>
      </section>

      <Card>
        <CardHeader title="Recent activity" description="A quiet log of what actually happened." />
        <CardBody className="p-0">
          {activity.length === 0 ? (
            <div className="p-5 text-sm text-muted">
              No activity yet. Log your first session above.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((item) => {
                const metadata = item.metadata;
                const label = activityLabels[item.kind] ?? item.kind.replace(/_/g, " ");
                const title =
                  typeof metadata.topic === "string"
                    ? metadata.topic
                    : typeof metadata.question === "string"
                      ? metadata.question
                      : typeof metadata.card === "string"
                        ? metadata.card
                        : (item.entityType ?? "item");
                return (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className="size-1.5 shrink-0 rounded-full bg-line-strong" />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{title}</span>{" "}
                      <span className="text-muted">{label}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">
                      {relativeDay(item.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function IntegrationCard({
  icon,
  title,
  available,
  href,
  empty,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  available: boolean;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            {icon}
            {title}
          </span>
        }
        action={
          <a href={href} className="text-muted hover:text-ink" aria-label={`Open ${title}`}>
            <ArrowUpRight size={14} />
          </a>
        }
      />
      <CardBody className="min-h-24 text-sm">
        {!available ? (
          <p className="text-xs text-muted">Not connected. Add the integration key in Settings.</p>
        ) : children ? (
          children
        ) : (
          <p className="text-xs text-muted">{empty}</p>
        )}
      </CardBody>
    </Card>
  );
}
