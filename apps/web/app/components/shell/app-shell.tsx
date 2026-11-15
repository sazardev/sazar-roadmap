import type { ReactNode } from "react";
import { CommandPalette } from "./command-palette";
import { BottomNav, Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  user,
  stats,
}: {
  children: ReactNode;
  user: { name: string; email: string; theme: string };
  stats: { dueReviews: number; streak: number };
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar dueReviews={stats.dueReviews} streak={stats.streak} />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <Topbar name={user.name} email={user.email} theme={user.theme} />
        <main
          id="main"
          className="mx-auto w-full max-w-[1320px] flex-1 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-16 lg:pt-6"
        >
          {children}
        </main>
      </div>
      <BottomNav dueReviews={stats.dueReviews} />
      <CommandPalette />
    </div>
  );
}
