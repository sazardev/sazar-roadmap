"use client";

import { LogOut, Search, Settings } from "lucide-react";
import { Link, useLocation } from "react-router";
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
};

function sectionTitle(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return "Dashboard";
  return sectionTitles[first] ?? titleCase(first);
}

export function Topbar({ name, email, theme }: { name: string; email: string; theme: string }) {
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
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/88 backdrop-blur supports-[backdrop-filter]:bg-canvas/75">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <nav aria-label="Current section" className="flex min-w-0 items-center lg:hidden">
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {section}
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("sd:open-palette"))}
            className="hidden h-8 items-center gap-2 rounded-full border border-line px-3 text-[11px] text-muted transition-colors duration-fast hover:bg-hover hover:text-ink sm:flex"
          >
            <Search size={13} strokeWidth={1.8} />
            <span>Search</span>
            <span className="ml-2 rounded border border-line bg-surface px-1 font-mono text-[9px]">
              Ctrl K
            </span>
          </button>
          <ThemeToggle initial={theme as "system" | "light" | "dark"} compact />
          <details className="relative">
            <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface text-[11px] font-medium transition-colors duration-fast hover:bg-hover [&::-webkit-details-marker]:hidden">
              {initials}
            </summary>
            <div className="absolute right-0 top-11 z-50 w-64 rounded-md border border-line bg-raised p-1.5 shadow-float">
              <div className="px-2.5 py-2">
                <p className="truncate text-[13px] font-medium">{name}</p>
                <p className="truncate text-[11px] text-muted">{email}</p>
              </div>
              <hr className="my-1 border-line" />
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-[13px] hover:bg-hover"
              >
                <Settings size={14} strokeWidth={1.8} className="text-muted" />
                Settings
              </Link>
              <a
                href="/logout"
                className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-[13px] hover:bg-hover"
              >
                <LogOut size={14} strokeWidth={1.8} className="text-muted" />
                Sign out
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
