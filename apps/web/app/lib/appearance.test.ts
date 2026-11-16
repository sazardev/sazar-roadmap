import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, normalizeAppearance } from "./appearance";

describe("normalizeAppearance", () => {
  it("keeps a complete, valid appearance", () => {
    expect(
      normalizeAppearance({
        theme: "dark",
        accent: "ocean",
        density: "compact",
        corners: "sharp",
        textSize: "large",
      }),
    ).toEqual({
      theme: "dark",
      accent: "ocean",
      density: "compact",
      corners: "sharp",
      textSize: "large",
    });
  });

  it("replaces unknown values with the default appearance", () => {
    expect(
      normalizeAppearance({
        theme: "sepia",
        accent: "neon",
        density: "tiny",
        corners: "round",
        textSize: "huge",
      }),
    ).toEqual(DEFAULT_APPEARANCE);
  });

  it("uses a valid account fallback when a cookie is absent", () => {
    expect(
      normalizeAppearance(
        {},
        {
          theme: "light",
          accent: "rose",
          density: "compact",
          corners: "soft",
          textSize: "standard",
        },
      ),
    ).toEqual({
      theme: "light",
      accent: "rose",
      density: "compact",
      corners: "soft",
      textSize: "standard",
    });
  });

  it("ignores an invalid account fallback", () => {
    expect(normalizeAppearance({ accent: "moss" }, { theme: "sepia", accent: "neon" })).toEqual({
      ...DEFAULT_APPEARANCE,
      accent: "moss",
    });
  });
});
