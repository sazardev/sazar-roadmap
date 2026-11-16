import { cn } from "~/lib/utils";

export function WeeklyBars({
  days,
  goalMinutes = 30,
}: {
  days: Array<{ date: string; label: string; minutes: number; sessions: number }>;
  goalMinutes?: number;
}) {
  const max = Math.max(goalMinutes, ...days.map((day) => day.minutes), 1);
  return (
    <div className="flex h-40 items-stretch gap-2" role="img" aria-label="Weekly study minutes">
      {days.map((day) => {
        const height = day.minutes === 0 ? 0 : Math.max(5, Math.round((day.minutes / max) * 100));
        const met = day.minutes >= goalMinutes;
        return (
          <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
            <div
              className="flex w-full flex-1 items-end rounded-md bg-surface/40"
              title={`${day.minutes} minutes, ${day.sessions} sessions${met ? " · daily goal met" : ""}`}
            >
              <div
                className={cn(
                  "w-full rounded-md transition-[height] duration-base ease-out",
                  day.minutes === 0 ? "h-1 bg-line" : met ? "bg-accent" : "bg-accent/35",
                )}
                style={{ height: day.minutes === 0 ? undefined : `${height}%` }}
              />
            </div>
            <span className={cn("text-xs", met ? "font-medium text-ink" : "text-muted")}>
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
