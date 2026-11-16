"use client";

import { Route, Search } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Kbd } from "~/components/ui/badge";
import type { Appearance } from "~/lib/appearance";
import { titleCase } from "~/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const sectionTitles: Record<string, string> = {
  "": "Dashboard",
  roadmaps: "Roadmaps",
  coach: "Coach",
  practice: "Practice",
  flashcards: "Flashcards",
  goals: "Goals",
  resources: "Resources",
  people: "People",
  notes: "Notes",
  search: "Search",
  settings: "Settings",
  more: "More",
  account: "Account",
};

function sectionTitle(pathname: string): string {
  if (pathname === "/coach/history") return "Coach history";
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return "Dashboard";
  return sectionTitles[first] ?? titleCase(first);
}

export function Topbar({ name, appearance }: { name: string; appearance: Appearance }) {
  const location = useLocation();
  const section = sectionTitle(location.pathname);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "S";

  return (
    <header className="z-30 border-b border-line/60 bg-canvas pt-[env(safe-area-inset-top)] md:sticky md:top-0 md:border-line/80 md:bg-canvas/85 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-canvas/65">
      <div className="flex h-14 items-center gap-1.5 px-3 sm:h-16 sm:gap-2 sm:px-6 md:h-[76px] md:gap-4 md:px-7 lg:px-8 xl:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-2 md:hidden">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-ink shadow-sm">
            <Route size={17} strokeWidth={1.9} />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">Roadmap</span>
          <span className="sr-only">sazardev Roadmap home</span>
        </Link>

        <div className="hidden min-w-0 md:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Sazar workspace
          </p>
          <h2 className="truncate text-base font-semibold tracking-tight">{section}</h2>
        </div>

        <div className="ml-auto flex items-center gap-0.5 md:gap-2">
          <Link
            to="/search"
            aria-label="Search everything"
            className="group inline-flex size-10 shrink-0 items-center justify-center gap-2.5 rounded-full text-sm text-muted transition-colors duration-fast hover:bg-hover hover:text-ink sm:h-10 sm:w-auto sm:justify-start sm:border sm:border-line sm:bg-raised sm:px-3.5 sm:shadow-sm sm:hover:border-line-strong md:min-w-56 md:h-11 lg:min-w-72"
          >
            <Search size={18} strokeWidth={1.9} className="shrink-0" />
            <span className="hidden sm:inline">Search anything</span>
            <span className="ml-auto hidden md:block">
              <Kbd>Ctrl K</Kbd>
            </span>
          </Link>

          <div className="hidden sm:block">
            <ThemeToggle initial={appearance.theme} compact />
          </div>

          <Link
            to="/account"
            aria-label="Account, appearance and offline settings"
            className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent transition-colors duration-fast hover:bg-hover sm:size-11 sm:text-sm"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
