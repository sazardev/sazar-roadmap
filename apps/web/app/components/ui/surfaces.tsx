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
    <Component id={id} className={cn("rounded-md border border-line bg-canvas", className)}>
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
        "flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="max-w-prose text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
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
    <header className="flex flex-wrap items-end justify-between gap-6 pb-8 pt-2">
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
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
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
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
    <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-line px-6 py-10">
      {icon ? <div className="text-muted">{icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted">{description}</p>
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
    <div className="space-y-1">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold leading-none tracking-tight">{value}</p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-line", className)} />;
}
