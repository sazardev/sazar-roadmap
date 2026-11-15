import { describe, expect, it } from "vitest";
import { calculateStreak } from "./progress.server";

const now = new Date("2026-11-15T18:00:00.000Z");

describe("calculateStreak", () => {
  it("returns zero with no sessions", () => {
    expect(calculateStreak([], now)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(calculateStreak(["2026-11-15", "2026-11-14", "2026-11-13"], now)).toBe(3);
  });

  it("accepts a streak that ends yesterday", () => {
    expect(calculateStreak(["2026-11-14", "2026-11-13"], now)).toBe(2);
  });

  it("stops at the first gap", () => {
    expect(calculateStreak(["2026-11-15", "2026-11-13"], now)).toBe(1);
  });

  it("ignores duplicates and unsorted input", () => {
    expect(calculateStreak(["2026-11-13", "2026-11-15", "2026-11-14", "2026-11-15"], now)).toBe(3);
  });

  it("returns zero when the newest session is too old", () => {
    expect(calculateStreak(["2026-11-10", "2026-11-09"], now)).toBe(0);
  });
});
