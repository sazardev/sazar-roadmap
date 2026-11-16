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
        className="grid gap-3 rounded-lg border border-line bg-raised p-3 shadow-card sm:grid-cols-2 sm:items-end xl:grid-cols-[minmax(0,1fr)_170px_220px_auto]"
      >
        <label className="space-y-2 sm:col-span-2 xl:col-span-1">
          <span className="text-sm font-medium">Search</span>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Title, provider or topic..."
              className="h-12 w-full rounded-md border border-line bg-surface/50 pl-10 pr-3.5 text-base outline-none placeholder:text-muted focus-visible:border-accent focus-visible:bg-raised focus-visible:ring-4 focus-visible:ring-accent/15"
            />
          </div>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Kind</span>
          <select
            name="kind"
            defaultValue={selectedKind}
            className="h-12 w-full rounded-md border border-line bg-surface/50 px-3.5 text-base focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
          >
            <option value="">All kinds</option>
            {RESOURCE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Roadmap</span>
          <select
            name="roadmap"
            defaultValue={selectedRoadmap}
            className="h-12 w-full rounded-md border border-line bg-surface/50 px-3.5 text-base focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
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
        <Button
          type="submit"
          disabled={busy}
          icon={<Filter size={16} />}
          className="h-12 sm:col-span-2 xl:col-span-1"
        >
          Apply
        </Button>
      </Form>

      {filters.q || filters.kind !== "all" || filters.roadmap !== "all" || filters.saved ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
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
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-between gap-3 text-sm"
        >
          <span className="text-muted">
            Page {page} of {pages} · {total.toLocaleString()} resources
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <LinkButton to={buildHref({ page: String(page - 1) })} variant="secondary" size="sm">
                Previous
              </LinkButton>
            ) : null}
            {page < pages ? (
              <LinkButton to={buildHref({ page: String(page + 1) })} variant="secondary" size="sm">
                Next
              </LinkButton>
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
    <li className="flex min-h-20 items-start gap-4 px-4 py-4 sm:px-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
        <BookOpen size={18} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-base font-medium underline decoration-line underline-offset-4 hover:decoration-accent"
        >
          <span className="line-clamp-1">{resource.title}</span>
          <ExternalLink size={12} className="shrink-0 text-muted" />
        </a>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
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
          className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-accent disabled:opacity-50"
        >
          {resource.bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </Form>
    </li>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      to={href}
      className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line bg-surface/60 px-3 text-muted transition-colors hover:bg-hover hover:text-ink"
    >
      {label} <span aria-hidden="true">×</span>
    </Link>
  );
}
