"use client";

import {
  ArrowRight,
  BookOpen,
  Brain,
  CornerDownLeft,
  FileText,
  GraduationCap,
  Loader2,
  Map as MapIcon,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Kbd } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { applyTheme } from "./theme-toggle";

interface SearchHit {
  id: string;
  kind: "topic" | "resource" | "note";
  title: string;
  subtitle: string;
  url: string;
  snippet?: string;
}

interface Command {
  id: string;
  label: string;
  description: string;
  url?: string;
  external?: boolean;
  group: "Go to" | "Actions" | "Open";
  icon: typeof MapIcon;
  action?: "theme";
  keywords?: string;
}

const commands: Command[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Today, progress and reviews",
    url: "/",
    group: "Go to",
    icon: Sparkles,
  },
  {
    id: "roadmaps",
    label: "Roadmaps",
    description: "Guided paths and the content library",
    url: "/roadmaps",
    group: "Go to",
    icon: MapIcon,
  },
  {
    id: "coach",
    label: "Coach",
    description: "Ask, plan and be quizzed",
    url: "/coach",
    group: "Go to",
    icon: Sparkles,
  },
  {
    id: "practice",
    label: "Practice",
    description: "Deliberate practice queue",
    url: "/practice",
    group: "Go to",
    icon: Brain,
  },
  {
    id: "flashcards",
    label: "Flashcards",
    description: "Spaced review deck",
    url: "/flashcards",
    group: "Go to",
    icon: GraduationCap,
  },
  {
    id: "goals",
    label: "Goals",
    description: "Weekly targets and milestones",
    url: "/goals",
    group: "Go to",
    icon: Target,
  },
  {
    id: "resources",
    label: "Resources",
    description: "Saved and curated links",
    url: "/resources",
    group: "Go to",
    icon: BookOpen,
  },
  {
    id: "people",
    label: "People",
    description: "Who to ask and open questions",
    url: "/people",
    group: "Go to",
    icon: Users,
  },
  {
    id: "notes",
    label: "Notes",
    description: "Your learning notes",
    url: "/notes",
    group: "Go to",
    icon: FileText,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Profile, learning and integrations",
    url: "/settings",
    group: "Go to",
    icon: Settings,
  },
  {
    id: "new-coach",
    label: "New coach session",
    description: "Start with a blank thread",
    url: "/coach?new=1",
    group: "Actions",
    icon: Sparkles,
  },
  {
    id: "review",
    label: "Review due cards",
    description: "Open the spaced review queue",
    url: "/flashcards",
    group: "Actions",
    icon: GraduationCap,
  },
  {
    id: "new-goal",
    label: "Create a goal",
    description: "Set a measurable target",
    url: "/goals?new=1",
    group: "Actions",
    icon: Target,
  },
  {
    id: "search",
    label: "Search everything",
    description: "Topics, resources and notes",
    url: "/search",
    group: "Actions",
    icon: Search,
  },
  {
    id: "theme",
    label: "Toggle theme",
    description: "Light, dark or system",
    group: "Actions",
    icon: Sparkles,
    action: "theme",
  },
  {
    id: "notes-app",
    label: "Notes app",
    description: "notes.sazardev.stream",
    url: "https://notes.sazardev.stream",
    external: true,
    group: "Open",
    icon: FileText,
  },
  {
    id: "learn-app",
    label: "Learn app",
    description: "learn.sazardev.stream",
    url: "https://learn.sazardev.stream",
    external: true,
    group: "Open",
    icon: BookOpen,
  },
];

const kindIcons = {
  topic: MapIcon,
  resource: BookOpen,
  note: FileText,
} as const;

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scoped = q.startsWith(">");
    const term = scoped ? q.slice(1).trim() : q;
    return commands.filter((command) => {
      if (scoped && command.group !== "Actions") return false;
      if (!term) return true;
      return `${command.label} ${command.description} ${command.keywords ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [query]);

  const _results = useMemo(() => {
    const q = query.trim();
    if (q.startsWith(">") || q.length < 2) return commandResults;
    return remote;
  }, [commandResults, query, remote]);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    }
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("sd:open-palette", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("sd:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setRemote([]);
    setActive(0);
    const timer = setTimeout(() => inputRef.current?.focus(), 20);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2 || q.startsWith(">")) {
      setRemote([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error("search failed");
        const data = (await response.json()) as { results?: SearchHit[] };
        setRemote(Array.isArray(data.results) ? data.results.slice(0, 8) : []);
        setActive(0);
      } catch {
        if (!controller.signal.aborted) setRemote([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, query]);

  const isSearchMode = query.trim().length >= 2 && !query.startsWith(">");
  const grouped = useMemo(() => {
    const map = new Map<string, Array<SearchHit | Command>>();
    if (isSearchMode) {
      for (const hit of remote) {
        const label =
          hit.kind === "topic" ? "Topics" : hit.kind === "resource" ? "Resources" : "Your notes";
        const list = map.get(label) ?? [];
        list.push(hit);
        map.set(label, list);
      }
      return map;
    }
    for (const command of commandResults) {
      const list = map.get(command.group) ?? [];
      list.push(command);
      map.set(command.group, list);
    }
    return map;
  }, [commandResults, isSearchMode, remote]);

  const visibleItems = useMemo(() => [...grouped.values()].flat(), [grouped]);

  useEffect(() => {
    if (active >= visibleItems.length) setActive(Math.max(0, visibleItems.length - 1));
  }, [active, visibleItems.length]);

  const close = () => setOpen(false);

  const runCommand = (command: Command) => {
    close();
    if (command.action === "theme") {
      const current = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(current);
      return;
    }
    if (!command.url) return;
    if (command.external || command.url.startsWith("http")) {
      window.open(command.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(command.url);
    }
  };

  const openHit = (hit: SearchHit) => {
    close();
    if (hit.url.startsWith("http")) window.open(hit.url, "_blank", "noopener,noreferrer");
    else navigate(hit.url);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(visibleItems.length - 1, value + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = visibleItems[active];
      if (!item) return;
      if ("kind" in item) openHit(item);
      else runCommand(item);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-[620px] overflow-hidden rounded-md border border-line bg-raised shadow-float"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={visibleItems.length > 0 ? `command-option-${active}` : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search topics, resources, notes or run a command..."
            className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            autoComplete="off"
            spellCheck={false}
          />
          {loading ? <Loader2 size={15} className="animate-spin text-muted" /> : null}
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-sm px-1.5 py-1 text-[10px] text-muted hover:bg-hover"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div id="command-results" role="listbox" className="max-h-[52vh] overflow-y-auto p-1.5">
          {visibleItems.length === 0 && !loading ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">No matches for “{query}”</p>
              <p className="mt-1 text-xs text-muted">
                Try a topic name, a roadmap, or type {">"} for actions.
              </p>
            </div>
          ) : null}

          {[...grouped.entries()].map(([group, items]) => (
            <div key={group} className="py-1">
              <p className="px-2.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {group}
              </p>
              {items.map((item) => {
                const index = visibleItems.indexOf(item as SearchHit & Command);
                const isHit = "kind" in item;
                const Icon = isHit ? kindIcons[item.kind] : item.icon;
                const label = isHit ? item.title : item.label;
                const subtitle = isHit ? item.subtitle : item.description;
                return (
                  <button
                    key={isHit ? `${item.kind}-${item.id}` : item.id}
                    id={`command-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => (isHit ? openHit(item) : runCommand(item))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-sm px-2.5 py-2 text-left transition-colors duration-fast",
                      index === active ? "bg-hover" : "hover:bg-hover",
                    )}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-line bg-canvas text-muted">
                      <Icon size={14} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{label}</span>
                      <span className="block truncate text-[11px] text-muted">{subtitle}</span>
                    </span>
                    {isHit ? (
                      <span className="shrink-0 rounded-full bg-hover px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted">
                        {item.kind}
                      </span>
                    ) : item.group === "Open" ? (
                      <ArrowRight size={13} className="shrink-0 text-muted" />
                    ) : index === active ? (
                      <CornerDownLeft size={13} className="shrink-0 text-muted" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2 text-[10px] text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> open
            </span>
            <span className="flex items-center gap-1">
              <Kbd>esc</Kbd> close
            </span>
          </div>
          <span className="hidden sm:inline">{isMac ? "⌘K" : "Ctrl K"} anywhere</span>
        </div>
      </div>
    </div>
  );
}
