export function pageMeta(title: string, description?: string) {
  return [
    { title: `${title} · Sazar Roadmap` },
    {
      name: "description",
      content:
        description ??
        "A private learning operating system: guided roadmaps, deliberate practice, spaced review and an AI coach.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
}
