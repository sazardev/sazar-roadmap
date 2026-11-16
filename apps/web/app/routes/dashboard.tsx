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
import { buttonClass, LinkButton } from "~/components/ui/button";
import { ProgressBar, ProgressRing } from "~/components/ui/progress";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
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
  const timezone = user.profile.timezone || "UTC";
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  }).format(now);
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: timezone,
    }).format(now),
  );
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

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
    getDueCards(env, user.id, { limit: 3, includeNew: false }),
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
    dateLabel,
    greeting,
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
    dateLabel,
    greeting,
    integrations,
  } = loaderData;
  const firstName = shell?.user.name.split(/\s+/)[0] ?? "there";
  const overall = stats ? percent(stats.completed, stats.totalTopics) : 0;
  const todayMinutes = stats?.minutesToday ?? 0;
  const todayPercent = percent(todayMinutes, dailyGoalMinutes);
  const planDone = plan?.completedMinutes ?? 0;
  const planTarget = plan?.targetMinutes ?? dailyGoalMinutes;
  const hasIntegrations = Object.values(integrations.status).some(Boolean);

  return (
    <div className="space-y-7 md:space-y-9">
      <PageHeader
        eyebrow={`${dateLabel} · Private workspace`}
        title={`Good ${greeting}, ${firstName}.`}
        description="A small, deliberate session beats a heroic one. Pick the next thing, do the work, then log what changed."
        actions={
          <>
            {next ? (
              <LinkButton
                to={`/roadmaps/${next.roadmapSlug}/${next.slug}`}
                icon={<ArrowRight size={17} />}
              >
                Continue {next.roadmapTitle}
              </LinkButton>
            ) : (
              <LinkButton to="/roadmaps" icon={<ArrowRight size={17} />}>
                Choose a path
              </LinkButton>
            )}
            <LinkButton to="/coach" variant="secondary" icon={<Sparkles size={17} />}>
              Ask the coach
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="accent-band flex flex-wrap items-center justify-between gap-3 border-b border-line/80 px-5 py-4 md:px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-ink shadow-sm">
                <Target size={17} strokeWidth={2} />
              </span>
              <span className="font-semibold">Today's focus</span>
              {plan ? (
                <Badge tone="outline">Plan created</Badge>
              ) : (
                <Badge tone="outline">Suggested</Badge>
              )}
            </div>
            <span className="hidden font-mono text-xs text-muted sm:inline">
              {planDone}/{planTarget} min
            </span>
          </div>
          {next ? (
            <CardBody className="space-y-6 p-5 md:p-7">
              <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {next.roadmapTitle} / {next.stageTitle}
                </p>
                <h2 className="max-w-2xl text-2xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-3xl">
                  {next.title}
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-muted">{next.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 text-xs text-muted">
                  <Clock3 size={14} /> {next.estimatedMinutes} min
                </span>
                <TopicStatusBadge status={next.status} />
                <span className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface/70 px-3 text-xs text-muted">
                  {next.stageTitle}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <LinkButton
                  to={`/roadmaps/${next.roadmapSlug}/${next.slug}`}
                  icon={<ArrowRight size={16} />}
                >
                  Open topic
                </LinkButton>
                <Form method="post">
                  <input type="hidden" name="intent" value="log" />
                  <input type="hidden" name="topicId" value={next.id} />
                  <input type="hidden" name="minutes" value="15" />
                  <input type="hidden" name="kind" value="read" />
                  <button type="submit" className={buttonClass("secondary")}>
                    <Check size={16} /> Log 15 minutes
                  </button>
                </Form>
                <Link to={`/coach?topic=${next.id}`} className={buttonClass("ghost")}>
                  <Sparkles size={16} /> Ask about this
                </Link>
              </div>
            </CardBody>
          ) : (
            <CardBody className="p-5 md:p-7">
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

        <Card className="flex flex-col">
          <CardHeader
            title="This session"
            description="The shape of today's work: progress, time and the next review."
          />
          <CardBody className="flex flex-1 flex-col gap-5">
            <div className="flex items-center gap-5">
              <ProgressRing
                value={overall}
                label={`${overall}% of guided topics completed`}
                size={78}
                stroke={6}
              />
              <div className="min-w-0 space-y-1.5">
                <p className="text-base font-semibold leading-tight">
                  {overall}% of the guided path
                </p>
                <p className="text-sm leading-relaxed text-muted">
                  {stats?.completed ?? 0} practiced or mastered of {stats?.totalTopics ?? 0} topics
                </p>
                <Link
                  to="/roadmaps"
                  className="inline-flex min-h-8 items-center gap-1 text-xs font-medium text-accent underline decoration-accent/30 underline-offset-4"
                >
                  See the map <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            <div className="mt-auto space-y-3 border-t border-line/80 pt-4">
              <ProgressBar value={planDone} max={planTarget} label="Today's plan" showValue />
              <p className="text-sm leading-relaxed text-muted">
                {planDone >= planTarget
                  ? "Today's plan is complete. Keep the streak with a short review."
                  : `${Math.max(planTarget - planDone, 0)} minutes left in today's plan.`}
              </p>
              {!plan ? (
                <Form method="post">
                  <input type="hidden" name="intent" value="plan" />
                  <button
                    type="submit"
                    className="inline-flex min-h-10 items-center rounded-sm text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                  >
                    Turn this suggestion into today's plan
                  </button>
                </Form>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          icon={<Clock3 size={16} />}
          label="Today"
          value={`${todayMinutes}m`}
          hint={`${todayPercent}% of ${dailyGoalMinutes}m`}
        />
        <Metric
          icon={<CalendarDays size={16} />}
          label="This week"
          value={formatMinutes(stats?.minutesThisWeek ?? 0)}
          hint={`${stats?.sessionsThisWeek ?? 0} sessions`}
        />
        <Metric
          icon={<Flame size={16} />}
          label="Streak"
          value={`${stats?.streak ?? 0}d`}
          hint="Consecutive days"
        />
        <Metric
          icon={<GraduationCap size={16} />}
          label="Due reviews"
          value={String(stats?.dueReviews ?? 0)}
          hint={`${stats?.newCards ?? 0} new cards`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="This week"
            description={`Minutes logged against a ${dailyGoalMinutes}-minute daily floor.`}
            action={
              <LinkButton to="/goals" variant="ghost" size="sm">
                Goals
              </LinkButton>
            }
          />
          <CardBody>
            <WeeklyBars days={weekly} goalMinutes={dailyGoalMinutes} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/80 pt-4 text-sm text-muted">
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
              <LinkButton to="/flashcards" variant="ghost" size="sm">
                Open deck
              </LinkButton>
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
                  icon={<GraduationCap size={15} />}
                >
                  Study ahead
                </LinkButton>
              </div>
            ) : (
              <ul className="space-y-1">
                {dueCards.map((card) => (
                  <li key={card.id}>
                    <Link
                      to={`/flashcards?topic=${card.topicId}`}
                      className="-mx-2 block min-h-14 space-y-1 rounded-md border-b border-line/70 px-2 py-2.5 transition-colors duration-fast last:border-0 hover:bg-hover"
                    >
                      <p className="line-clamp-2 text-sm font-medium leading-snug">{card.front}</p>
                      <p className="truncate text-xs text-muted">{card.topicTitle}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Continue the path"
            description="Next topics in your guided and reference roadmaps."
            action={
              <LinkButton to="/roadmaps" variant="ghost" size="sm">
                All roadmaps
              </LinkButton>
            }
          />
          <CardBody className="divide-y divide-line/70 p-0">
            {continueTopics.length === 0 ? (
              <div className="p-5 text-sm text-muted">Nothing queued. Add another roadmap.</div>
            ) : (
              continueTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
                  className="group flex min-h-[4.5rem] items-center gap-3 px-5 py-3 transition-colors duration-fast hover:bg-hover md:px-6"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] uppercase tracking-[0.14em] text-muted">
                      {topic.roadmapTitle} / {topic.stageTitle}
                    </span>
                    <span className="mt-1 block truncate text-base font-medium">{topic.title}</span>
                  </span>
                  <span className="hidden text-xs text-muted sm:block">
                    {topic.estimatedMinutes} min
                  </span>
                  <TopicStatusBadge status={topic.status} />
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface/60 text-muted transition-colors group-hover:border-accent/30 group-hover:bg-accent-soft group-hover:text-accent">
                    <ArrowRight size={15} />
                  </span>
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
              <LinkButton to="/goals" variant="ghost" size="sm">
                Manage
              </LinkButton>
            }
          />
          <CardBody className="space-y-5">
            {goals.length === 0 ? (
              <p className="text-sm text-muted">No active goals. Create one from the Goals page.</p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="space-y-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium">{goal.title}</p>
                    <span className="shrink-0 font-mono text-[11px] text-muted">
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

      {hasIntegrations ? (
        <section aria-labelledby="apps-heading" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 id="apps-heading" className="text-xl font-semibold tracking-tight">
                From your other apps
              </h2>
              <p className="text-sm text-muted">
                The rest of the sazardev workspace, read-only unless you take an action.
              </p>
            </div>
            <LinkButton to="/settings" variant="ghost" size="sm">
              Integrations
            </LinkButton>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <IntegrationCard
              icon={<Check size={17} />}
              title="Tasks"
              available={integrations.status.tasks}
              href="https://tasks.sazardev.stream"
              empty="No tasks are due today."
            >
              {integrations.tasks ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">{integrations.tasks.today}</span> due today ·{" "}
                    <span className="font-semibold text-danger">{integrations.tasks.overdue}</span>{" "}
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
              icon={<BookOpen size={17} />}
              title="Learn"
              available={integrations.status.learn}
              href="https://learn.sazardev.stream"
              empty="No reading in progress."
            >
              {integrations.reading.length > 0 ? (
                <div className="space-y-3">
                  {integrations.reading.slice(0, 3).map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <p className="truncate text-xs font-medium">{item.title}</p>
                      <ProgressBar value={Math.round(item.progress * 100)} max={100} />
                    </div>
                  ))}
                </div>
              ) : null}
            </IntegrationCard>

            <IntegrationCard
              icon={<CalendarDays size={17} />}
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
                      className="block min-h-8 truncate text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              ) : null}
            </IntegrationCard>

            <IntegrationCard
              icon={<GraduationCap size={17} />}
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
      ) : null}

      <Card>
        <CardHeader title="Recent activity" description="A quiet log of what actually happened." />
        <CardBody className="p-0">
          {activity.length === 0 ? (
            <div className="p-5 text-sm text-muted">
              No activity yet. Log your first session above.
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
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
                  <li
                    key={item.id}
                    className="flex min-h-14 items-center gap-3 px-5 py-3 text-sm md:px-6"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
                      <span className="size-2 rounded-full bg-accent" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{title}</span>{" "}
                      <span className="text-muted">{label}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">
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

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-raised p-4 shadow-card md:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
          {icon}
        </span>
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold leading-none tracking-tight">{value}</p>
      <p className="mt-2 text-xs leading-snug text-muted">{hint}</p>
    </div>
  );
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
          <span className="inline-flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent">
              {icon}
            </span>
            {title}
          </span>
        }
        action={
          <a
            href={href}
            className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-ink"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight size={16} />
          </a>
        }
      />
      <CardBody className="min-h-28 text-sm">
        {!available ? (
          <p className="text-xs leading-relaxed text-muted">
            Not connected. Add the integration key in Settings.
          </p>
        ) : children ? (
          children
        ) : (
          <p className="text-xs leading-relaxed text-muted">{empty}</p>
        )}
      </CardBody>
    </Card>
  );
}
