import { assertSameOrigin, requireApiUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/api.reindex";

export async function action({ request, context }: Route.ActionArgs) {
  assertSameOrigin(request);
  const user = await requireApiUser(context, request);
  if (user instanceof Response) return user;
  const env = getEnv(context);
  const body = (await request.json().catch(() => null)) as { mode?: string } | null;
  const mode = body?.mode === "resources" ? "resources" : "topics";

  if (mode === "resources") {
    await env.DB.prepare("INSERT INTO resources_fts(resources_fts) VALUES('rebuild')").run();
  } else {
    await env.DB.prepare("INSERT INTO topics_fts(topics_fts) VALUES('rebuild')").run();
  }

  return Response.json({ ok: true, mode });
}

export async function loader() {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
