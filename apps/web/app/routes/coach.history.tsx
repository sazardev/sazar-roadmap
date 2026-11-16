import { ArrowRight, History, Plus, Trash2 } from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { LinkButton } from "~/components/ui/button";
import { EmptyState, PageHeader } from "~/components/ui/surfaces";
import { deleteThread, listThreads } from "~/features/coach/coach.server";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import { relativeDay } from "~/lib/utils";
import type { Route } from "./+types/coach.history";

export const meta = () => pageMeta("Coach history");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const threads = await listThreads(getEnv(context), user.id, 50);
  return { threads };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const env = getEnv(context);
  const form = await request.formData();
  if (String(form.get("intent") ?? "") === "delete") {
    const threadId = String(form.get("threadId") ?? "");
    if (threadId) await deleteThread(env, user.id, threadId);
  }
  return redirect("/coach/history");
}

export default function CoachHistoryPage({ loaderData }: Route.ComponentProps) {
  const { threads } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="space-y-5 sm:space-y-7">
      <PageHeader
        eyebrow="Coach"
        title="History"
        description="Every saved conversation. Open one to continue, or start a clean session."
        actions={
          <>
            <LinkButton to="/coach" variant="secondary" size="sm">
              Back to coach
            </LinkButton>
            <LinkButton to="/coach?new=1" icon={<Plus size={15} />}>
              New chat
            </LinkButton>
          </>
        }
      />

      {threads.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Start a chat with a question, a quiz or a plan. The coach keeps the thread here."
          icon={<History size={22} />}
          action={
            <LinkButton to="/coach?new=1" icon={<Plus size={15} />}>
              Start a chat
            </LinkButton>
          }
        />
      ) : (
        <ul className="overflow-hidden rounded-lg border border-line/90 bg-raised">
          {threads.map((thread, index) => (
            <li key={thread.id} className={index > 0 ? "border-t border-line/70" : undefined}>
              <div className="flex items-center gap-1 pr-1.5">
                <Link
                  to={`/coach?thread=${thread.id}`}
                  className="group flex min-h-16 min-w-0 flex-1 items-center gap-3 px-4 py-3 transition-colors duration-fast hover:bg-hover sm:px-5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <History size={16} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{thread.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
                      {thread.topicTitle ? (
                        <span className="truncate">{thread.topicTitle}</span>
                      ) : (
                        <span>No topic context</span>
                      )}
                      <span>·</span>
                      <span>{thread.messageCount} messages</span>
                      <span>·</span>
                      <span>{relativeDay(thread.updatedAt)}</span>
                    </span>
                  </span>
                  <span className="hidden sm:inline-flex">
                    <Badge tone="outline">{modeLabel(thread.mode)}</Badge>
                  </span>
                  <ArrowRight
                    size={15}
                    className="hidden shrink-0 text-muted opacity-40 transition-opacity group-hover:opacity-100 sm:block"
                  />
                </Link>
                <Form method="post" className="shrink-0">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="threadId" value={thread.id} />
                  <button
                    type="submit"
                    disabled={busy}
                    aria-label={`Delete ${thread.title}`}
                    title="Delete conversation"
                    className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </Form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function modeLabel(mode: string): string {
  if (mode === "plan") return "Plan";
  if (mode === "quiz") return "Quiz";
  if (mode === "review") return "Review";
  return "Coach";
}
