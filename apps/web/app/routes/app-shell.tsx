import { Outlet, redirect } from "react-router";
import { AppShell } from "~/components/shell/app-shell";
import { getLearningStats } from "~/features/progress/progress.server";
import { requireUser } from "~/lib/auth/auth.server";
import { readCookie } from "~/lib/auth/session.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/app-shell";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  if (!user.profile.onboardingCompletedAt) throw redirect("/onboarding");
  const stats = await getLearningStats(getEnv(context), user.id);
  const cookieTheme = readCookie(request.headers.get("cookie"), "sd_theme");
  const theme =
    cookieTheme === "light" || cookieTheme === "dark" || cookieTheme === "system"
      ? cookieTheme
      : user.settings.theme === "light" || user.settings.theme === "dark"
        ? user.settings.theme
        : "system";
  return {
    user: {
      name: user.name,
      email: user.email,
      theme,
    },
    stats,
  };
}

export default function AppShellRoute({ loaderData }: Route.ComponentProps) {
  return (
    <AppShell user={loaderData.user} stats={loaderData.stats}>
      <Outlet />
    </AppShell>
  );
}
