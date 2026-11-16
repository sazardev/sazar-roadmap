import { Link } from "react-router";
import { OfflineSettings } from "~/components/pwa/offline-settings";
import { SignOutButton } from "~/components/shell/sign-out-button";
import { ThemeToggle } from "~/components/shell/theme-toggle";
import { LinkButton } from "~/components/ui/button";
import { Card, CardBody, CardHeader, PageHeader } from "~/components/ui/surfaces";
import { readAppearance } from "~/lib/appearance.server";
import { requireUser } from "~/lib/auth/auth.server";
import { pageMeta } from "~/lib/meta";
import type { Route } from "./+types/account";

export const meta = () => pageMeta("Account");

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const appearance = readAppearance(request, {
    theme: user.settings.theme,
    accent: user.settings.accent,
    density: user.settings.density,
    corners: user.settings.corners,
    textSize: user.settings.textSize,
  });
  return {
    user: { name: user.name, email: user.email },
    appearance,
  };
}

export default function AccountPage({ loaderData }: Route.ComponentProps) {
  const { user, appearance } = loaderData;
  const initials =
    user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "S";

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Account"
        description="Profile, appearance, offline storage and the session on this device."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Profile" description="The name and email used across the workspace." />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <LinkButton to="/settings#profile" variant="secondary" size="sm">
                Edit profile
              </LinkButton>
              <Link
                to="/settings"
                className="inline-flex min-h-8 items-center px-2 text-xs text-muted underline underline-offset-4 hover:text-ink"
              >
                All settings
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Appearance"
            description="Theme, accent, density, corners and text size."
          />
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium capitalize">
                {appearance.theme} · {appearance.accent} · {appearance.density}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                Saved to your profile and this device.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle initial={appearance.theme} compact />
              <LinkButton to="/settings#appearance" variant="secondary" size="sm">
                Personalize
              </LinkButton>
            </div>
          </CardBody>
        </Card>
      </div>

      <OfflineSettings />

      <Card>
        <CardHeader
          title="Session"
          description="Signing out clears saved pages and local drafts on this device."
        />
        <CardBody>
          <SignOutButton />
        </CardBody>
      </Card>
    </div>
  );
}
