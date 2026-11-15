import { cn, percent } from "~/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  showValue = false,
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  showValue?: boolean;
}) {
  const ratio = percent(value, max);
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-4 text-xs text-muted">
          {label ? <span>{label}</span> : <span />}
          {showValue ? <span className="font-mono tabular-nums">{ratio}%</span> : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        aria-label={label ?? "Progress"}
        className="h-1.5 w-full overflow-hidden rounded-full bg-hover"
      >
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-base ease-out"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  max = 100,
  size = 56,
  stroke = 4,
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const ratio = percent(value, max);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (ratio / 100) * circumference;
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      role="img"
      aria-label={label ?? `${ratio}% complete`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <title>{label ?? `${ratio}% complete`}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--hover)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-medium tabular-nums">{ratio}%</span>
    </div>
  );
}
