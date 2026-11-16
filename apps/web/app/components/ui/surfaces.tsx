import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export function Card({
  children,
  className,
  id,
  as: Component = "section",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Component
      id={id}
      className={cn("min-w-0 rounded-lg border border-line/90 bg-raised shadow-card", className)}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-line/80 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4 md:px-6 md:py-5",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-[15px] font-semibold tracking-tight sm:text-base">{title}</h2>
        {description ? (
          <p className="max-w-prose text-xs leading-relaxed text-muted sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-3.5 sm:px-5 sm:py-4 md:px-6 md:py-5", className)}>{children}</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-5 pt-0 md:pb-9 md:pt-2">
      <div className="min-w-0 max-w-3xl space-y-2">
        {eyebrow ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:text-[11px]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-3xl md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        {description ? <p className="text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong/70 bg-surface/50 px-4 py-6 sm:gap-4 sm:px-6 sm:py-8 md:px-8 md:py-10">
      {icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="max-w-lg text-sm leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="text-3xl font-semibold leading-none tracking-tight">{value}</p>
      {hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-line", className)} />;
}
