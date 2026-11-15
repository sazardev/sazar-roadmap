import { eq } from "drizzle-orm";
import { type AppLoadContext, redirect } from "react-router";
import { profiles, userSettings } from "~/db/schema";
import { getDb, getEnv } from "~/lib/db.server";
import { readCookie, verifySessionJwt } from "./session.server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  profile: typeof profiles.$inferSelect;
  settings: typeof userSettings.$inferSelect;
}

const isLoopback = (request: Request): boolean => {
  try {
    const host = new URL(request.url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
};

const displayNameFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? "Learner";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

interface SessionIdentity {
  sub: string;
  email: string;
}

async function resolveIdentity(
  context: AppLoadContext,
  request: Request,
): Promise<SessionIdentity | null> {
  const env = getEnv(context);
  if (env.DEV_NO_AUTH === "1" && isLoopback(request)) {
    return { sub: "dev-owner", email: "dev@sazardev.stream" };
  }
  if (!env.AUTH_URL) return null;
  const result = await verifySessionJwt(readCookie(request.headers.get("cookie"), "sd_session"), {
    authUrl: env.AUTH_URL,
    aud: env.AUTH_AUD ?? "sazardev-apps",
  });
  return result.ok ? { sub: result.sub, email: result.email } : null;
}

async function loadOrCreateProfile(
  context: AppLoadContext,
  identity: SessionIdentity,
): Promise<AuthenticatedUser | null> {
  const db = getDb(context);
  const email = identity.email || `${identity.sub}@sazardev.stream`;
  const name = displayNameFromEmail(email);

  await db
    .insert(profiles)
    .values({ id: identity.sub, email, displayName: name })
    .onConflictDoNothing();
  await db.insert(userSettings).values({ userId: identity.sub }).onConflictDoNothing();

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, identity.sub)).limit(1);
  if (!profile) return null;
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, identity.sub))
    .limit(1);
  if (!settings) return null;

  return {
    id: identity.sub,
    email: profile.email,
    name: profile.displayName ?? name,
    profile,
    settings,
  };
}

const requestCache = new WeakMap<Request, Promise<AuthenticatedUser | null>>();

export async function getUser(
  context: AppLoadContext,
  request: Request,
): Promise<AuthenticatedUser | null> {
  const cached = requestCache.get(request);
  if (cached) return cached;
  const pending = resolveIdentity(context, request).then((identity) =>
    identity ? loadOrCreateProfile(context, identity) : null,
  );
  requestCache.set(request, pending);
  return pending;
}

export function loginPath(request: Request): string {
  const url = new URL(request.url);
  const next = `${url.pathname}${url.search}`;
  return `/auth/login?next=${encodeURIComponent(next)}`;
}

export async function requireUser(
  context: AppLoadContext,
  request: Request,
): Promise<AuthenticatedUser> {
  const user = await getUser(context, request);
  if (!user) throw redirect(loginPath(request));
  return user;
}

export async function requireApiUser(
  context: AppLoadContext,
  request: Request,
): Promise<AuthenticatedUser | Response> {
  const user = await getUser(context, request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export function isAuthenticatedUser(
  value: AuthenticatedUser | Response,
): value is AuthenticatedUser {
  return !(value instanceof Response);
}

/** Same-origin check for cookie-authenticated mutations. */
export function assertSameOrigin(request: Request): void {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.get("origin");
  if (origin) {
    const expected = new URL(request.url).origin;
    if (new URL(origin).origin !== expected) throw new Response("Forbidden", { status: 403 });
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new Response("Forbidden", { status: 403 });
  }
}
