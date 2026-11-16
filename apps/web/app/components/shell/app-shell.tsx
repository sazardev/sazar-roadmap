import type { ReactNode } from "react";
import { PwaRuntime } from "~/components/pwa/pwa-runtime";
import type { Appearance } from "~/lib/appearance";
import { CommandPalette } from "./command-palette";
import { BottomNav, Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  user,
  appearance,
  stats,
}: {
  children: ReactNode;
  user: { name: string; email: string };
  appearance: Appearance;
  stats: { dueReviews: number; streak: number };
}) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar dueReviews={stats.dueReviews} streak={stats.streak} />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <Topbar name={user.name} email={user.email} appearance={appearance} />
        <PwaRuntime />
        <main
          id="main"
          className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-5 sm:px-6 md:px-7 md:pb-16 md:pt-7 lg:px-8 lg:py-8 xl:px-10 xl:py-9"
        >
          {children}
        </main>
      </div>
      <BottomNav dueReviews={stats.dueReviews} />
      <CommandPalette />
    </div>
  );
}
