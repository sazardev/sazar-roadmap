"use client";

import { Check, Copy, FileText, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SelectionState {
  text: string;
  left: number;
  top: number;
}

export function SelectionToNotes({
  topicId,
  children,
}: {
  topicId: string;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const hide = () => setSelection(null);

    const update = (event: Event) => {
      if (toolbarRef.current?.contains(event.target as Node)) return;
      const current = window.getSelection();
      if (!current || current.isCollapsed) {
        hide();
        return;
      }
      const text = current.toString().trim();
      if (text.length < 20 || text.length > 4000) {
        hide();
        return;
      }
      const range = current.getRangeAt(0);
      if (!contentRef.current?.contains(range.commonAncestorContainer)) {
        hide();
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        hide();
        return;
      }
      const left = Math.min(
        Math.max(12, rect.left + rect.width / 2 - 112),
        window.innerWidth - 232,
      );
      const top = rect.top > 110 ? rect.top - 48 : rect.bottom + 8;
      setSelection({ text, left, top });
    };

    let selectionTimer: number | null = null;
    const debouncedSelection = () => {
      if (selectionTimer) window.clearTimeout(selectionTimer);
      selectionTimer = window.setTimeout(() => update(new Event("selectionchange")), 120);
    };

    document.addEventListener("mouseup", update);
    document.addEventListener("keyup", update);
    document.addEventListener("selectionchange", debouncedSelection);
    document.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("mouseup", update);
      document.removeEventListener("keyup", update);
      document.removeEventListener("selectionchange", debouncedSelection);
      document.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      if (selectionTimer) window.clearTimeout(selectionTimer);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const flash = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const save = async () => {
    if (!selection || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/selection-note", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topicId, text: selection.text }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        target?: string;
        error?: string;
      } | null;
      if (!response.ok || !data?.ok) {
        flash(data?.error ?? "Could not save.");
        return;
      }
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      flash(data.target === "notes" ? "Saved to Notes" : "Saved in Roadmap notes");
    } catch {
      flash("Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(selection.text);
      flash("Copied");
      setSelection(null);
    } catch {
      flash("Could not copy.");
    }
  };

  return (
    <div ref={contentRef}>
      {children}
      {selection ? (
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label="Selection actions"
          style={{ left: selection.left, top: selection.top }}
          className="fixed z-[70] flex select-none items-center gap-1 rounded-full border border-ink bg-ink p-1 text-canvas shadow-float"
        >
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium hover:bg-white/15 disabled:opacity-60"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <FileText size={11} />}
            Save to Notes
          </button>
          <span className="h-4 w-px bg-white/20" aria-hidden="true" />
          <button
            type="button"
            onClick={copy}
            aria-label="Copy selection"
            className="inline-flex size-7 items-center justify-center rounded-full hover:bg-white/15"
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            onClick={() => setSelection(null)}
            aria-label="Dismiss selection actions"
            className="inline-flex size-7 items-center justify-center rounded-full hover:bg-white/15"
          >
            <X size={11} />
          </button>
        </div>
      ) : null}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink bg-ink px-3.5 py-2 text-xs text-canvas shadow-float lg:bottom-6"
        >
          <Check size={12} />
          {toast}
        </div>
      ) : null}
    </div>
  );
}
