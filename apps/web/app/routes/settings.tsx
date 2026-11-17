import { AlertTriangle, Check, Database, Sparkles } from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { AppearanceForm } from "~/components/shell/appearance";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Checkbox, Input, Select } from "~/components/ui/field";
import { Card, CardBody, CardHeader, PageHeader } from "~/components/ui/surfaces";
import { integrationStatus } from "~/features/integrations/integrations.server";
import { invalidateLearningStats } from "~/features/progress/progress.server";
import { normalizeAppearance } from "~/lib/appearance";
import { appearanceCookies, readAppearance } from "~/lib/appearance.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/settings";

export const meta = () => pageMeta("Settings");

import { pageMeta } from "~/lib/meta";

const AI_MODELS = [
  ["@cf/meta/llama-4-scout-17b-16e-instruct", "Llama 4 Scout · fast, 131K context"],
  ["@cf/openai/gpt-oss-120b", "GPT-OSS 120B · stronger reasoning"],
  ["@cf/qwen/qwen3-30b-a3b-fp8", "Qwen 3 30B · balanced"],
  ["@cf/deepseek-ai/deepseek-v4.1-flash-1017", "DeepSeek V4.1 Flash · low latency"],
] as const;

const TIMEZONES = [
  "America/Mexico_City",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
];

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const counts = await env.DB.prepare(
    `SELECT
       (SELECT count(*) FROM roadmaps) AS roadmaps,
       (SELECT count(*) FROM topics) AS topics,
       (SELECT count(*) FROM resources) AS resources,
       (SELECT count(*) FROM flashcards) AS cards,
       (SELECT count(*) FROM notes WHERE user_id = ?) AS notes,
       (SELECT count(*) FROM study_sessions WHERE user_id = ?) AS sessions,
       (SELECT count(*) FROM user_topic_progress WHERE user_id = ?) AS progress`,
  )
    .bind(user.id, user.id, user.id)
    .first<{
      roadmaps: number;
      topics: number;
      resources: number;
      cards: number;
      notes: number;
      sessions: number;
      progress: number;
    }>();

  const appearance = readAppearance(request, {
    theme: user.settings.theme,
    accent: user.settings.accent,
    density: user.settings.density,
    corners: user.settings.corners,
    textSize: user.settings.textSize,
  });
  return {
    user: {
      name: user.name,
      email: user.email,
      timezone: user.profile.timezone,
      locale: user.profile.locale,
    },
    settings: { ...user.settings, theme: appearance.theme },
    appearance,
    integrations: integrationStatus(env),
    counts: counts ?? {
      roadmaps: 0,
      topics: 0,
      resources: 0,
      cards: 0,
      notes: 0,
      sessions: 0,
      progress: 0,
    },
    integrationKeyConfigured: Boolean(env.INTEGRATION_KEY),
    environment: env.ENVIRONMENT,
    publicUrl: env.PUBLIC_URL,
    aiModel: env.AI_MODEL,
    vectorizeConfigured: Boolean(env.VECTORIZE),
    notice: url.searchParams.get("notice"),
    error: url.searchParams.get("error"),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const now = new Date().toISOString();

  if (intent === "profile") {
    const displayName = String(form.get("displayName") ?? "")
      .trim()
      .slice(0, 80);
    const timezone = String(form.get("timezone") ?? "UTC");
    const locale = String(form.get("locale") ?? "en").slice(0, 10);
    if (!displayName) return redirect("/settings?error=name");
    await env.DB.prepare(
      "UPDATE profiles SET display_name = ?, timezone = ?, locale = ?, updated_at = ? WHERE id = ?",
    )
      .bind(displayName, TIMEZONES.includes(timezone) ? timezone : "UTC", locale, now, user.id)
      .run();
    return redirect("/settings?notice=profile");
  }

  if (intent === "learning") {
    const daily = Math.min(480, Math.max(5, Number(form.get("dailyGoalMinutes") ?? 30) || 30));
    const weekly = Math.min(
      3000,
      Math.max(30, Number(form.get("weeklyGoalMinutes") ?? 180) || 180),
    );
    const weekStart = form.get("weekStart") === "0" ? 0 : 1;
    await env.DB.prepare(
      `UPDATE user_settings SET daily_goal_minutes = ?, weekly_goal_minutes = ?, week_start = ?, updated_at = ?
       WHERE user_id = ?`,
    )
      .bind(daily, weekly, weekStart, now, user.id)
      .run();
    invalidateLearningStats(user.id);
    return redirect("/settings?notice=learning");
  }

  if (intent === "appearance") {
    const appearance = normalizeAppearance({
      theme: String(form.get("theme") ?? ""),
      accent: String(form.get("accent") ?? ""),
      density: String(form.get("density") ?? ""),
      corners: String(form.get("corners") ?? ""),
      textSize: String(form.get("textSize") ?? ""),
    });
    const reducedMotion = form.get("reducedMotion") === "on" ? 1 : 0;
    await env.DB.prepare(
      `UPDATE user_settings
       SET theme = ?, density = ?, accent = ?, corners = ?, text_size = ?, reduced_motion = ?, updated_at = ?
       WHERE user_id = ?`,
    )
      .bind(
        appearance.theme,
        appearance.density,
        appearance.accent,
        appearance.corners,
        appearance.textSize,
        reducedMotion,
        now,
        user.id,
      )
      .run();
    return redirect("/settings?notice=appearance#appearance", {
      headers: appearanceCookies(appearance, request, reducedMotion === 1).map(
        (cookie) => ["Set-Cookie", cookie] as [string, string],
      ),
    });
  }

  if (intent === "ai") {
    const enabled = form.get("aiEnabled") === "on" ? 1 : 0;
    const model = String(form.get("aiModel") ?? "");
    const safeModel = AI_MODELS.some(([id]) => id === model) ? model : null;
    await env.DB.prepare(
      "UPDATE user_settings SET ai_enabled = ?, ai_model = ?, updated_at = ? WHERE user_id = ?",
    )
      .bind(enabled, safeModel, now, user.id)
      .run();
    return redirect("/settings?notice=ai");
  }

  if (intent === "reset-progress") {
    if (String(form.get("confirm") ?? "") !== "RESET") {
      return redirect("/settings?error=confirm-reset");
    }
    await env.DB.batch([
      env.DB.prepare("DELETE FROM user_topic_progress WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM study_sessions WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM flashcard_reviews WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM flashcard_attempts WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM practice_attempts WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM daily_plans WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM activity_events WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM goals WHERE user_id = ?").bind(user.id),
    ]);
    invalidateLearningStats(user.id);
    return redirect("/settings?notice=reset");
  }

  if (intent === "delete-notes") {
    if (String(form.get("confirm") ?? "") !== "DELETE") {
      return redirect("/settings?error=confirm-delete");
    }
    await env.DB.prepare("DELETE FROM notes WHERE user_id = ?").bind(user.id).run();
    return redirect("/settings?notice=notes-deleted");
  }

  return redirect("/settings?error=unknown");
}

const notices: Record<string, string> = {
  profile: "Profile updated.",
  learning: "Learning preferences updated.",
  appearance: "Appearance updated.",
  ai: "AI preferences updated.",
  reset: "Progress reset. Notes and integrations were left intact.",
  "notes-deleted": "All Roadmap notes deleted.",
};

const settingsSections = [
  ["profile", "Profile"],
  ["learning", "Learning"],
  ["appearance", "Appearance"],
  ["ai", "AI coach"],
  ["integrations", "Integrations"],
  ["content", "Content"],
  ["danger", "Danger zone"],
] as const;

const errors: Record<string, string> = {
  name: "A display name is required.",
  "confirm-reset": "Type RESET exactly to confirm.",
  "confirm-delete": "Type DELETE exactly to confirm.",
  unknown: "Unknown settings action.",
};

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const {
    user,
    settings,
    appearance,
    integrations,
    counts,
    integrationKeyConfigured,
    environment,
    publicUrl,
    aiModel,
    vectorizeConfigured,
    notice,
    error,
  } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const currentModel = settings.aiModel ?? aiModel;

  return (
    <div className="space-y-5 sm:space-y-7">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Profile, learning defaults, appearance, AI and the connections to the rest of the sazardev workspace."
        actions={
          <LinkButton to="/account" variant="secondary" size="sm">
            Account & offline
          </LinkButton>
        }
      />

      {notice && notices[notice] ? (
        <div className="rounded-lg border border-success/25 bg-success-soft px-4 py-3 text-sm">
          {notices[notice]}
        </div>
      ) : null}
      {error && errors[error] ? (
        <div className="rounded-lg border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {errors[error]}
        </div>
      ) : null}

      <nav
        aria-label="Settings sections mobile"
        className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
      >
        {settingsSections.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-line bg-raised px-3 text-xs font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1.5 text-sm">
            {settingsSections.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex min-h-10 items-center rounded-md px-3 text-muted transition-colors hover:bg-hover hover:text-ink"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-5">
          <Card id="profile">
            <CardHeader
              title="Profile"
              description="How the workspace addresses you. The email comes from the shared session."
            />
            <Form method="post" className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
              <input type="hidden" name="intent" value="profile" />
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium">Display name</span>
                <Input name="displayName" defaultValue={user.name} required />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Timezone</span>
                <Select name="timezone" defaultValue={user.timezone}>
                  {TIMEZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Interface language</span>
                <Select name="locale" defaultValue={user.locale}>
                  <option value="en">English</option>
                </Select>
              </label>
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs text-muted">Email from auth.sazardev.stream</p>
                <Input value={user.email} readOnly disabled />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy}>
                  Save profile
                </Button>
              </div>
            </Form>
          </Card>

          <Card id="learning">
            <CardHeader
              title="Learning"
              description="Defaults for the dashboard, weekly goals and the daily plan."
            />
            <Form method="post" className="grid gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5">
              <input type="hidden" name="intent" value="learning" />
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
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Weekly minutes</span>
                <Input
                  name="weeklyGoalMinutes"
                  type="number"
                  min={30}
                  max={3000}
                  defaultValue={settings.weeklyGoalMinutes}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Week starts</span>
                <Select name="weekStart" defaultValue={String(settings.weekStart)}>
                  <option value="1">Monday</option>
                  <option value="0">Sunday</option>
                </Select>
              </label>
              <div className="flex items-end sm:col-span-3">
                <Button type="submit" disabled={busy}>
                  Save learning defaults
                </Button>
              </div>
            </Form>
          </Card>

          <Card id="appearance">
            <CardHeader
              title="Appearance"
              description="Tablet-first by default: larger targets, calmer surfaces and one accent that can be yours. Changes preview instantly and save to your account."
            />
            <AppearanceForm
              initial={appearance}
              reducedMotion={settings.reducedMotion}
              busy={busy}
            />
          </Card>

          <Card id="ai">
            <CardHeader
              title="AI coach"
              description="Workers AI is the default. The coach uses retrieved topics and cites them; it never sees secrets."
              action={
                <Badge tone="outline">
                  <Sparkles size={11} /> {vectorizeConfigured ? "Vectorize ready" : "FTS retrieval"}
                </Badge>
              }
            />
            <Form method="post" className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
              <input type="hidden" name="intent" value="ai" />
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium">Model</span>
                <Select name="aiModel" defaultValue={currentModel}>
                  {AI_MODELS.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </Select>
              </label>
              <div className="sm:col-span-2">
                <Checkbox
                  name="aiEnabled"
                  label="Enable the coach (fallback guidance still works when disabled)"
                  defaultChecked={settings.aiEnabled}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy}>
                  Save AI settings
                </Button>
              </div>
            </Form>
          </Card>

          <Card id="integrations">
            <CardHeader
              title="Integrations"
              description="Private service bindings in production. A missing key only hides the section; it never breaks a page."
              action={
                <Badge tone={integrationKeyConfigured ? "success" : "warning"}>
                  {integrationKeyConfigured ? "Key configured" : "Key missing"}
                </Badge>
              }
            />
            <CardBody className="space-y-1 p-0">
              {[
                [
                  "Notes",
                  "Create notes and search pages",
                  integrations.notes,
                  "https://notes.sazardev.stream",
                ],
                [
                  "Tasks",
                  "Today, overdue and study tasks",
                  integrations.tasks,
                  "https://tasks.sazardev.stream",
                ],
                [
                  "Learn",
                  "Reading progress and imports",
                  integrations.learn,
                  "https://learn.sazardev.stream",
                ],
                [
                  "News",
                  "Top stories for the dashboard",
                  integrations.news,
                  "https://news.sazardev.stream",
                ],
                [
                  "English",
                  "Daily lesson and review counts",
                  integrations.english,
                  "https://english.sazardev.stream",
                ],
              ].map(([label, description, connected, href]) => (
                <div
                  key={String(label)}
                  className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0"
                >
                  <span
                    className={`size-2 rounded-full ${connected ? "bg-success" : "bg-line-strong"}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-[11px] text-muted">{description}</p>
                  </div>
                  <Badge tone={connected ? "success" : "outline"}>
                    {connected ? "Connected" : "Unavailable"}
                  </Badge>
                  <a
                    href={String(href)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[11px] text-muted underline"
                  >
                    Open
                  </a>
                </div>
              ))}
            </CardBody>
            <CardBody className="border-t border-line text-xs leading-relaxed text-muted">
              Set{" "}
              <code className="rounded bg-hover px-1 py-0.5 font-mono text-[11px]">
                INTEGRATION_KEY
              </code>{" "}
              with{" "}
              <code className="rounded bg-hover px-1 py-0.5 font-mono text-[11px]">
                wrangler secret put INTEGRATION_KEY -c wrangler.prod.jsonc
              </code>
              . The same value is shared by Notes, Tasks, Learn, News and English. Never commit it.
            </CardBody>
          </Card>

          <Card id="content">
            <CardHeader
              title="Content"
              description="The fork, the imported roadmap previews and the search index."
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Count label="Roadmaps" value={counts.roadmaps} />
                <Count label="Topics" value={counts.topics} />
                <Count label="Resources" value={counts.resources} />
                <Count label="Cards" value={counts.cards} />
                <Count label="Notes" value={counts.notes} />
                <Count label="Sessions" value={counts.sessions} />
                <Count label="Progress rows" value={counts.progress} />
                <Count label="Environment" value={environment} />
              </div>
              <div className="flex items-start gap-2 rounded-sm border border-line bg-surface px-3 py-2.5 text-[11px] text-muted">
                <Database size={13} className="mt-0.5 shrink-0" />
                <span>
                  Content is seeded with <code className="font-mono">pnpm db:seed:remote</code>. The
                  seed only writes rows that changed; the search index is kept in sync by database
                  triggers. The public URL is <code className="font-mono">{publicUrl}</code>. Guided
                  curricula live in{" "}
                  <code className="font-mono">apps/web/app/content/curricula</code>.
                </span>
              </div>
            </CardBody>
          </Card>

          <Card id="danger" className="border-danger/30">
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2 text-danger">
                  <AlertTriangle size={15} /> Danger zone
                </span>
              }
              description="These actions are local to your account and cannot be undone."
            />
            <CardBody className="space-y-5">
              <Form method="post" className="space-y-2">
                <input type="hidden" name="intent" value="reset-progress" />
                <p className="text-sm font-medium">Reset learning progress</p>
                <p className="text-xs text-muted">
                  Deletes topic progress, sessions, reviews, attempts, activity, daily plans and
                  goals. Notes and integrations stay.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    name="confirm"
                    placeholder="Type RESET"
                    className="h-9 w-40"
                    aria-label="Type RESET to confirm"
                  />
                  <Button type="submit" variant="danger" size="sm" disabled={busy}>
                    Reset progress
                  </Button>
                </div>
              </Form>
              <Form method="post" className="space-y-2 border-t border-line pt-4">
                <input type="hidden" name="intent" value="delete-notes" />
                <p className="text-sm font-medium">Delete all Roadmap notes</p>
                <p className="text-xs text-muted">
                  Deletes notes stored inside this app. It does not touch the Notes app. External
                  note copies remain there.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    name="confirm"
                    placeholder="Type DELETE"
                    className="h-9 w-40"
                    aria-label="Type DELETE to confirm"
                  />
                  <Button type="submit" variant="danger" size="sm" disabled={busy}>
                    Delete notes
                  </Button>
                </div>
              </Form>
              <div className="flex items-center gap-2 border-t border-line pt-4 text-[11px] text-muted">
                <Check size={12} />
                <span>
                  Content and user data live in D1{" "}
                  <code className="font-mono">sazardev-roadmap</code>. Back it up with D1 Time
                  Travel before destructive changes.
                </span>
              </div>
            </CardBody>
          </Card>

          <p className="text-[11px] text-muted">
            Signed in as {user.email} ·{" "}
            <Link to="/logout" className="underline">
              Sign out
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-line bg-surface/60 px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-xl">{value}</p>
    </div>
  );
}
