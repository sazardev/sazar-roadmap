"use client";

import { LogOut, Route, Search, Settings } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Kbd } from "~/components/ui/badge";
import type { Appearance } from "~/lib/appearance";
import { clearOfflinePages } from "~/lib/pwa";
import { cn, titleCase } from "~/lib/utils";
import { AppearanceMenu } from "./appearance";
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
};

function sectionTitle(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return "Dashboard";
  return sectionTitles[first] ?? titleCase(first);
}

export function Topbar({
  name,
  email,
  appearance,
}: {
  name: string;
  email: string;
  appearance: Appearance;
}) {
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
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl supports-[backdrop-filter]:bg-canvas/65">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6 md:h-[76px] md:gap-4 md:px-7 lg:px-8 xl:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 md:hidden">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink shadow-card">
            <Route size={20} strokeWidth={1.9} />
          </span>
          <span className="sr-only">sazardev Roadmap home</span>
          <span className="hidden min-w-0 sm:block">
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              sazardev
            </span>
            <span className="block truncate text-sm font-semibold leading-tight">Roadmap</span>
          </span>
        </Link>

        <div className="hidden min-w-0 md:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Sazar workspace
          </p>
          <h2 className="truncate text-base font-semibold tracking-tight">{section}</h2>
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("sd:open-palette"))}
            className="group inline-flex h-11 w-11 items-center justify-center gap-2.5 rounded-full border border-line bg-raised px-0 text-sm text-muted shadow-sm transition-[border-color,background-color,color] duration-fast hover:border-line-strong hover:bg-hover hover:text-ink sm:w-auto sm:justify-start sm:px-3.5 md:min-w-56 lg:min-w-72"
          >
            <Search size={18} strokeWidth={1.9} className="shrink-0" />
            <span className="sr-only">Search anything</span>
            <span className="hidden sm:inline">Search anything</span>
            <span className="ml-auto hidden md:block">
              <Kbd>Ctrl K</Kbd>
            </span>
          </button>

          <div className="hidden sm:block">
            <ThemeToggle initial={appearance.theme} compact />
          </div>
          <AppearanceMenu appearance={appearance} />

          <details className="relative">
            <summary
              aria-label="Account menu"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-accent-soft text-sm font-semibold text-accent transition-[border-color,background-color] duration-fast hover:border-line-strong hover:bg-hover [&::-webkit-details-marker]:hidden"
            >
              {initials}
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 overflow-hidden rounded-lg border border-line bg-raised p-2 shadow-float">
              <div className="flex items-center gap-3 rounded-md bg-surface px-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{name}</p>
                  <p className="truncate text-xs text-muted">{email}</p>
                </div>
              </div>
              <hr className="my-2 border-line" />
              <Link
                to="/settings"
                className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm text-ink transition-colors duration-fast hover:bg-hover"
              >
                <Settings size={17} strokeWidth={1.8} className="text-muted" />
                Settings
              </Link>
              <Link
                to="/settings#appearance"
                className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm text-ink transition-colors duration-fast hover:bg-hover"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[17px] items-center justify-center rounded-full bg-accent"
                />
                Personalize
              </Link>
              <a
                href="/logout"
                onClick={(event) => {
                  event.preventDefault();
                  void clearOfflinePages().finally(() => {
                    window.location.href = "/logout";
                  });
                }}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm text-muted transition-colors duration-fast hover:bg-hover hover:text-ink",
                )}
              >
                <LogOut size={17} strokeWidth={1.8} />
                Sign out
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
