import { curricula } from "../app/content/curricula";

const roadmap = curricula.find((item) => item.slug === "golang");
if (!roadmap) {
  console.error("Go curriculum not found.");
  process.exit(1);
}

const errors: string[] = [];
const summaries = new Map<string, string>();
const slugs = new Set<string>();
const genericPatterns = [
  /treating .* as a checklist item/i,
  /memorizing terminology without/i,
  /this is part of the .* path/i,
];

let topics = 0;
for (const stage of roadmap.stages) {
  for (const item of stage.topics) {
    topics += 1;
    const where = `${stage.slug}/${item.slug}`;
    if (slugs.has(item.slug)) errors.push(`${where}: duplicate topic slug`);
    slugs.add(item.slug);

    if (!item.summary || item.summary.trim().length < 100) {
      errors.push(`${where}: summary is missing or too short`);
    } else if (summaries.has(item.summary)) {
      errors.push(`${where}: summary duplicates ${summaries.get(item.summary)}`);
    } else {
      summaries.set(item.summary, where);
    }

    if (!item.why || item.why.trim().length < 50) {
      errors.push(`${where}: why it matters is missing or too short`);
    }
    if (!item.concepts || item.concepts.length < 3) {
      errors.push(`${where}: needs at least three key concepts`);
    }
    if (!item.practice || item.practice.trim().length < 50) {
      errors.push(`${where}: practice prompt is missing or too short`);
    }
    if (!item.pitfalls || item.pitfalls.length < 2) {
      errors.push(`${where}: needs at least two specific pitfalls`);
    }
    if (!item.minutes || item.minutes < 15 || item.minutes > 120) {
      errors.push(`${where}: minutes outside the 15-120 range`);
    }
    for (const text of [item.summary ?? "", item.why ?? "", item.practice ?? ""]) {
      if (genericPatterns.some((pattern) => pattern.test(text))) {
        errors.push(`${where}: generic filler text`);
      }
    }
    for (const pitfall of item.pitfalls ?? []) {
      if (genericPatterns.some((pattern) => pattern.test(pitfall))) {
        errors.push(`${where}: generic pitfall`);
      }
    }
  }
}

console.log(`Go curriculum: ${roadmap.stages.length} stages, ${topics} topics`);
console.log(`Unique summaries: ${summaries.size}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} content issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Content audit passed.");
