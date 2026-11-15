import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

type Tone = "neutral" | "outline" | "success" | "warning" | "danger" | "solid";

const tones: Record<Tone, string> = {
  neutral: "border-transparent bg-hover text-ink",
  outline: "border-line bg-transparent text-muted",
  success: "border-transparent bg-success/10 text-success",
  warning: "border-transparent bg-warning/10 text-warning",
  danger: "border-transparent bg-danger/10 text-danger",
  solid: "border-ink bg-ink text-canvas",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-line bg-surface px-1.5 font-mono text-[10px] leading-5 text-muted">
      {children}
    </kbd>
  );
}

export function StatusDot({
  tone = "neutral",
}: {
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const color = {
    neutral: "bg-line-strong",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[tone];
  return <span aria-hidden="true" className={cn("inline-block size-2 rounded-full", color)} />;
}
