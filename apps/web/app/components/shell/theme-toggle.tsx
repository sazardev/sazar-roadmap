"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

type Theme = "system" | "light" | "dark";

function resolve(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const resolved = resolve(theme);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: the cookie is the SSR-readable theme preference; no personal data
  document.cookie = `sd_theme=${theme}; path=/; max-age=31536000; samesite=lax${secure}`;
  try {
    localStorage.setItem("sd_theme", theme);
  } catch {
    // localStorage can be disabled; the cookie still applies.
  }
  window.dispatchEvent(new CustomEvent("sd:theme", { detail: theme }));
}

export function ThemeToggle({
  initial = "system",
  compact = false,
}: {
  initial?: Theme;
  compact?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem("sd_theme");
      } catch {
        return null;
      }
    })();
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
      applyTheme(stored);
    }
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark" || detail === "system") setTheme(detail);
    };
    window.addEventListener("sd:theme", onChange);
    return () => window.removeEventListener("sd:theme", onChange);
  }, []);

  useEffect(() => {
    setTheme(initial);
  }, [initial]);

  const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  const label = `Theme: ${theme}. Switch to ${next}.`;

  if (compact) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => {
          setTheme(next);
          applyTheme(next);
        }}
        className="inline-flex size-10 items-center justify-center rounded-sm text-muted transition-colors duration-fast hover:bg-hover hover:text-ink"
      >
        <Icon size={16} strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        setTheme(next);
        applyTheme(next);
      }}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-line px-3 text-[11px] text-muted transition-colors duration-fast hover:bg-hover hover:text-ink",
      )}
    >
      <Icon size={13} strokeWidth={1.8} />
      <span className="capitalize">{theme}</span>
    </button>
  );
}
