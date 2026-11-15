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
    <div className="flex h-28 gap-2">
      {days.map((day) => {
        const height = day.minutes === 0 ? 0 : Math.max(4, Math.round((day.minutes / max) * 100));
        const met = day.minutes >= goalMinutes;
        return (
          <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="flex w-full flex-1 items-end border-b border-line"
              title={`${day.minutes} minutes, ${day.sessions} sessions${met ? " · daily goal met" : ""}`}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-[height] duration-base",
                  day.minutes === 0 ? "bg-line" : "bg-ink",
                )}
                style={{ height: `${height}%` }}
                role="img"
                aria-label={`${day.label}: ${day.minutes} minutes`}
              />
            </div>
            <span className="text-[10px] text-muted">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}
