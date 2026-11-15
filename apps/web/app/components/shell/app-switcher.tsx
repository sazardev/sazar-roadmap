"use client";

import {
  ArrowUpRight,
  BookOpen,
  FileText,
  LayoutGrid,
  Library,
  Map as MapIcon,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const apps = [
  {
    name: "Notes",
    description: "Pages, databases and GitHub",
    href: "https://notes.sazardev.stream",
    icon: FileText,
  },
  {
    name: "Tasks",
    description: "To-dos, board and reminders",
    href: "https://tasks.sazardev.stream",
    icon: Target,
  },
  {
    name: "Learn",
    description: "Reading room and highlights",
    href: "https://learn.sazardev.stream",
    icon: BookOpen,
  },
  {
    name: "News",
    description: "Feeds, digests and saved stories",
    href: "https://news.sazardev.stream",
    icon: Library,
  },
  {
    name: "English",
    description: "Course, verbs and practice",
    href: "https://english.sazardev.stream",
    icon: Users,
  },
  {
    name: "Roadmap",
    description: "Paths, practice and coaching",
    href: "https://roadmap.sazardev.stream",
    icon: MapIcon,
    current: true,
  },
];

export function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Switch app"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-8 items-center justify-center rounded-sm border border-transparent text-muted transition-colors duration-fast hover:border-line hover:bg-hover hover:text-ink"
      >
        <LayoutGrid size={15} strokeWidth={1.8} />
      </button>
      {open ? (
        <div className="absolute left-0 top-10 z-50 w-[280px] rounded-md border border-line bg-raised p-1.5 shadow-float">
          <p className="px-2.5 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            sazardev apps
          </p>
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <a
                key={app.name}
                href={app.href}
                className="flex items-start gap-3 rounded-sm px-2.5 py-2 transition-colors duration-fast hover:bg-hover"
                aria-current={app.current ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={1.7} className="mt-0.5 shrink-0 text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    {app.name}
                    {app.current ? (
                      <span className="rounded-full bg-hover px-1.5 text-[9px] uppercase tracking-wide text-muted">
                        here
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[11px] text-muted">{app.description}</span>
                </span>
                {app.current ? null : (
                  <ArrowUpRight size={13} className="mt-1 shrink-0 text-muted" />
                )}
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
