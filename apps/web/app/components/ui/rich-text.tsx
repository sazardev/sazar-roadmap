import { Fragment, type ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * Renders the small amount of inline markup used by curriculum prose. Curated topics use
 * backticks for identifiers and commands; without this, the reader sees the backticks literally.
 */
export function RichText({ text, className }: { text: string; className?: string }): ReactNode {
  let offset = 0;
  const parts = text.split(/(`[^`]+`)/g).map((part) => {
    const start = offset;
    offset += part.length;
    return { part, start };
  });

  return (
    <span className={cn(className)}>
      {parts.map(({ part, start }) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code
            key={`${start}-${part}`}
            className="rounded-sm border border-line/70 bg-hover px-1 py-0.5 font-mono text-[0.92em]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={`${start}-text`}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
