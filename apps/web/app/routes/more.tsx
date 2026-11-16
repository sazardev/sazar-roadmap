import {
  ArrowRight,
  Brain,
  FileText,
  GraduationCap,
  Library,
  Search,
  Settings,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { pageMeta } from "~/lib/meta";
import type { Route } from "./+types/more";

export const meta = () => pageMeta("More");

const groups = [
  {
    label: "Learn",
    items: [
      {
        to: "/practice",
        title: "Practice",
        description: "Queue, write and revise until the reviewer passes.",
        icon: Brain,
      },
      {
        to: "/goals",
        title: "Goals",
        description: "Weekly targets, milestones and progress.",
        icon: Target,
      },
      {
        to: "/flashcards",
        title: "Review",
        description: "Spaced repetition for the cards that are due.",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Library",
    items: [
      {
        to: "/resources",
        title: "Resources",
        description: "Saved links and bookmarkable sources.",
        icon: Library,
      },
      {
        to: "/people",
        title: "People",
        description: "Who to ask and the questions still open.",
        icon: Users,
      },
      {
        to: "/notes",
        title: "Notes",
        description: "Private notes attached to what you study.",
        icon: FileText,
      },
      {
        to: "/search",
        title: "Search",
        description: "Topics, resources and notes in one place.",
        icon: Search,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        to: "/account",
        title: "Account",
        description: "Profile, appearance, offline storage and sign out.",
        icon: UserRound,
      },
      {
        to: "/settings",
        title: "Settings",
        description: "Learning defaults, AI, integrations and content.",
        icon: Settings,
      },
    ],
  },
];

export default function MorePage(_props: Route.ComponentProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-1 pb-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Everything else
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">More</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Every section in one screen. No hidden menus, no modal detours.
        </p>
      </header>

      <div className="space-y-6">
        {groups.map((group) => (
          <section
            key={group.label}
            className="space-y-2.5"
            aria-labelledby={`more-${group.label}`}
          >
            <h2
              id={`more-${group.label}`}
              className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
            >
              {group.label}
            </h2>
            <ul className="overflow-hidden rounded-lg border border-line/90 bg-raised">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.to} className={index > 0 ? "border-t border-line/70" : undefined}>
                    <Link
                      to={item.to}
                      className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors duration-fast hover:bg-hover sm:px-5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <Icon size={17} strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{item.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {item.description}
                        </span>
                      </span>
                      <ArrowRight
                        size={15}
                        className="shrink-0 text-muted opacity-40 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
