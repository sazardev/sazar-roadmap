import { describe, expect, it } from "vitest";
import { intervalLabel, type ReviewState, scheduleReview } from "./algorithm";

const fresh: ReviewState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
  state: "new",
};

const now = new Date("2026-01-01T12:00:00.000Z");

describe("scheduleReview", () => {
  it("returns a new card in ten minutes after Again", () => {
    const result = scheduleReview(fresh, "again", now);
    expect(result.state).toBe("relearning");
    expect(result.intervalLabel).toBe("10 min");
    expect(new Date(result.dueAt).getTime() - now.getTime()).toBe(10 * 60_000);
    expect(result.lapses).toBe(1);
  });

  it("schedules a new card one day out after Good", () => {
    const result = scheduleReview(fresh, "good", now);
    expect(result.intervalDays).toBe(1);
    expect(result.state).toBe("review");
    expect(result.dueAt).toBe("2026-01-02T12:00:00.000Z");
  });

  it("schedules a new card four days out after Easy", () => {
    const result = scheduleReview(fresh, "easy", now);
    expect(result.intervalDays).toBe(4);
    expect(result.easeFactor).toBeCloseTo(2.65);
  });

  it("grows a review interval by the ease factor", () => {
    const current: ReviewState = {
      easeFactor: 2.5,
      intervalDays: 10,
      repetitions: 4,
      lapses: 0,
      state: "review",
    };
    expect(scheduleReview(current, "good", now).intervalDays).toBe(25);
  });

  it("keeps ease at or above 1.3", () => {
    const current: ReviewState = { ...fresh, easeFactor: 1.3 };
    expect(scheduleReview(current, "hard", now).easeFactor).toBe(1.3);
    expect(scheduleReview(current, "again", now).easeFactor).toBe(1.3);
  });

  it("labels intervals for humans", () => {
    expect(intervalLabel({ intervalDays: 0, state: "learning" })).toBe("10 min");
    expect(intervalLabel({ intervalDays: 1, state: "review" })).toBe("1 day");
    expect(intervalLabel({ intervalDays: 45, state: "review" })).toBe("2 months");
  });
});
