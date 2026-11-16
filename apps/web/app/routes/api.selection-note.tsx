import { createNote as createExternalNote } from "~/features/integrations/integrations.server";
import { createNote as createRoadmapNote } from "~/features/notes/notes.server";
import { assertSameOrigin, requireApiUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/api.selection-note";

interface SelectionPayload {
  topicId?: unknown;
  text?: unknown;
}

export async function action({ request, context }: Route.ActionArgs) {
  assertSameOrigin(request);
  const user = await requireApiUser(context, request);
  if (user instanceof Response) return user;

  const payload = (await request.json().catch(() => null)) as SelectionPayload | null;
  const topicId = typeof payload?.topicId === "string" ? payload.topicId : "";
  const text = typeof payload?.text === "string" ? payload.text.trim() : "";
  if (!topicId || text.length < 20 || text.length > 4000) {
    return Response.json({ error: "Select between 20 and 4,000 characters." }, { status: 400 });
  }

  const env = getEnv(context);
  const topic = await env.DB.prepare(
    `SELECT t.id, t.title, t.slug, r.slug AS roadmap_slug
     FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id WHERE t.id = ?`,
  )
    .bind(topicId)
    .first<{ id: string; title: string; slug: string; roadmap_slug: string }>();
  if (!topic) return Response.json({ error: "Topic not found." }, { status: 404 });

  const sourceUrl = `https://roadmap.sazardev.stream/roadmaps/${topic.roadmap_slug}/${topic.slug}`;
  const title = `Selection from ${topic.title}`;
  const bodyMd = [
    `> ${text.split("\n").join("\n> ")}`,
    "",
    `From [${topic.title}](${sourceUrl}).`,
  ].join("\n");

  const external = await createExternalNote(env, {
    title,
    body_md: bodyMd,
    tags: ["roadmap", "selection", topic.roadmap_slug],
    source_url: sourceUrl,
  });
  if (external.ok) {
    return Response.json({ ok: true, target: "notes", url: external.note.url });
  }

  const noteId = await createRoadmapNote(env, user.id, {
    title,
    bodyMd,
    topicId: topic.id,
  });
  return Response.json({ ok: true, target: "roadmap", url: `/notes#note-${noteId}` });
}
