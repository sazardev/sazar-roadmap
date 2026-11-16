import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

type Tone = "neutral" | "outline" | "success" | "warning" | "danger" | "solid";

const tones: Record<Tone, string> = {
  neutral: "border-transparent bg-hover text-ink",
  outline: "border-line bg-surface/60 text-muted",
  success: "border-transparent bg-success-soft text-success",
  warning: "border-transparent bg-warning-soft text-warning",
  danger: "border-transparent bg-danger-soft text-danger",
  solid: "border-accent bg-accent text-accent-ink",
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
        "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border border-line bg-surface px-1.5 font-mono text-[10px] leading-5 text-muted shadow-sm",
        className,
      )}
    >
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
  return <span aria-hidden="true" className={cn("inline-block size-2.5 rounded-full", color)} />;
}
