import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { curricula } from "../app/content/curricula";

const here = dirname(fileURLToPath(import.meta.url));
const roadmapsRoot = resolve(here, "../../../roadmaps");

const MIN_STAGES = 5;
const MIN_GUIDED_TOPICS = 32;
const MIN_STAGE_TOPICS = 4;
const MIN_SUMMARY = 120;
const MIN_WHY = 50;
const MIN_PRACTICE = 60;
const MIN_PITFALL = 20;
const MIN_CONCEPT = 4;
const MIN_RESOURCES = 2;

/**
 * Roadmap source topics can be duplicated across node ids. Keep the variant with the most
 * resources, which is the same rule the seed builder uses.
 */
function sourceResourceCounts(roadmapSlug: string): Map<string, number> {
  const counts = new Map<string, number>();
  const contentDir = resolve(roadmapsRoot, roadmapSlug, "content");
  let files: string[] = [];
  try {
    files = readdirSync(contentDir).filter((file) => file.endsWith(".md"));
  } catch {
    return counts;
  }

  const pattern = /^\s*[-*]\s+\[(?:@[a-z-]+@)?[^\]]+\]\((https?:\/\/[^)\s]+)\)/gim;
  for (const file of files) {
    const separator = file.indexOf("@");
    const slug = (separator === -1 ? file.replace(/\.md$/, "") : file.slice(0, separator)).trim();
    if (!slug) continue;
    const text = readFileSync(resolve(contentDir, file), "utf8");
    let count = 0;
    for (const _match of text.matchAll(pattern)) count += 1;
    counts.set(slug, Math.max(counts.get(slug) ?? 0, count));
  }
  return counts;
}

const genericPatterns = [
  /treating .* as a checklist/i,
  /memorizing terminology/i,
  /this is part of the .* path/i,
  /in today's fast-paced/i,
  /it is important to note/i,
  /whether you're a beginner or an experienced/i,
  /a comprehensive guide/i,
  /unlock the (power|potential)/i,
  /take your .* to the next level/i,
  /delve into/i,
  /seamless(ly)?/i,
  /leverag(e|ing) /i,
  /game[- ]changer/i,
  /cutting[- ]edge/i,
  /robust and scalable/i,
  /one of the most important (concepts|topics|skills)/i,
  /plays a (crucial|vital|key) role/i,
  /in the ever[- ]evolving/i,
];

const fillerOpeners =
  /^(this (topic|section|stage|chapter) (covers|explains|introduces)|in this (topic|section|stage)|learn about|learn how to|a comprehensive|an overview of|this guide)/i;

const errors: string[] = [];
const warnings: string[] = [];
const summaryOwners = new Map<string, string>();
const resourceCache = new Map<string, Map<string, number>>();

/**
 * Upstream sources often ship two files about the same topic with the same H1. They are not
 * curriculum bugs, so they stay a warning; this keeps the duplication visible instead of silently
 * shipping two identically titled topics in the same roadmap.
 */
function duplicateSourceTitleGroups(): string[] {
  const groups = new Map<string, Map<string, string>>();
  for (const entry of readdirSync(roadmapsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const contentDir = resolve(roadmapsRoot, entry.name, "content");
    let files: string[] = [];
    try {
      files = readdirSync(contentDir).filter((file) => file.endsWith(".md"));
    } catch {
      continue;
    }
    for (const file of files) {
      const text = readFileSync(resolve(contentDir, file), "utf8");
      const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
      if (!title) continue;
      const separator = file.indexOf("@");
      const slug = (separator === -1 ? file.replace(/\.md$/, "") : file.slice(0, separator)).trim();
      const key = `${entry.name}\u0000${title.toLowerCase()}`;
      const slugs = groups.get(key) ?? new Map<string, string>();
      slugs.set(slug, title);
      groups.set(key, slugs);
    }
  }
  return [...groups.entries()]
    .filter(([, slugs]) => slugs.size > 1)
    .map(([key, slugs]) => {
      const [roadmap] = key.split("\u0000");
      return `${roadmap}: “${slugs.values().next().value}” [${[...slugs.keys()].join(", ")}]`;
    })
    .sort();
}

function resourcesFor(slug: string): Map<string, number> {
  let counts = resourceCache.get(slug);
  if (!counts) {
    counts = sourceResourceCounts(slug);
    resourceCache.set(slug, counts);
  }
  return counts;
}

function addError(where: string, message: string): void {
  errors.push(`${where}: ${message}`);
}

for (const curriculum of curricula) {
  const where = curriculum.slug;
  const source = resourcesFor(curriculum.slug);
  const curriculumSlugs = new Set<string>();
  const curriculumSummaries = new Map<string, string>();
  const curriculumOpeners = new Map<string, string>();
  const guides = curriculum.stages.filter((stage) => stage.slug !== "extended-library");
  const topicCount = guides.reduce((total, stage) => total + stage.topics.length, 0);
  const minutes = guides.reduce(
    (total, stage) =>
      total + stage.topics.reduce((stageTotal, item) => stageTotal + (item.minutes ?? 0), 0),
    0,
  );

  if (guides.length < MIN_STAGES) {
    addError(where, `has ${guides.length} guided stages; the minimum is ${MIN_STAGES}`);
  }
  if (topicCount < MIN_GUIDED_TOPICS) {
    addError(where, `has ${topicCount} guided topics; the minimum is ${MIN_GUIDED_TOPICS}`);
  }
  if (curriculum.description.trim().length < 120) {
    addError(where, "path description is missing or too short");
  }
  if (curriculum.tagline.trim().length < 20) {
    addError(where, "tagline is missing or too short");
  }

  for (const stage of guides) {
    const stageWhere = `${where}/${stage.slug}`;
    if (stage.title.trim().length < 3) addError(stageWhere, "stage title is too short");
    if (stage.description.trim().length < 60) {
      addError(stageWhere, "stage description is missing or too short");
    }
    if (stage.topics.length < MIN_STAGE_TOPICS) {
      addError(stageWhere, `has ${stage.topics.length} topics; the minimum is ${MIN_STAGE_TOPICS}`);
    }

    for (const item of stage.topics) {
      const topicWhere = `${stageWhere}/${item.slug}`;
      if (!/^[a-z0-9_][a-z0-9-]*$/.test(item.slug)) {
        addError(topicWhere, "slug is not lowercase kebab-case");
      }
      if (curriculumSlugs.has(item.slug)) {
        addError(topicWhere, "duplicate topic slug within this path");
      }
      curriculumSlugs.add(item.slug);

      const summary = item.summary?.trim() ?? "";
      if (summary.length < MIN_SUMMARY) {
        addError(topicWhere, `summary is missing or shorter than ${MIN_SUMMARY} characters`);
      } else if (curriculumSummaries.has(summary)) {
        addError(topicWhere, `summary duplicates ${curriculumSummaries.get(summary)}`);
      } else {
        curriculumSummaries.set(summary, topicWhere);
        const opener = summary.slice(0, 80).toLowerCase().replace(/\s+/g, " ").trim();
        const openerOwner = curriculumOpeners.get(opener);
        if (openerOwner) {
          addError(topicWhere, `summary opens with the same 80 characters as ${openerOwner}`);
        } else {
          curriculumOpeners.set(opener, topicWhere);
        }
        const owner = summaryOwners.get(summary);
        if (owner) {
          warnings.push(`${topicWhere}: summary is also used by ${owner}`);
        } else {
          summaryOwners.set(summary, topicWhere);
        }
      }
      if (summary && fillerOpeners.test(summary)) {
        addError(topicWhere, "summary opens with generic filler");
      }

      const why = item.why?.trim() ?? "";
      if (why.length < MIN_WHY) {
        addError(topicWhere, `why is missing or shorter than ${MIN_WHY} characters`);
      }
      if (why === summary) addError(topicWhere, "why repeats the summary verbatim");

      if (!item.concepts || item.concepts.length < 3) {
        addError(topicWhere, "needs at least three key concepts");
      } else {
        for (const concept of item.concepts) {
          if (concept.trim().length < MIN_CONCEPT) {
            addError(topicWhere, `concept is too short: “${concept}”`);
          }
          if (genericPatterns.some((pattern) => pattern.test(concept))) {
            addError(topicWhere, `generic concept: “${concept}”`);
          }
        }
      }

      const practice = item.practice?.trim() ?? "";
      if (practice.length < MIN_PRACTICE) {
        addError(topicWhere, `practice is missing or shorter than ${MIN_PRACTICE} characters`);
      }
      if (
        practice &&
        /^(read|explore|think about|make sure)/i.test(practice) &&
        practice.length < 90
      ) {
        addError(topicWhere, "practice is only a reading instruction, not an artifact");
      }

      if (!item.pitfalls || item.pitfalls.length < 2) {
        addError(topicWhere, "needs at least two specific pitfalls");
      } else {
        for (const pitfall of item.pitfalls) {
          if (pitfall.trim().length < MIN_PITFALL) {
            addError(topicWhere, `pitfall is too short: “${pitfall}”`);
          }
          if (genericPatterns.some((pattern) => pattern.test(pitfall))) {
            addError(topicWhere, `generic pitfall: “${pitfall}”`);
          }
        }
      }

      if (!item.difficulty) addError(topicWhere, "difficulty is missing");
      if (!item.minutes || item.minutes < 15 || item.minutes > 120) {
        addError(topicWhere, "minutes outside the 15-120 range");
      }

      const sourceCount = source.get(item.slug) ?? 0;
      const overrideCount = item.resources?.length ?? 0;
      if (sourceCount + overrideCount < MIN_RESOURCES) {
        addError(
          topicWhere,
          `has ${sourceCount + overrideCount} resources; add at least ${MIN_RESOURCES - sourceCount} authoritative link(s)`,
        );
      }
      if (sourceCount === 0) {
        warnings.push(
          source.has(item.slug)
            ? `${topicWhere}: source topic has no resource links; curriculum resources stand alone`
            : `${topicWhere}: no matching source topic; curriculum resources stand alone`,
        );
      }

      for (const text of [
        summary,
        why,
        practice,
        ...(item.pitfalls ?? []),
        ...(item.concepts ?? []),
      ]) {
        if (genericPatterns.some((pattern) => pattern.test(text))) {
          addError(topicWhere, "generic filler text");
          break;
        }
      }
    }
  }

  const hours = Math.round((minutes / 60) * 10) / 10;
  console.log(
    `${where.padEnd(32)} ${String(guides.length).padStart(2)} stages  ${String(topicCount).padStart(3)} topics  ${String(hours).padStart(5)}h`,
  );
}

const totalTopics = curricula.reduce(
  (total, curriculum) =>
    total +
    curriculum.stages
      .filter((stage) => stage.slug !== "extended-library")
      .reduce((stageTotal, stage) => stageTotal + stage.topics.length, 0),
  0,
);

console.log(
  `\n${curricula.length} guided paths, ${totalTopics} curated topics, ${summaryOwners.size} unique summaries.`,
);

const duplicateTitles = duplicateSourceTitleGroups();
if (duplicateTitles.length > 0) {
  warnings.push(
    `${duplicateTitles.length} duplicate source-title groups in the fork (same H1, different slug): ` +
      `${duplicateTitles.slice(0, 8).join(" | ")}${duplicateTitles.length > 8 ? " …" : ""}`,
  );
}

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} content issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Content audit passed.");
