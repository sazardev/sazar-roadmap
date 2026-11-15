export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface ReviewState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  state: "new" | "learning" | "review" | "relearning";
}

export interface ScheduledReview extends ReviewState {
  dueAt: string;
  intervalLabel: string;
}

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;

const iso = (date: Date): string => date.toISOString();

const daysFromNow = (now: Date, days: number): string =>
  iso(new Date(now.getTime() + Math.max(0, days) * DAY_MS));

export function intervalLabel(state: Pick<ReviewState, "intervalDays" | "state">): string {
  if (state.state === "learning" || state.state === "relearning") return "10 min";
  if (state.intervalDays <= 0) return "today";
  if (state.intervalDays === 1) return "1 day";
  if (state.intervalDays < 30) return `${state.intervalDays} days`;
  const months = Math.round(state.intervalDays / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

/**
 * A deliberately small SM-2 variant: predictable, easy to explain and good enough for
 * a personal learning system. "Again" returns in ten minutes; the rest schedule by day.
 */
export function scheduleReview(
  current: ReviewState,
  rating: ReviewRating,
  now = new Date(),
): ScheduledReview {
  const ease = Math.max(1.3, current.easeFactor || 2.5);
  let next: ReviewState;

  switch (rating) {
    case "again":
      next = {
        easeFactor: Math.max(1.3, ease - 0.2),
        intervalDays: 0,
        repetitions: 0,
        lapses: current.lapses + 1,
        state: "relearning",
      };
      return {
        ...next,
        dueAt: iso(new Date(now.getTime() + 10 * MINUTE_MS)),
        intervalLabel: "10 min",
      };

    case "hard":
      next = {
        easeFactor: Math.max(1.3, ease - 0.15),
        intervalDays:
          current.intervalDays < 1 ? 1 : Math.max(1, Math.round(current.intervalDays * 1.2)),
        repetitions: current.repetitions + 1,
        lapses: current.lapses,
        state: "review",
      };
      return {
        ...next,
        dueAt: daysFromNow(now, next.intervalDays),
        intervalLabel: intervalLabel(next),
      };

    case "easy":
      next = {
        easeFactor: Math.min(3, ease + 0.15),
        intervalDays:
          current.intervalDays < 1 ? 4 : Math.max(4, Math.round(current.intervalDays * ease * 1.3)),
        repetitions: current.repetitions + 1,
        lapses: current.lapses,
        state: "review",
      };
      return {
        ...next,
        dueAt: daysFromNow(now, next.intervalDays),
        intervalLabel: intervalLabel(next),
      };
    default:
      next = {
        easeFactor: ease,
        intervalDays:
          current.intervalDays < 1
            ? 1
            : current.intervalDays === 1
              ? 3
              : Math.max(1, Math.round(current.intervalDays * ease)),
        repetitions: current.repetitions + 1,
        lapses: current.lapses,
        state: "review",
      };
      return {
        ...next,
        dueAt: daysFromNow(now, next.intervalDays),
        intervalLabel: intervalLabel(next),
      };
  }
}

export function isDue(dueAt: string, now = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime();
}

export function retentionLabel(days: number): string {
  if (days <= 0) return "new";
  if (days < 7) return "learning";
  if (days < 30) return "familiar";
  return "retained";
}
