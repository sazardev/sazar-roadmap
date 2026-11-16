"use client";

import {
  AlignJustify,
  Check,
  Circle,
  Monitor,
  Moon,
  RotateCcw,
  Rows3,
  Square,
  Sun,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  ACCENTS,
  type Accent,
  type Appearance,
  CORNERS,
  DEFAULT_APPEARANCE,
  DENSITIES,
  TEXT_SIZES,
  THEMES,
  type Theme,
} from "~/lib/appearance";
import { cn } from "~/lib/utils";
import { applyTheme } from "./theme-toggle";

export function applyAppearance(next: Appearance): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.accent = next.accent;
  root.dataset.density = next.density;
  root.dataset.corners = next.corners;
  root.dataset.text = next.textSize;
  applyTheme(next.theme);
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  const suffix = `; path=/; max-age=31536000; samesite=lax${secure}`;
  // biome-ignore lint/suspicious/noDocumentCookie: device-level UI preferences; no personal data
  document.cookie = `sd_accent=${next.accent}${suffix}`;
  // biome-ignore lint/suspicious/noDocumentCookie: device-level UI preferences; no personal data
  document.cookie = `sd_density=${next.density}${suffix}`;
  // biome-ignore lint/suspicious/noDocumentCookie: device-level UI preferences; no personal data
  document.cookie = `sd_corners=${next.corners}${suffix}`;
  // biome-ignore lint/suspicious/noDocumentCookie: device-level UI preferences; no personal data
  document.cookie = `sd_text=${next.textSize}${suffix}`;
  window.dispatchEvent(new CustomEvent("sd:appearance", { detail: next }));
}

const themeIcons: Record<Theme, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const densityIcons = {
  comfortable: Rows3,
  compact: AlignJustify,
} as const;

const cornerIcons = {
  soft: Circle,
  sharp: Square,
} as const;

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string; icon: typeof Sun }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0 space-y-2 border-0 p-0">
      <legend className="text-sm font-medium">{label}</legend>
      <div
        className="grid gap-1.5 rounded-md border border-line bg-surface p-1.5"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-medium transition-colors duration-fast",
                selected
                  ? "bg-raised text-ink shadow-sm ring-1 ring-line-strong"
                  : "text-muted hover:bg-hover hover:text-ink",
              )}
            >
              <Icon size={14} strokeWidth={1.9} />
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function applyMotion(reduced: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.motion = reduced ? "reduce" : "system";
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: device-level accessibility preference; no personal data
  document.cookie = `sd_motion=${reduced ? "reduce" : "system"}; path=/; max-age=31536000; samesite=lax${secure}`;
}

export function AppearanceFields({
  value,
  onChange,
}: {
  value: Appearance;
  onChange: (next: Appearance) => void;
}) {
  return (
    <div className="space-y-5">
      <Segmented
        label="Theme"
        value={value.theme}
        onChange={(theme) => onChange({ ...value, theme: theme as Theme })}
        options={THEMES.map((theme) => ({
          value: theme,
          label: theme === "system" ? "Auto" : theme === "light" ? "Light" : "Dark",
          icon: themeIcons[theme],
        }))}
      />

      <fieldset className="min-w-0 space-y-2 border-0 p-0">
        <legend className="flex w-full items-baseline justify-between gap-3 text-sm font-medium">
          <span>Accent</span>
          <span className="text-xs font-normal text-muted">
            {ACCENTS.find((accent) => accent.id === value.accent)?.description}
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-1.5">
          {ACCENTS.map((accent) => {
            const selected = accent.id === value.accent;
            return (
              <button
                key={accent.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ ...value, accent: accent.id as Accent })}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-md border px-3 text-left text-sm transition-[border-color,background-color,transform] duration-fast active:scale-[0.98]",
                  selected
                    ? "border-line-strong bg-raised font-medium shadow-sm"
                    : "border-transparent text-muted hover:bg-hover hover:text-ink",
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-5 shrink-0 rounded-full border border-black/10 shadow-inner"
                  style={{ background: accent.color }}
                />
                <span className="min-w-0 flex-1 truncate">{accent.label}</span>
                {selected ? <Check size={15} className="shrink-0 text-accent" /> : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Segmented
        label="Density"
        value={value.density}
        onChange={(density) => onChange({ ...value, density: density as Appearance["density"] })}
        options={DENSITIES.map((density) => ({
          value: density,
          label: density === "compact" ? "Compact" : "Comfortable",
          icon: densityIcons[density],
        }))}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Segmented
          label="Corners"
          value={value.corners}
          onChange={(corners) => onChange({ ...value, corners: corners as Appearance["corners"] })}
          options={CORNERS.map((corner) => ({
            value: corner,
            label: corner === "soft" ? "Soft" : "Sharp",
            icon: cornerIcons[corner],
          }))}
        />
        <Segmented
          label="Text size"
          value={value.textSize}
          onChange={(size) => onChange({ ...value, textSize: size as Appearance["textSize"] })}
          options={TEXT_SIZES.map((size) => ({
            value: size,
            label: size === "large" ? "Large" : "Standard",
            icon: Type,
          }))}
        />
      </div>

      <div className="accent-band rounded-md border border-line p-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink">
            Aa
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">This is your workspace</p>
            <p className="truncate text-xs text-muted">A calm place to make progress.</p>
          </div>
          <span className="rounded-full bg-accent-soft px-2 py-1 text-[10px] font-medium text-accent">
            Preview
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-hover">
          <div className="h-full w-2/3 rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}

export function AppearanceForm({
  initial,
  reducedMotion = false,
  busy = false,
}: {
  initial: Appearance;
  reducedMotion?: boolean;
  busy?: boolean;
}) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const onTheme = (event: Event) => {
      const theme = (event as CustomEvent<Theme>).detail;
      if (theme === "light" || theme === "dark" || theme === "system") {
        setValue((current) => ({ ...current, theme }));
      }
    };
    const onAppearance = (event: Event) => {
      setValue((event as CustomEvent<Appearance>).detail);
    };
    window.addEventListener("sd:theme", onTheme);
    window.addEventListener("sd:appearance", onAppearance);
    return () => {
      window.removeEventListener("sd:theme", onTheme);
      window.removeEventListener("sd:appearance", onAppearance);
    };
  }, []);

  const update = (next: Appearance) => {
    setValue(next);
    applyAppearance(next);
  };

  return (
    <form method="post" className="space-y-6 p-5 sm:p-6">
      <input type="hidden" name="intent" value="appearance" />
      <input type="hidden" name="theme" value={value.theme} />
      <input type="hidden" name="accent" value={value.accent} />
      <input type="hidden" name="density" value={value.density} />
      <input type="hidden" name="corners" value={value.corners} />
      <input type="hidden" name="textSize" value={value.textSize} />

      <AppearanceFields value={value} onChange={update} />

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-line bg-surface/50 px-4 text-sm">
        <input
          type="checkbox"
          name="reducedMotion"
          defaultChecked={reducedMotion}
          onChange={(event) => applyMotion(event.target.checked)}
          className="size-5 rounded-sm border-line accent-[var(--accent)]"
        />
        <span>
          <span className="block font-medium">Reduce motion</span>
          <span className="block text-xs text-muted">
            Use minimal transitions and no animated progress.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={busy}>
          Save appearance
        </Button>
        <button
          type="button"
          onClick={() => update(DEFAULT_APPEARANCE)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-sm px-2 text-sm text-muted hover:bg-hover hover:text-ink"
        >
          <RotateCcw size={14} /> Reset to default
        </button>
        <span className="text-xs text-muted">Saved to this device and your account.</span>
      </div>
    </form>
  );
}
