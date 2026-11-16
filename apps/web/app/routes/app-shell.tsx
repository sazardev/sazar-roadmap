import { Outlet, redirect } from "react-router";
import { AppShell } from "~/components/shell/app-shell";
import { getLearningStats } from "~/features/progress/progress.server";
import { readAppearance } from "~/lib/appearance.server";
import { requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/app-shell";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  if (!user.profile.onboardingCompletedAt) throw redirect("/onboarding");
  const stats = await getLearningStats(getEnv(context), user.id);
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
    },
    appearance,
    stats,
  };
}

export default function AppShellRoute({ loaderData }: Route.ComponentProps) {
  return (
    <AppShell user={loaderData.user} appearance={loaderData.appearance} stats={loaderData.stats}>
      <Outlet />
    </AppShell>
  );
}
