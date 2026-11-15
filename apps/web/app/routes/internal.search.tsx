import { searchAll } from "~/features/search/search.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/internal.search";

function authorized(request: Request, env: Env): boolean {
  const key = env.INTEGRATION_KEY;
  return Boolean(key) && request.headers.get("x-integration-key") === key;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = getEnv(context);
  if (!authorized(request, env)) return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return Response.json({ results: [] });

  const profile = await env.DB.prepare(
    "SELECT id FROM profiles ORDER BY created_at LIMIT 1",
  ).first<{ id: string }>();
  if (!profile) return Response.json({ results: [] });

  const results = await searchAll(env, profile.id, q, 10);
  return Response.json(
    {
      results: [...results.topics, ...results.resources].slice(0, 10).map((hit) => ({
        id: hit.id,
        title: hit.title,
        subtitle: hit.subtitle,
        url: hit.url.startsWith("http") ? hit.url : `${env.PUBLIC_URL}${hit.url}`,
        kind: hit.kind === "topic" ? "roadmap" : "resource",
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
