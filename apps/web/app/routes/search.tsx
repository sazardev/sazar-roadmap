import { ArrowRight, BookOpen, FileText, Map as MapIcon, Search } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, PageHeader } from "~/components/ui/surfaces";
import { type SearchHit, searchAll } from "~/features/search/search.server";
import { requireUser } from "~/lib/auth/auth.server";
import { getEnv } from "~/lib/db.server";
import type { Route } from "./+types/search";

export const meta = ({ data }: Route.MetaArgs) =>
  pageMeta(data?.q ? `Search: ${data.q}` : "Search");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await requireUser(context, request);
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const results = q.length >= 2 ? await searchAll(getEnv(context), user.id, q, 12) : null;
  return { q, results };
}

export default function SearchPage({ loaderData }: Route.ComponentProps) {
  const { q, results } = loaderData;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Everything"
        title="Search"
        description="Full-text search over 2,000 topics, 5,000 resources and your own notes. The command palette does the same thing from anywhere."
      />

      <form method="get" className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search topics, resources and notes..."
            className="h-12 w-full rounded-sm border border-line bg-canvas pl-10 pr-4 text-[15px] outline-none placeholder:text-muted focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-focus/40"
          />
        </div>
        <Button type="submit" size="lg">
          Search
        </Button>
      </form>

      {!results ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SearchCategory
            icon={<MapIcon size={18} />}
            title="Topics"
            body="Search the guided and reference libraries by title, summary, concepts or content."
            href="/roadmaps"
            link="Browse roadmaps"
          />
          <SearchCategory
            icon={<BookOpen size={18} />}
            title="Resources"
            body="Find a specific article, video, course or documentation page by title or provider."
            href="/resources"
            link="Open the shelf"
          />
          <SearchCategory
            icon={<FileText size={18} />}
            title="Your notes"
            body="Search the notes you wrote while studying. Notes are private and indexed locally."
            href="/notes"
            link="Open notes"
          />
        </div>
      ) : results.total === 0 ? (
        <EmptyState
          title={`No matches for “${q}”`}
          description="Try fewer words, a broader term, or search for the roadmap instead of the exact title."
          icon={<Search size={22} />}
          action={
            <Link to="/search" className="text-sm underline">
              Clear search
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted">
            {results.total} result{results.total === 1 ? "" : "s"} for “{q}”.
          </p>
          {results.topics.length > 0 ? <ResultGroup title="Topics" hits={results.topics} /> : null}
          {results.resources.length > 0 ? (
            <ResultGroup title="Resources" hits={results.resources} />
          ) : null}
          {results.notes.length > 0 ? (
            <ResultGroup title="Your notes" hits={results.notes} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ title, hits }: { title: string; hits: SearchHit[] }) {
  return (
    <section className="space-y-2" aria-labelledby={`results-${title}`}>
      <div className="flex items-center gap-2">
        <h2 id={`results-${title}`} className="text-sm font-semibold">
          {title}
        </h2>
        <Badge tone="outline">{hits.length}</Badge>
      </div>
      <Card>
        <ul className="divide-y divide-line">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <a
                href={hit.url}
                target={hit.url.startsWith("http") ? "_blank" : undefined}
                rel={hit.url.startsWith("http") ? "noreferrer noopener" : undefined}
                className="flex items-start gap-3 px-4 py-3 transition-colors duration-fast hover:bg-hover"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-muted">
                  {hit.kind === "topic" ? (
                    <MapIcon size={14} />
                  ) : hit.kind === "resource" ? (
                    <BookOpen size={14} />
                  ) : (
                    <FileText size={14} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{hit.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
                    {hit.snippet || hit.subtitle}
                  </span>
                </span>
                <ArrowRight size={13} className="mt-1 shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function SearchCategory({
  icon,
  title,
  body,
  href,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  link: string;
}) {
  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            {icon}
            {title}
          </span>
        }
      />
      <CardBody className="space-y-3">
        <p className="text-xs leading-relaxed text-muted">{body}</p>
        <Link to={href} className="inline-flex items-center gap-1 text-xs underline">
          {link} <ArrowRight size={11} />
        </Link>
      </CardBody>
    </Card>
  );
}
