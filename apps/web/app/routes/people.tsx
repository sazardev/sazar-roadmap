import {
  ArrowUpRight,
  Check,
  ExternalLink,
  MessageCircleQuestion,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input, Select, Textarea } from "~/components/ui/field";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import {
  answerQuestion,
  createPerson,
  createQuestion,
  deletePerson,
  listPeople,
  listQuestions,
  updatePersonContact,
} from "~/features/people/people.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { useOpenHashDetails } from "~/lib/use-hash-details";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/people";

export const meta = () => pageMeta("People and questions");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const [people, questions, topics] = await Promise.all([
    listPeople(env, user.id),
    listQuestions(env, user.id),
    env.DB.prepare(
      `SELECT t.id, t.title, r.title AS roadmapTitle FROM topics t
       JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE r.status IN ('guided', 'reference')
       ORDER BY r.sort_order, t.sort_order LIMIT 400`,
    ).all<{ id: string; title: string; roadmapTitle: string }>(),
  ]);
  return { people, questions, topics: topics.results ?? [] };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create-person") {
    const name = String(form.get("name") ?? "").trim();
    if (name.length < 2) return Response.json({ error: "A person needs a name." }, { status: 400 });
    const expertise = String(form.get("expertise") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    await createPerson(env, user.id, {
      name,
      role: String(form.get("role") ?? "").trim() || undefined,
      expertise,
      url: String(form.get("url") ?? "").trim() || undefined,
      notes: String(form.get("notes") ?? "").trim() || undefined,
    });
    return redirect("/people");
  }

  if (intent === "contact-person") {
    const personId = String(form.get("personId") ?? "");
    if (personId) await updatePersonContact(env, user.id, personId);
    return redirect("/people");
  }

  if (intent === "delete-person") {
    const personId = String(form.get("personId") ?? "");
    if (personId) await deletePerson(env, user.id, personId);
    return redirect("/people");
  }

  if (intent === "create-question") {
    const body = String(form.get("body") ?? "").trim();
    if (body.length < 8)
      return Response.json({ error: "Write a specific question." }, { status: 400 });
    await createQuestion(env, user.id, {
      body,
      topicId: String(form.get("topicId") ?? "") || null,
      personId: String(form.get("personId") ?? "") || null,
    });
    return redirect("/people");
  }

  if (intent === "answer-question") {
    const questionId = String(form.get("questionId") ?? "");
    const answer = String(form.get("answer") ?? "").trim();
    if (questionId && answer.length > 1) {
      await answerQuestion(env, user.id, questionId, answer);
    }
    return redirect("/people");
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export default function PeoplePage({ loaderData }: Route.ComponentProps) {
  const { people, questions, topics } = loaderData;
  const navigation = useNavigation();
  useOpenHashDetails();
  const busy = navigation.state !== "idle";
  const openQuestions = questions.filter((question) => question.status === "open");
  const answered = questions.filter((question) => question.status !== "open");

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Human help"
        title="People & questions"
        description="The fastest way past a wall is often a person. Keep the people who can help, write the question before you ask it, and record the answer."
        actions={
          <>
            <a
              href="#new-person"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
            >
              <Plus size={16} /> Add person
            </a>
            <a
              href="#new-question"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-raised px-5 text-sm font-medium shadow-sm transition-colors hover:bg-hover"
            >
              <MessageCircleQuestion size={16} /> Ask a question
            </a>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="space-y-4" aria-labelledby="open-questions">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 id="open-questions" className="text-xl font-semibold tracking-tight">
                  Open questions
                </h2>
                <p className="text-sm text-muted">
                  A question you can write clearly is already half answered.
                </p>
              </div>
              <Badge tone="outline">{openQuestions.length} open</Badge>
            </div>
            {openQuestions.length === 0 ? (
              <EmptyState
                title="No open questions"
                description="When you get stuck, write the question here before asking anyone. The act of writing often exposes the gap."
                icon={<MessageCircleQuestion size={20} />}
                action={
                  <a href="#new-question" className="text-sm underline">
                    Write a question
                  </a>
                }
              />
            ) : (
              <div className="space-y-3">
                {openQuestions.map((question) => (
                  <Card key={question.id}>
                    <CardBody className="space-y-3 p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                          <MessageCircleQuestion size={17} />
                        </span>
                        <p className="flex-1 whitespace-pre-wrap text-base leading-relaxed">
                          {question.body}
                        </p>
                        <span className="shrink-0 text-xs text-muted">
                          {relativeDay(question.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        {question.topicTitle && question.roadmapSlug && question.topicSlug ? (
                          <Link
                            to={`/roadmaps/${question.roadmapSlug}/${question.topicSlug}`}
                            className="underline"
                          >
                            {question.topicTitle}
                          </Link>
                        ) : null}
                        {question.personName ? <span>· Ask {question.personName}</span> : null}
                      </div>
                      <Form method="post" className="space-y-2.5 border-t border-line/80 pt-4">
                        <input type="hidden" name="intent" value="answer-question" />
                        <input type="hidden" name="questionId" value={question.id} />
                        <Textarea
                          name="answer"
                          className="min-h-24"
                          placeholder="What did you learn or what did they say?"
                          aria-label="Answer"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          icon={<Check size={15} />}
                        >
                          Save answer
                        </Button>
                      </Form>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4" aria-labelledby="people-list">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 id="people-list" className="text-xl font-semibold tracking-tight">
                  People
                </h2>
                <p className="text-sm text-muted">
                  Mentors, peers and communities worth asking well.
                </p>
              </div>
              <Badge tone="outline">{people.length} people</Badge>
            </div>
            {people.length === 0 ? (
              <EmptyState
                title="No people saved"
                description="Add one mentor or peer who knows the area you are studying. A name is enough to start."
                icon={<Users size={20} />}
                action={
                  <a href="#new-person" className="text-sm underline">
                    Add the first person
                  </a>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {people.map((person) => (
                  <Card key={person.id}>
                    <CardBody className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold">{person.name}</h3>
                          {person.role ? <p className="text-sm text-muted">{person.role}</p> : null}
                        </div>
                        {person.url ? (
                          <a
                            href={person.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label={`Open ${person.name}`}
                            className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-ink"
                          >
                            <ArrowUpRight size={16} />
                          </a>
                        ) : null}
                      </div>
                      {person.expertise.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {person.expertise.map((tag) => (
                            <Badge key={tag} tone="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {person.notes ? (
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                          {person.notes}
                        </p>
                      ) : null}
                      <div className="flex items-center justify-between border-t border-line/80 pt-3 text-xs text-muted">
                        <span>
                          {person.lastContactedAt
                            ? `Contacted ${relativeDay(person.lastContactedAt).toLowerCase()}`
                            : "Never contacted"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Form method="post">
                            <input type="hidden" name="intent" value="contact-person" />
                            <input type="hidden" name="personId" value={person.id} />
                            <button
                              type="submit"
                              disabled={busy}
                              className="inline-flex min-h-9 items-center rounded-md px-2.5 transition-colors hover:bg-hover hover:text-ink disabled:opacity-50"
                            >
                              Mark contacted
                            </button>
                          </Form>
                          <Form
                            method="post"
                            onSubmit={(event) => {
                              if (
                                !window.confirm(`Delete ${person.name}? This cannot be undone.`)
                              ) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="intent" value="delete-person" />
                            <input type="hidden" name="personId" value={person.id} />
                            <button
                              type="submit"
                              disabled={busy}
                              aria-label={`Delete ${person.name}`}
                              className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </Form>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {answered.length > 0 ? (
            <details className="rounded-lg border border-line bg-raised shadow-card">
              <summary className="flex min-h-16 cursor-pointer list-none items-center px-5 py-4 text-sm font-medium text-muted [&::-webkit-details-marker]:hidden">
                Answered questions ({answered.length})
              </summary>
              <div className="space-y-3 border-t border-line/80 p-4 md:p-5">
                {answered.map((question) => (
                  <div key={question.id} className="space-y-2 rounded-md border border-line p-4">
                    <p className="text-base">{question.body}</p>
                    <p className="whitespace-pre-wrap border-t border-line/80 pt-3 text-sm leading-relaxed text-muted">
                      {question.answer ?? "Answered."}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </div>

        <aside className="space-y-4">
          <details
            id="new-question"
            className="rounded-lg border border-line bg-raised shadow-card"
          >
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-2 px-5 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
              <Plus size={17} /> Write a question
            </summary>
            <Form method="post" className="space-y-3 border-t border-line/80 p-5">
              <input type="hidden" name="intent" value="create-question" />
              <Textarea
                name="body"
                required
                className="min-h-28"
                placeholder="What are you trying to do, what did you try, and where did it fail?"
                aria-label="Question"
              />
              <label className="block space-y-2">
                <span className="text-sm font-medium">Topic (optional)</span>
                <Select name="topicId" defaultValue="">
                  <option value="">No topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.roadmapTitle} / {topic.title}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Person (optional)</span>
                <Select name="personId" defaultValue="">
                  <option value="">Anyone</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </Select>
              </label>
              <Button type="submit" disabled={busy}>
                Save question
              </Button>
            </Form>
          </details>

          <details id="new-person" className="rounded-lg border border-line bg-raised shadow-card">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-2 px-5 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
              <Plus size={17} /> Add person
            </summary>
            <Form method="post" className="space-y-3 border-t border-line/80 p-5">
              <input type="hidden" name="intent" value="create-person" />
              <Input name="name" required placeholder="Name" aria-label="Name" />
              <Input name="role" placeholder="Role or context" aria-label="Role" />
              <Input
                name="expertise"
                placeholder="Expertise, comma separated"
                aria-label="Expertise"
              />
              <Input name="url" type="url" placeholder="https://..." aria-label="Profile URL" />
              <Textarea
                name="notes"
                className="min-h-24"
                placeholder="How do they prefer to be asked? What do they know?"
                aria-label="Notes"
              />
              <Button type="submit" disabled={busy}>
                Save person
              </Button>
            </Form>
          </details>

          <Card>
            <CardHeader title="Where to ask" description="Public places with good norms." />
            <CardBody className="space-y-1 text-sm">
              {[
                ["Stack Overflow", "https://stackoverflow.com/questions/ask"],
                ["r/learnprogramming", "https://www.reddit.com/r/learnprogramming/"],
                ["Cloudflare Developers", "https://discord.cloudflare.com/"],
                ["MDN", "https://developer.mozilla.org/en-US/"],
                ["GitHub Discussions", "https://github.com/orgs/community/discussions"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex min-h-10 items-center justify-between gap-2 rounded-md px-2.5 text-muted transition-colors hover:bg-hover hover:text-ink"
                >
                  {label}
                  <ExternalLink size={12} />
                </a>
              ))}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
