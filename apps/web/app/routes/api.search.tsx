import { searchForPalette } from "~/features/search/search.server";
import { requireApiUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/api.search";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireApiUser(context, request);
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 2) return Response.json({ results: [] });
  const results = await searchForPalette(getEnv(context), user.id, q);
  return Response.json({ results }, { headers: { "Cache-Control": "private, no-store" } });
}
