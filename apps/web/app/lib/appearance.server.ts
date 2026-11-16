import { APPEARANCE_COOKIES, type Appearance, normalizeAppearance } from "~/lib/appearance";
import { readCookie } from "~/lib/auth/session.server";
/**
 * Reads device-level appearance preferences. Account settings are used only as
 * a fallback, so a quick change from the topbar survives without a round trip.
 */
export function readAppearance(
  request: Request,
  fallback: Partial<Record<keyof Appearance, string | undefined>> = {},
): Appearance {
  const cookie = request.headers.get("cookie");
  return normalizeAppearance(
    {
      theme: readCookie(cookie, APPEARANCE_COOKIES.theme),
      accent: readCookie(cookie, APPEARANCE_COOKIES.accent),
      density: readCookie(cookie, APPEARANCE_COOKIES.density),
      corners: readCookie(cookie, APPEARANCE_COOKIES.corners),
      textSize: readCookie(cookie, APPEARANCE_COOKIES.textSize),
    },
    fallback,
  );
}

export function appearanceCookies(
  appearance: Appearance,
  request: Request,
  reducedMotion = false,
): string[] {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const suffix = `; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  return [
    `${APPEARANCE_COOKIES.theme}=${appearance.theme}${suffix}`,
    `${APPEARANCE_COOKIES.accent}=${appearance.accent}${suffix}`,
    `${APPEARANCE_COOKIES.density}=${appearance.density}${suffix}`,
    `${APPEARANCE_COOKIES.corners}=${appearance.corners}${suffix}`,
    `${APPEARANCE_COOKIES.textSize}=${appearance.textSize}${suffix}`,
    `sd_motion=${reducedMotion ? "reduce" : "system"}${suffix}`,
  ];
}
