export function pageMeta(title: string, description?: string) {
  return [
    { title: `${title} · Sazar Roadmap` },
    ...(description ? [{ name: "description", content: description }] : []),
    { name: "robots", content: "noindex, nofollow" },
  ];
}
