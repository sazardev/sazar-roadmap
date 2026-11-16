import { ArrowUpRight, ExternalLink, FileText, Plus, Search, Trash2 } from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Input, Select, Textarea } from "~/components/ui/field";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import { getReading, integrationStatus } from "~/features/integrations/integrations.server";
import {
  createNote,
  deleteNote,
  listNotes,
  type NoteItem,
  updateNote,
} from "~/features/notes/notes.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/notes";

export const meta = () => pageMeta("Notes");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const topicId = url.searchParams.get("topic");
  const edit = url.searchParams.get("edit");
  const [notes, topic, topics, status, reading] = await Promise.all([
    listNotes(env, user.id, { q, topicId }),
    topicId
      ? env.DB.prepare(
          `SELECT t.id, t.title, t.slug, r.slug AS roadmapSlug FROM topics t
           JOIN roadmaps r ON r.id = t.roadmap_id WHERE t.id = ?`,
        )
          .bind(topicId)
          .first<{ id: string; title: string; slug: string; roadmapSlug: string }>()
      : Promise.resolve(null),
    env.DB.prepare(
      `SELECT t.id, t.title, r.title AS roadmapTitle, r.slug AS roadmapSlug
       FROM topics t JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE r.status IN ('guided', 'reference')
       ORDER BY r.sort_order, t.sort_order LIMIT 400`,
    ).all<{ id: string; title: string; roadmapTitle: string; roadmapSlug: string }>(),
    Promise.resolve(integrationStatus(env)),
    integrationStatus(env).learn ? getReading(env) : Promise.resolve([]),
  ]);

  return {
    notes,
    topic,
    topics: topics.results ?? [],
    reading,
    learning: status.learn,
    q,
    edit,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const title = String(form.get("title") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    const topicId = String(form.get("topicId") ?? "") || null;
    if (title.length < 2 || body.length < 2) {
      return Response.json({ error: "A note needs a title and a body." }, { status: 400 });
    }
    await createNote(env, user.id, { title, bodyMd: body, topicId });
    return redirect("/notes");
  }

  if (intent === "update") {
    const noteId = String(form.get("noteId") ?? "");
    const title = String(form.get("title") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    if (noteId && title.length > 1 && body.length > 1) {
      await updateNote(env, user.id, noteId, { title, bodyMd: body });
    }
    return redirect("/notes");
  }

  if (intent === "delete") {
    const noteId = String(form.get("noteId") ?? "");
    if (noteId) await deleteNote(env, user.id, noteId);
    return redirect("/notes");
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export default function NotesPage({ loaderData }: Route.ComponentProps) {
  const { notes, topic, topics, reading, learning, q, edit } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const editing = notes.find((note) => note.id === edit) ?? null;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your thinking"
        title="Notes"
        description="Short, private notes attached to topics. They stay here, or go to the Notes app when you want the full workspace."
        actions={
          <>
            <LinkButton
              to="https://notes.sazardev.stream"
              variant="secondary"
              icon={<ArrowUpRight size={15} />}
            >
              Open Notes
            </LinkButton>
            <a
              href="#new-note"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
            >
              <Plus size={16} /> New note
            </a>
          </>
        }
      />

      {topic ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-raised px-5 py-4 text-sm shadow-card">
          <span>
            <span className="text-muted">Filtered to </span>
            <Link
              to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4"
            >
              {topic.title}
            </Link>
          </span>
          <LinkButton to="/notes" variant="ghost" size="sm">
            All notes
          </LinkButton>
        </div>
      ) : null}

      <form method="get" className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search your notes..."
            className="h-12 w-full rounded-md border border-line bg-raised pl-11 pr-4 text-base shadow-sm outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
          />
        </div>
        {topic ? <input type="hidden" name="topic" value={topic.id} /> : null}
        <Button type="submit" variant="secondary" className="h-12">
          Search
        </Button>
      </form>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <details
            id="new-note"
            className="rounded-lg border border-line bg-raised shadow-card"
            open={notes.length === 0}
          >
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-2 px-5 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
              <Plus size={17} /> New note
            </summary>
            <Form method="post" className="space-y-3 border-t border-line/80 p-5 md:p-6">
              <input type="hidden" name="intent" value="create" />
              {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}
              <Input
                name="title"
                required
                placeholder="A title you will recognize later"
                aria-label="Note title"
              />
              <Textarea
                name="body"
                required
                className="min-h-28"
                placeholder="What did you learn? What is still unclear?"
                aria-label="Note body"
              />
              {!topic ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Attach to a topic (optional)</span>
                  <Select name="topicId" defaultValue="">
                    <option value="">No topic</option>
                    {topics.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.roadmapTitle} / {item.title}
                      </option>
                    ))}
                  </Select>
                </label>
              ) : null}
              <Button type="submit" disabled={busy}>
                Save note
              </Button>
            </Form>
          </details>

          {editing ? (
            <Card>
              <CardHeader title="Edit note" description="Changes re-index the note for search." />
              <Form method="post" className="space-y-3 p-5 md:p-6">
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="noteId" value={editing.id} />
                <Input name="title" defaultValue={editing.title} required aria-label="Note title" />
                <Textarea
                  name="body"
                  defaultValue={editing.bodyMd}
                  required
                  className="min-h-40"
                  aria-label="Note body"
                />
                <div className="flex items-center gap-3">
                  <Button type="submit" size="sm" disabled={busy}>
                    Save changes
                  </Button>
                  <Link to="/notes" className="text-sm text-muted underline">
                    Cancel
                  </Link>
                </div>
              </Form>
            </Card>
          ) : null}

          {notes.length === 0 ? (
            <EmptyState
              title="No notes yet"
              description="Write one sentence after each study session. The note is not the artifact; the recall is."
              icon={<FileText size={22} />}
            />
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} busy={busy} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Reading in Learn" description="Imported articles and progress." />
            <CardBody className="space-y-1.5">
              {!learning ? (
                <p className="text-sm leading-relaxed text-muted">Learn is not connected yet.</p>
              ) : reading.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted">Nothing in progress.</p>
              ) : (
                reading.slice(0, 4).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    className="block min-h-14 space-y-1 rounded-md px-2.5 py-2 transition-colors hover:bg-hover"
                  >
                    <span className="line-clamp-2 text-sm font-medium">{item.title}</span>
                    <span className="block text-xs text-muted">
                      {Math.round(item.progress * 100)}% · {item.source}
                    </span>
                  </a>
                ))
              )}
              <a
                href="https://learn.sazardev.stream"
                className="inline-flex min-h-10 items-center gap-1 text-sm text-muted underline"
              >
                Open Learn <ExternalLink size={12} />
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notes app" />
            <CardBody className="space-y-2 text-sm leading-relaxed text-muted">
              <p>Use the Notes app for pages, databases, GitHub cards and imported documents.</p>
              <p>
                “Save to Notes” from a topic creates a page with the summary, concepts, practice
                prompt and a source link.
              </p>
              <a
                href="https://notes.sazardev.stream"
                className="inline-flex min-h-10 items-center gap-1 underline"
              >
                notes.sazardev.stream <ExternalLink size={12} />
              </a>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function NoteCard({ note, busy }: { note: NoteItem; busy: boolean }) {
  return (
    <Card>
      <CardBody className="space-y-3 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <FileText size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{note.title}</h3>
              {note.source !== "internal" ? <Badge tone="outline">{note.source}</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-muted">
              {relativeDay(note.updatedAt)}
              {note.topicTitle ? " · " : ""}
              {note.topicTitle && note.roadmapSlug && note.topicSlug ? (
                <Link to={`/roadmaps/${note.roadmapSlug}/${note.topicSlug}`} className="underline">
                  {note.topicTitle}
                </Link>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to={`/notes?edit=${note.id}`}
              className="inline-flex min-h-9 items-center rounded-md px-2.5 text-xs font-medium text-muted hover:bg-hover hover:text-ink"
            >
              Edit
            </Link>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="noteId" value={note.id} />
              <button
                type="submit"
                disabled={busy}
                aria-label={`Delete ${note.title}`}
                className="inline-flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </Form>
          </div>
        </div>
        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
          {note.bodyMd}
        </p>
        {note.externalUrl ? (
          <a
            href={note.externalUrl}
            className="inline-flex min-h-8 items-center gap-1 text-xs text-muted underline"
          >
            Open source note <ExternalLink size={11} />
          </a>
        ) : null}
      </CardBody>
    </Card>
  );
}
