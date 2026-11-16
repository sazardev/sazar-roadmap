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
        description="Full-text search across topics, resources and your own notes. The command palette does the same thing from anywhere."
      />

      <form
        method="get"
        className="flex flex-col gap-2.5 rounded-lg border border-line bg-raised p-2.5 shadow-card sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            aria-label="Search topics, resources and notes"
            placeholder="Search topics, resources and notes..."
            className="h-12 w-full rounded-md border border-transparent bg-surface/60 pl-11 pr-4 text-base outline-none placeholder:text-muted focus-visible:border-accent focus-visible:bg-raised focus-visible:ring-4 focus-visible:ring-accent/15"
          />
        </div>
        <Button type="submit" className="h-12">
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
    <section className="space-y-3" aria-labelledby={`results-${title}`}>
      <div className="flex items-center gap-2">
        <h2 id={`results-${title}`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <Badge tone="outline">{hits.length}</Badge>
      </div>
      <Card>
        <ul className="divide-y divide-line/70">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <a
                href={hit.url}
                target={hit.url.startsWith("http") ? "_blank" : undefined}
                rel={hit.url.startsWith("http") ? "noreferrer noopener" : undefined}
                className="flex min-h-20 items-start gap-3 px-5 py-4 transition-colors duration-fast hover:bg-hover"
              >
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  {hit.kind === "topic" ? (
                    <MapIcon size={17} />
                  ) : hit.kind === "resource" ? (
                    <BookOpen size={17} />
                  ) : (
                    <FileText size={17} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium">{hit.title}</span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted">
                    {hit.snippet || hit.subtitle}
                  </span>
                </span>
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted">
                  <ArrowRight size={15} />
                </span>
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
          <span className="inline-flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              {icon}
            </span>
            {title}
          </span>
        }
      />
      <CardBody className="space-y-3">
        <p className="text-sm leading-relaxed text-muted">{body}</p>
        <Link
          to={href}
          className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4"
        >
          {link} <ArrowRight size={13} />
        </Link>
      </CardBody>
    </Card>
  );
}
