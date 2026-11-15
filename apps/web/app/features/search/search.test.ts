import { describe, expect, it } from "vitest";
import { toFtsQuery } from "./search.server";

describe("toFtsQuery", () => {
  it("returns null for empty input", () => {
    expect(toFtsQuery("   ")).toBeNull();
  });

  it("turns words into prefix terms joined with AND", () => {
    expect(toFtsQuery("React hooks")).toBe("react* AND hooks*");
  });

  it("removes FTS operators and quotes", () => {
    expect(toFtsQuery('react" OR "secret')).toBe("react* AND or* AND secret*");
  });

  it("splits hyphenated terms because FTS reads them as operators", () => {
    expect(toFtsQuery("full-stack")).toBe("full* AND stack*");
  });

  it("limits the number of terms", () => {
    const query = toFtsQuery("a b c d e f g h i j");
    expect(query?.split(" AND ")).toHaveLength(8);
  });
});
