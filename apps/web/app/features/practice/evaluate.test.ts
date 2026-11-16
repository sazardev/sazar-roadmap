import { describe, expect, it } from "vitest";
import { PASS_SCORE, verdictForScore } from "./evaluate.server";

describe("verdictForScore", () => {
  it("passes at the threshold", () => {
    expect(verdictForScore(PASS_SCORE)).toBe("pass");
  });

  it("asks for one more pass just below the threshold", () => {
    expect(verdictForScore(PASS_SCORE - 1)).toBe("revise");
  });

  it("passes strong answers", () => {
    expect(verdictForScore(90)).toBe("pass");
    expect(verdictForScore(100)).toBe("pass");
  });

  it("revises off-topic answers", () => {
    expect(verdictForScore(0)).toBe("revise");
    expect(verdictForScore(40)).toBe("revise");
  });
});
