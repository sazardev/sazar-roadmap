import type { ReactNode } from "react";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^)\s]+)\))/g;
  let last = 0;
  while (true) {
    const match = pattern.exec(text);
    if (!match) break;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-hover px-1 py-0.5 font-mono text-[0.92em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const label = match[1] ?? "";
      const href = match[2] ?? "";
      nodes.push(
        <a key={key} href={href} target="_blank" rel="noreferrer noopener" className="underline">
          {label}
        </a>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * A deliberately small Markdown renderer for coach replies. It supports headings, paragraphs,
 * bullets, numbered lists and inline bold/code/links, and renders React nodes (never raw HTML).
 */
export function MarkdownText({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let ordered = false;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ");
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm leading-relaxed text-ink/90">
        {inline(text, `p-${blocks.length}`)}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (list.length === 0) return;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`l-${blocks.length}`}
        className={`space-y-1 pl-5 text-sm leading-relaxed text-ink/90 ${
          ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {list.map((item, index) => (
          <li key={item}>{inline(item, `li-${index}`)}</li>
        ))}
      </Tag>,
    );
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      if (code === null) {
        code = [];
      } else {
        blocks.push(
          <pre
            key={`code-${blocks.length}`}
            className="overflow-x-auto rounded-lg border border-line bg-surface p-3 font-mono text-xs leading-relaxed"
          >
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = null;
      }
      continue;
    }
    if (code !== null) {
      code.push(line);
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h4 key={`h4-${blocks.length}`} className="pt-2 text-sm font-semibold">
          {trimmed.slice(4)}
        </h4>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="pt-3 text-base font-semibold tracking-tight">
          {trimmed.slice(3)}
        </h3>,
      );
    } else if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="pt-3 text-base font-semibold tracking-tight">
          {trimmed.slice(2)}
        </h3>,
      );
    } else if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      if (ordered) flushList();
      ordered = false;
      list.push(trimmed.replace(/^[-*]\s+/, ""));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      if (!ordered) flushList();
      ordered = true;
      list.push(trimmed.replace(/^\d+\.\s+/, ""));
    } else if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote
          key={`q-${blocks.length}`}
          className="border-l-2 border-line pl-3 text-sm italic text-muted"
        >
          {inline(trimmed.slice(2), `q-${blocks.length}`)}
        </blockquote>,
      );
    } else {
      paragraph.push(trimmed);
    }
  }
  if (code !== null) {
    blocks.push(
      <pre
        key={`code-${blocks.length}`}
        className="overflow-x-auto rounded-lg border border-line bg-surface p-3 font-mono text-xs leading-relaxed"
      >
        <code>{code.join("\n")}</code>
      </pre>,
    );
  }
  flushParagraph();
  flushList();

  return <div className="space-y-2.5">{blocks}</div>;
}
