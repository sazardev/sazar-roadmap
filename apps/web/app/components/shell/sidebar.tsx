"use client";

import {
  Brain,
  FileText,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Library,
  type LucideIcon,
  Map as MapIcon,
  Menu,
  Route as RouteIcon,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { AppSwitcher } from "./app-switcher";

interface NavItem {
  to: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: "due";
}

const groups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Learn",
    items: [
      { to: "/", label: "Today", icon: LayoutDashboard, end: true },
      { to: "/roadmaps", label: "Roadmaps", short: "Paths", icon: MapIcon },
      { to: "/coach", label: "Coach", icon: Sparkles },
      { to: "/practice", label: "Practice", icon: Brain },
      {
        to: "/flashcards",
        label: "Flashcards",
        short: "Review",
        icon: GraduationCap,
        badge: "due",
      },
    ],
  },
  {
    label: "Grow",
    items: [
      { to: "/goals", label: "Goals", icon: Target },
      { to: "/resources", label: "Resources", short: "Library", icon: Library },
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
    <aside className="sticky top-0 hidden h-dvh min-w-0 flex-col border-r border-line/80 bg-surface/55 backdrop-blur-xl md:flex">
      <div className="flex h-[76px] shrink-0 items-center justify-center border-b border-line/70 px-3 lg:justify-start lg:px-5">
        <Link to="/" className="flex min-w-0 items-center gap-3 rounded-md">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink shadow-card">
            <RouteIcon size={22} strokeWidth={1.9} />
          </span>
          <span className="sr-only">sazardev Roadmap home</span>
          <span className="hidden min-w-0 lg:block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              sazardev
            </span>
            <span className="block text-lg font-semibold leading-tight tracking-tight">
              Roadmap
            </span>
          </span>
        </Link>
      </div>

      <nav
        aria-label="Primary"
        className="scrollbar-thin flex-1 overflow-y-auto px-2.5 py-4 lg:px-3 lg:py-6"
      >
        {groups.map((group, groupIndex) => (
          <div
            key={group.label}
            className={cn(groupIndex > 0 && "mt-3 border-t border-line/70 pt-3 lg:mt-6 lg:pt-5")}
          >
            <p className="mb-2 hidden px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted lg:block">
              {group.label}
            </p>
            <ul className="space-y-1.5 lg:space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end === true}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium leading-tight transition-[background-color,color] duration-fast lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm",
                          isActive
                            ? "bg-accent-soft text-accent"
                            : "text-muted hover:bg-hover hover:text-ink",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={21}
                            strokeWidth={isActive ? 2.1 : 1.8}
                            className="shrink-0 lg:h-[19px] lg:w-[19px]"
                          />
                          <span className="max-w-full truncate lg:flex-1">
                            <span className="lg:hidden">{item.short ?? item.label}</span>
                            <span className="hidden lg:inline">{item.label}</span>
                          </span>
                          {item.badge === "due" && dueReviews > 0 ? (
                            <span
                              className={cn(
                                "absolute right-1.5 top-1.5 flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[9px] leading-none lg:static lg:ml-auto lg:min-w-6 lg:text-[10px]",
                                isActive ? "bg-accent text-accent-ink" : "bg-ink text-canvas",
                              )}
                            >
                              {dueReviews > 99 ? "99+" : dueReviews}
                            </span>
                          ) : null}
                          {isActive ? (
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent lg:block"
                            />
                          ) : null}
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

      <div className="shrink-0 border-t border-line/80 p-2.5 lg:p-4">
        <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-between">
          <span
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-xs text-muted"
            title={streak > 0 ? `${streak}-day streak` : "Start a streak today"}
          >
            <Flame
              size={17}
              strokeWidth={1.9}
              className={streak > 0 ? "text-warning" : "text-muted"}
            />
            <span className="font-mono text-[11px] font-medium text-ink">{streak}d</span>
            {streak > 0 ? <span className="hidden lg:inline">streak</span> : null}
          </span>
          <AppSwitcher />
        </div>
        <p className="mt-1 hidden text-center font-mono text-[10px] text-muted lg:block">
          Private workspace · v0.5.3
        </p>
      </div>
    </aside>
  );
}

export function BottomNav({ dueReviews }: { dueReviews: number }) {
  const location = useLocation();
  const secondaryPaths = [
    "/more",
    "/account",
    "/practice",
    "/goals",
    "/resources",
    "/people",
    "/notes",
    "/settings",
    "/search",
  ];
  const moreActive = secondaryPaths.some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
  );
  const items = [
    { to: "/", label: "Today", icon: LayoutDashboard, end: true },
    { to: "/roadmaps", label: "Paths", icon: MapIcon },
    { to: "/coach", label: "Coach", icon: Sparkles },
    { to: "/flashcards", label: "Review", icon: GraduationCap, badge: dueReviews },
  ];
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-canvas pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5 px-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end === true}
                className={({ isActive }) =>
                  cn(
                    "relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-fast",
                    isActive ? "text-accent" : "text-muted hover:text-ink",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full transition-colors duration-fast",
                        isActive ? "bg-accent-soft" : "bg-transparent",
                      )}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.1 : 1.8} />
                    </span>
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute right-[calc(50%-1.2rem)] top-2 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] leading-4 text-accent-ink">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
        <li>
          <NavLink
            to="/more"
            className="group relative flex min-h-16 w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-fast"
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors duration-fast",
                moreActive ? "bg-accent-soft text-accent" : "text-muted group-hover:text-ink",
              )}
            >
              <Menu size={20} strokeWidth={moreActive ? 2.1 : 1.8} />
            </span>
            <span className={moreActive ? "text-accent" : "text-muted"}>More</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
