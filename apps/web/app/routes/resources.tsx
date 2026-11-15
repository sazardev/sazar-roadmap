import { Bookmark, BookmarkCheck, BookOpen, ExternalLink, Filter, Search } from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button, LinkButton } from "~/components/ui/button";
import { Card, EmptyState, PageHeader } from "~/components/ui/surfaces";
import {
  getResourceRoadmaps,
  listResources,
  type ResourceItem,
  toggleBookmark,
} from "~/features/resources/resources.server";
import { RESOURCE_KINDS } from "~/features/resources/resources.shared";
import { assertSameOrigin, requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/resources";

export const meta = () => pageMeta("Resources");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const env = getEnv(context);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const kind = url.searchParams.get("kind") ?? "all";
  const roadmap = url.searchParams.get("roadmap") ?? "all";
  const saved = url.searchParams.get("saved") === "1";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const [result, roadmaps] = await Promise.all([
    listResources(env, user.id, { q, kind, roadmap, saved, page }),
    getResourceRoadmaps(env),
  ]);
  return {
    ...result,
    roadmaps,
    filters: { q, kind, roadmap, saved },
    returnTo: `${url.pathname}${url.search}`,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = await requireUser(context, request);
  assertSameOrigin(request);
  const form = await request.formData();
  const resourceId = String(form.get("resourceId") ?? "");
  const returnTo = String(form.get("returnTo") ?? "/resources");
  if (resourceId) await toggleBookmark(getEnv(context), user.id, resourceId);
  const safe = returnTo.startsWith("/resources") ? returnTo : "/resources";
  return redirect(safe);
}

export default function ResourcesPage({ loaderData }: Route.ComponentProps) {
  const { items, total, page, pages, roadmaps, filters, returnTo } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const selectedKind = filters.kind !== "all" ? filters.kind : "";
  const selectedRoadmap = filters.roadmap !== "all" ? filters.roadmap : "";

  const buildHref = (changes: Record<string, string | null>): string => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.kind !== "all") params.set("kind", filters.kind);
    if (filters.roadmap !== "all") params.set("roadmap", filters.roadmap);
    if (filters.saved) params.set("saved", "1");
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    return `/resources${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Reference shelf"
        title="Resources"
        description={`${total.toLocaleString()} curated links from the roadmap fork. Search by title, provider or topic; bookmark what you will actually use.`}
        actions={
          <LinkButton
            to={buildHref({ saved: filters.saved ? null : "1", page: null })}
            variant="secondary"
            icon={<Bookmark size={15} />}
          >
            {filters.saved ? "Show all" : "Saved only"}
          </LinkButton>
        }
      />

      <Form
        method="get"
        className="grid gap-3 rounded-md border border-line bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_160px_200px_auto] sm:items-end"
      >
        <label className="space-y-1.5">
          <span className="text-xs text-muted">Search</span>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Title, provider or topic..."
              className="h-10 w-full rounded-sm border border-line bg-canvas pl-8 pr-3 text-sm outline-none placeholder:text-muted focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-focus/40"
            />
          </div>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-muted">Kind</span>
          <select
            name="kind"
            defaultValue={selectedKind}
            className="h-10 w-full rounded-sm border border-line bg-canvas px-3 text-sm"
          >
            <option value="">All kinds</option>
            {RESOURCE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-muted">Roadmap</span>
          <select
            name="roadmap"
            defaultValue={selectedRoadmap}
            className="h-10 w-full rounded-sm border border-line bg-canvas px-3 text-sm"
          >
            <option value="">All roadmaps</option>
            {roadmaps.map((roadmap) => (
              <option key={roadmap.slug} value={roadmap.slug}>
                {roadmap.title}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="saved" value={filters.saved ? "1" : "0"} />
        <Button type="submit" disabled={busy} icon={<Filter size={14} />}>
          Apply
        </Button>
      </Form>

      {filters.q || filters.kind !== "all" || filters.roadmap !== "all" || filters.saved ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted">{total.toLocaleString()} results</span>
          {filters.q ? (
            <FilterChip label={`Search: ${filters.q}`} href={buildHref({ q: null, page: null })} />
          ) : null}
          {filters.kind !== "all" ? (
            <FilterChip
              label={`Kind: ${filters.kind}`}
              href={buildHref({ kind: null, page: null })}
            />
          ) : null}
          {filters.roadmap !== "all" ? (
            <FilterChip
              label={`Roadmap: ${filters.roadmap}`}
              href={buildHref({ roadmap: null, page: null })}
            />
          ) : null}
          {filters.saved ? (
            <FilterChip label="Saved only" href={buildHref({ saved: null, page: null })} />
          ) : null}
          <Link to="/resources" className="text-muted underline">
            Clear all
          </Link>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="No resources match those filters"
          description="Try a broader search, a different kind, or clear the filters to browse the shelf."
          icon={<BookOpen size={22} />}
          action={
            <LinkButton to="/resources" variant="secondary">
              Clear filters
            </LinkButton>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {items.map((resource) => (
              <ResourceRow key={resource.id} resource={resource} busy={busy} returnTo={returnTo} />
            ))}
          </ul>
        </Card>
      )}

      {pages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted">
            Page {page} of {pages} · {total.toLocaleString()} resources
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                to={buildHref({ page: String(page - 1) })}
                className="rounded-sm border border-line px-3 py-1.5 hover:bg-hover"
              >
                Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link
                to={buildHref({ page: String(page + 1) })}
                className="rounded-sm border border-line px-3 py-1.5 hover:bg-hover"
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function ResourceRow({
  resource,
  busy,
  returnTo,
}: {
  resource: ResourceItem;
  busy: boolean;
  returnTo: string;
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-muted">
        <BookOpen size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink"
        >
          <span className="line-clamp-1">{resource.title}</span>
          <ExternalLink size={11} className="shrink-0 text-muted" />
        </a>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
          <span>{resource.provider ?? resource.kind}</span>
          <span>·</span>
          <Badge tone="outline">{resource.kind}</Badge>
          {resource.topicTitle && resource.roadmapSlug && resource.topicSlug ? (
            <>
              <span>·</span>
              <Link
                to={`/roadmaps/${resource.roadmapSlug}/${resource.topicSlug}`}
                className="underline"
              >
                {resource.topicTitle}
              </Link>
            </>
          ) : resource.roadmapTitle ? (
            <>
              <span>·</span>
              <Link to={`/roadmaps/${resource.roadmapSlug}`} className="underline">
                {resource.roadmapTitle}
              </Link>
            </>
          ) : null}
          {resource.estimatedMinutes ? (
            <>
              <span>·</span>
              <span>{resource.estimatedMinutes} min</span>
            </>
          ) : null}
        </div>
      </div>
      <Form method="post">
        <input type="hidden" name="resourceId" value={resource.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          disabled={busy}
          aria-label={
            resource.bookmarked ? `Remove bookmark ${resource.title}` : `Bookmark ${resource.title}`
          }
          className="inline-flex size-8 items-center justify-center rounded-sm text-muted hover:bg-hover hover:text-ink disabled:opacity-50"
        >
          {resource.bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
      </Form>
    </li>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      to={href}
      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-muted hover:bg-hover hover:text-ink"
    >
      {label} <span aria-hidden="true">×</span>
    </Link>
  );
}
