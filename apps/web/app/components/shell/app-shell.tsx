import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { PwaRuntime } from "~/components/pwa/pwa-runtime";
import type { Appearance } from "~/lib/appearance";
import { cn } from "~/lib/utils";
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
  const location = useLocation();
  const isChat = location.pathname === "/coach";

  return (
    <div
      className={cn(
        "min-h-dvh md:grid md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)]",
        isChat && "h-dvh overflow-hidden",
      )}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar dueReviews={stats.dueReviews} streak={stats.streak} />
      <div className={cn("flex min-w-0 flex-col", isChat ? "h-dvh min-h-0" : "min-h-dvh")}>
        <div className={isChat ? "hidden md:block" : undefined}>
          <Topbar name={user.name} appearance={appearance} />
        </div>
        <PwaRuntime />
        <main
          id="main"
          className={
            isChat
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "mx-auto w-full max-w-[1440px] flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pt-5 md:px-7 md:pb-16 md:pt-7 lg:px-8 lg:py-8 xl:px-10 xl:py-9"
          }
        >
          {children}
        </main>
      </div>
      <BottomNav dueReviews={stats.dueReviews} />
      <CommandPalette />
    </div>
  );
}
