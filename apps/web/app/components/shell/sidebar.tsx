"use client";

import {
  Brain,
  ChevronRight,
  FileText,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Library,
  Map as MapIcon,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Link, NavLink } from "react-router";
import { cn } from "~/lib/utils";
import { AppSwitcher } from "./app-switcher";

const groups = [
  {
    label: "Learn",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/roadmaps", label: "Roadmaps", icon: MapIcon },
      { to: "/coach", label: "Coach", icon: Sparkles },
      { to: "/practice", label: "Practice", icon: Brain },
      { to: "/flashcards", label: "Flashcards", icon: GraduationCap, badge: "due" },
    ],
  },
  {
    label: "Grow",
    items: [
      { to: "/goals", label: "Goals", icon: Target },
      { to: "/resources", label: "Resources", icon: Library },
      { to: "/people", label: "People", icon: Users },
      { to: "/notes", label: "Notes", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

export function Sidebar({ dueReviews, streak }: { dueReviews: number; streak: number }) {
  return (
    <aside className="hidden border-r border-line bg-surface lg:flex lg:h-dvh lg:flex-col lg:sticky lg:top-0">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-5">
        <Link to="/" className="group min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            sazardev
          </span>
          <span className="mt-0.5 block text-lg font-semibold leading-none tracking-tight">
            Roadmap
          </span>
        </Link>
        <AppSwitcher />
      </div>

      <nav aria-label="Primary" className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end === true}
                      className={({ isActive }) =>
                        cn(
                          "group flex h-9 items-center gap-2.5 rounded-sm px-2 text-[13px] transition-colors duration-fast",
                          isActive
                            ? "bg-canvas font-medium text-ink shadow-[inset_0_0_0_1px_var(--line)]"
                            : "text-muted hover:bg-hover hover:text-ink",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={15}
                            strokeWidth={1.8}
                            className={isActive ? "text-ink" : "text-muted group-hover:text-ink"}
                          />
                          <span className="flex-1">{item.label}</span>
                          {item.badge === "due" && dueReviews > 0 ? (
                            <span className="rounded-full bg-ink px-1.5 py-0.5 font-mono text-[9px] leading-none text-canvas">
                              {dueReviews > 99 ? "99+" : dueReviews}
                            </span>
                          ) : null}
                          {isActive ? <ChevronRight size={12} className="text-muted" /> : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <Flame size={13} strokeWidth={1.8} />
            {streak > 0 ? `${streak}-day streak` : "Start a streak"}
          </span>
          <span className="font-mono text-[10px] text-muted">v0.1</span>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav({ dueReviews }: { dueReviews: number }) {
  const items = [
    { to: "/", label: "Today", icon: LayoutDashboard, end: true },
    { to: "/roadmaps", label: "Paths", icon: MapIcon },
    { to: "/coach", label: "Coach", icon: Sparkles },
    { to: "/flashcards", label: "Review", icon: GraduationCap, badge: dueReviews },
  ];
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end === true}
                className={({ isActive }) =>
                  cn(
                    "relative flex h-14 flex-col items-center justify-center gap-1 text-[10px]",
                    isActive ? "font-medium text-ink" : "text-muted",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} strokeWidth={isActive ? 2.1 : 1.7} />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute right-[calc(50%-18px)] top-2 size-1.5 rounded-full bg-ink" />
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("sd:open-palette"))}
            className="flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px] text-muted"
          >
            <Library size={18} strokeWidth={1.7} />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
