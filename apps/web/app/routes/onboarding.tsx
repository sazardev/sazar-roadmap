import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Form, redirect } from "react-router";
import { ThemeToggle } from "~/components/shell/theme-toggle";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input, Select } from "~/components/ui/field";
import { Card, CardHeader } from "~/components/ui/surfaces";
import { ensureStarterGoals } from "~/features/goals/goals.server";
import { ensureDailyPlan } from "~/features/progress/progress.server";
import { getRoadmapOptions } from "~/features/roadmaps/roadmaps.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { titleCase } from "~/lib/utils";
import type { Route } from "./+types/onboarding";

export const meta = () => pageMeta("Set up your workspace");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  if (user.profile.onboardingCompletedAt) throw redirect("/");
  const url = new URL(request.url);
  const step = Math.min(3, Math.max(1, Number(url.searchParams.get("step") ?? 1) || 1));
  const roadmaps = await getRoadmapOptions(getEnv(context));
  return {
    step,
    user: { name: user.name, email: user.email, timezone: user.profile.timezone },
    settings: user.settings,
    roadmaps: roadmaps.filter((roadmap) => roadmap.status === "guided"),
    selectedRoadmap: url.searchParams.get("roadmap") ?? "",
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const now = new Date().toISOString();

  if (intent === "skip") {
    await env.DB.prepare(
      "UPDATE profiles SET onboarding_completed_at = ?, updated_at = ? WHERE id = ?",
    )
      .bind(now, now, user.id)
      .run();
    await ensureStarterGoals(env, user.id, user.settings.weeklyGoalMinutes);
    return redirect("/");
  }

  if (intent === "step-1") {
    const displayName =
      String(form.get("displayName") ?? "")
        .trim()
        .slice(0, 80) || user.name;
    const timezone = String(form.get("timezone") ?? "UTC");
    const daily = Math.min(480, Math.max(5, Number(form.get("dailyGoalMinutes") ?? 30) || 30));
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE profiles SET display_name = ?, timezone = ?, updated_at = ? WHERE id = ?",
      ).bind(displayName, timezone, now, user.id),
      env.DB.prepare(
        "UPDATE user_settings SET daily_goal_minutes = ?, updated_at = ? WHERE user_id = ?",
      ).bind(daily, now, user.id),
    ]);
    return redirect("/onboarding?step=2");
  }

  if (intent === "step-2") {
    const weekly = Math.min(
      3000,
      Math.max(30, Number(form.get("weeklyGoalMinutes") ?? 180) || 180),
    );
    const roadmap = String(form.get("roadmap") ?? "");
    const roadmaps = await getRoadmapOptions(env);
    const safeRoadmap = roadmaps.some((item) => item.slug === roadmap) ? roadmap : "frontend";
    await env.DB.prepare(
      "UPDATE user_settings SET weekly_goal_minutes = ?, updated_at = ? WHERE user_id = ?",
    )
      .bind(weekly, now, user.id)
      .run();
    return redirect(`/onboarding?step=3&roadmap=${encodeURIComponent(safeRoadmap)}`);
  }

  if (intent === "finish") {
    const requested = String(form.get("roadmap") ?? "frontend");
    const roadmaps = await getRoadmapOptions(env);
    const roadmap = roadmaps.some((item) => item.slug === requested) ? requested : "frontend";
    const weekly = user.settings.weeklyGoalMinutes;
    await ensureStarterGoals(env, user.id, weekly);
    await ensureDailyPlan(env, user.id, user.settings.dailyGoalMinutes);
    await env.DB.prepare(
      "UPDATE profiles SET onboarding_completed_at = ?, updated_at = ? WHERE id = ?",
    )
      .bind(now, now, user.id)
      .run();
    return redirect(`/roadmaps/${encodeURIComponent(roadmap)}`);
  }

  return redirect("/onboarding");
}

export default function OnboardingPage({ loaderData }: Route.ComponentProps) {
  const { step, user, settings, roadmaps, selectedRoadmap } = loaderData;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">sazardev</p>
          <p className="text-lg font-semibold tracking-tight">Roadmap</p>
        </div>
        <ThemeToggle initial={settings.theme as "system" | "light" | "dark"} />
      </header>

      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3].map((number) => (
              <span
                key={number}
                className={`h-1 flex-1 rounded-full ${number <= step ? "bg-ink" : "bg-line"}`}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] text-muted">Step {step} of 3</span>
        </div>

        {step === 1 ? (
          <Card>
            <CardHeader
              title="A private learning workspace"
              description="Three quick choices, then the work begins. Everything lives behind your shared sazardev session."
            />
            <Form method="post" className="space-y-5 p-5 sm:p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">What should we call you?</h2>
                <p className="text-sm text-muted">
                  This is only used in the interface and the coach prompt.
                </p>
              </div>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Display name</span>
                <Input name="displayName" defaultValue={user.name} required autoFocus />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium">Timezone</span>
                  <Select name="timezone" defaultValue={user.timezone}>
                    {[
                      "America/Mexico_City",
                      "America/Los_Angeles",
                      "America/New_York",
                      "Europe/Madrid",
                      "Europe/London",
                      "UTC",
                    ].map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium">Daily minutes</span>
                  <Input
                    name="dailyGoalMinutes"
                    type="number"
                    min={5}
                    max={480}
                    defaultValue={settings.dailyGoalMinutes}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" name="intent" value="step-1" icon={<ArrowRight size={15} />}>
                  Continue
                </Button>
                <button
                  type="submit"
                  name="intent"
                  value="skip"
                  className="text-xs text-muted underline"
                >
                  Skip setup
                </button>
              </div>
            </Form>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader
              title="Choose a starting path"
              description="You can use all of them later. This only decides where the workspace opens after setup."
            />
            <Form method="post" className="space-y-5 p-5 sm:p-6">
              <input type="hidden" name="intent" value="step-2" />
              <div className="grid gap-2">
                {roadmaps.map((roadmap) => (
                  <label
                    key={roadmap.id}
                    className="flex cursor-pointer items-start gap-3 rounded-sm border border-line px-4 py-3 transition-colors duration-fast has-[:checked]:border-ink has-[:checked]:bg-surface"
                  >
                    <input
                      type="radio"
                      name="roadmap"
                      value={roadmap.slug}
                      defaultChecked={(selectedRoadmap || "frontend") === roadmap.slug}
                      className="mt-1 accent-[var(--ink)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{roadmap.title}</span>
                      <span className="block text-xs text-muted">
                        {titleCase(roadmap.status)} ·{" "}
                        {roadmap.id === "ai-engineer"
                          ? "Models, retrieval, agents and evaluation"
                          : "A guided path with stages and practice"}
                      </span>
                    </span>
                    <Badge tone="outline">Guided</Badge>
                  </label>
                ))}
              </div>
              <label className="block space-y-1.5 sm:max-w-xs">
                <span className="text-sm font-medium">Weekly minutes goal</span>
                <Input
                  name="weeklyGoalMinutes"
                  type="number"
                  min={30}
                  max={3000}
                  defaultValue={settings.weeklyGoalMinutes}
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/onboarding?step=1"
                  className="inline-flex h-10 items-center gap-1 text-xs text-muted underline"
                >
                  <ArrowLeft size={12} /> Back
                </a>
                <Button type="submit" icon={<ArrowRight size={15} />}>
                  Continue
                </Button>
              </div>
            </Form>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardHeader
              title="Ready to start"
              description="The workspace will create two starter goals and a daily plan, then open your chosen path."
            />
            <Form method="post" className="space-y-5 p-5 sm:p-6">
              <input type="hidden" name="intent" value="finish" />
              <input type="hidden" name="roadmap" value={selectedRoadmap || "frontend"} />
              <ul className="space-y-3 text-sm">
                {[
                  "A private dashboard with today's focus, progress and reviews.",
                  "A guided path with practice prompts and a coach that cites topics.",
                  "Weekly time and topic goals that update from logged sessions.",
                  "Spaced review over the cards generated from every guided topic.",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check size={15} className="mt-0.5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-sm border border-line bg-surface px-4 py-3 text-xs text-muted">
                <p className="inline-flex items-center gap-1.5 font-medium text-ink">
                  <Sparkles size={12} /> Content note
                </p>
                <p className="mt-1 leading-relaxed">
                  This app is a personal-use copy of the roadmap.sh fork. It stays behind the shared
                  session and is not indexed. Guided curricula and practice prompts are original to
                  this app.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/onboarding?step=2"
                  className="inline-flex h-10 items-center gap-1 text-xs text-muted underline"
                >
                  <ArrowLeft size={12} /> Back
                </a>
                <Button type="submit" icon={<ArrowRight size={15} />}>
                  Enter workspace
                </Button>
              </div>
            </Form>
          </Card>
        ) : null}
      </div>

      <p className="text-center text-[10px] text-muted">
        Shared session by auth.sazardev.stream · No public profile, no indexing, no analytics
        scripts.
      </p>
    </main>
  );
}
