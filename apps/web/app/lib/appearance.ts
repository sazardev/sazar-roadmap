export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const ACCENTS = [
  { id: "iris", label: "Iris", description: "Calm violet", color: "#4f46c8" },
  { id: "ocean", label: "Ocean", description: "Deep teal", color: "#0d6a83" },
  { id: "moss", label: "Moss", description: "Quiet green", color: "#3c6b4b" },
  { id: "amber", label: "Amber", description: "Warm ochre", color: "#995a00" },
  { id: "rose", label: "Rose", description: "Soft berry", color: "#a83b5f" },
  { id: "mono", label: "Mono", description: "Pure ink", color: "#1a1916" },
] as const;
export type Accent = (typeof ACCENTS)[number]["id"];

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

export const CORNERS = ["soft", "sharp"] as const;
export type Corners = (typeof CORNERS)[number];

export const TEXT_SIZES = ["standard", "large"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export interface Appearance {
  theme: Theme;
  accent: Accent;
  density: Density;
  corners: Corners;
  textSize: TextSize;
}

export const DEFAULT_APPEARANCE: Appearance = {
  theme: "system",
  accent: "iris",
  density: "comfortable",
  corners: "soft",
  textSize: "standard",
};

export const APPEARANCE_COOKIES = {
  theme: "sd_theme",
  accent: "sd_accent",
  density: "sd_density",
  corners: "sd_corners",
  textSize: "sd_text",
} as const;

export function isTheme(value: string | undefined): value is Theme {
  return value !== undefined && (THEMES as readonly string[]).includes(value);
}

export function isAccent(value: string | undefined): value is Accent {
  return value !== undefined && ACCENTS.some((accent) => accent.id === value);
}

export function isDensity(value: string | undefined): value is Density {
  return value !== undefined && (DENSITIES as readonly string[]).includes(value);
}

export function isCorners(value: string | undefined): value is Corners {
  return value !== undefined && (CORNERS as readonly string[]).includes(value);
}

export function isTextSize(value: string | undefined): value is TextSize {
  return value !== undefined && (TEXT_SIZES as readonly string[]).includes(value);
}

/**
 * Turns untrusted cookie or database values into an appearance that the CSS
 * layer can apply without checking each attribute again.
 */
export function normalizeAppearance(
  input: Partial<Record<keyof Appearance, string | undefined>>,
  fallback: Partial<Record<keyof Appearance, string | undefined>> = {},
): Appearance {
  const fallbackTheme = isTheme(fallback.theme) ? fallback.theme : DEFAULT_APPEARANCE.theme;
  const fallbackAccent = isAccent(fallback.accent) ? fallback.accent : DEFAULT_APPEARANCE.accent;
  const fallbackDensity = isDensity(fallback.density)
    ? fallback.density
    : DEFAULT_APPEARANCE.density;
  const fallbackCorners = isCorners(fallback.corners)
    ? fallback.corners
    : DEFAULT_APPEARANCE.corners;
  const fallbackTextSize = isTextSize(fallback.textSize)
    ? fallback.textSize
    : DEFAULT_APPEARANCE.textSize;

  return {
    theme: isTheme(input.theme) ? input.theme : fallbackTheme,
    accent: isAccent(input.accent) ? input.accent : fallbackAccent,
    density: isDensity(input.density) ? input.density : fallbackDensity,
    corners: isCorners(input.corners) ? input.corners : fallbackCorners,
    textSize: isTextSize(input.textSize) ? input.textSize : fallbackTextSize,
  };
}
