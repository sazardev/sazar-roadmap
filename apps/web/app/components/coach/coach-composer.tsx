"use client";

import { ArrowUp, BookOpen, X } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";
import { Form, Link } from "react-router";
import { cn } from "~/lib/utils";

export function CoachComposer({
  threadId,
  topic,
  mode,
  busy,
}: {
  threadId?: string | undefined;
  topic: { id: string; title: string; slug: string; roadmapSlug: string } | null;
  mode: string;
  busy: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length >= 2 && !busy;

  const resize = () => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "0px";
    node.style.height = `${Math.min(node.scrollHeight, 176)}px`;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (!canSend) event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <Form
      method="post"
      onSubmit={submit}
      className="mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6 sm:pb-4"
    >
      <input type="hidden" name="intent" value="send" />
      {threadId ? <input type="hidden" name="threadId" value={threadId} /> : null}
      {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}
      <input type="hidden" name="mode" value={mode} />

      {topic ? (
        <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] text-muted">
          <BookOpen size={12} className="shrink-0" />
          <span className="truncate">
            Context:{" "}
            <Link
              to={`/roadmaps/${topic.roadmapSlug}/${topic.slug}`}
              className="font-medium text-ink underline decoration-line underline-offset-2"
            >
              {topic.title}
            </Link>
          </span>
          <Link
            to="/coach?new=1"
            aria-label="Clear topic context"
            className="ml-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full hover:bg-hover hover:text-ink"
          >
            <X size={11} />
          </Link>
        </div>
      ) : null}

      <div className="flex items-end gap-1.5 rounded-2xl border border-line bg-raised p-1.5 shadow-sm transition-colors focus-within:border-line-strong">
        <label htmlFor="coach-message" className="sr-only">
          Message the coach
        </label>
        <textarea
          ref={textareaRef}
          id="coach-message"
          name="content"
          rows={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            resize();
          }}
          onKeyDown={onKeyDown}
          placeholder={topic ? `Ask about ${topic.title}…` : "Ask anything about your roadmap…"}
          className="max-h-44 min-h-10 w-full resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-muted disabled:opacity-60"
          disabled={busy}
          maxLength={8000}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
            canSend ? "bg-accent text-accent-ink hover:bg-accent-strong" : "bg-surface text-muted",
          )}
        >
          <ArrowUp size={17} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted">
        <span>Grounded in your roadmap. Verify important answers.</span>
        <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>
      </div>
    </Form>
  );
}
