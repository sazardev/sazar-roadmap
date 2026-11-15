export const RESOURCE_KINDS = [
  "article",
  "docs",
  "video",
  "course",
  "book",
  "podcast",
  "tool",
  "roadmap",
] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];
