import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { curricula } from "../app/content/curricula";
import type { Curriculum, CurriculumTopic } from "../app/content/types";
import { titleCase } from "../app/lib/utils";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const roadmapsRoot = resolve(repoRoot, "roadmaps");
const outputDir = resolve(here, "../.generated");

interface ParsedResource {
  label: string;
  url: string;
  kind: string;
  provider: string | null;
}

interface ParsedTopic {
  slug: string;
  title: string;
  summary: string;
  resources: ParsedResource[];
  body: string;
  sourceFile: string;
}

interface RoadmapSource {
  slug: string;
  title: string;
  topics: Map<string, ParsedTopic>;
}

const ROADMAP_TITLE_OVERRIDES: Record<string, string> = {
  "ai-agents": "AI Agents",
  "ai-data-scientist": "AI and Data Scientist",
  "ai-engineer": "AI Engineer",
  "ai-product-builder": "AI Product Builder",
  "ai-red-teaming": "AI Red Teaming",
  "api-design": "API Design",
  aspnet: "ASP.NET Core",
  aws: "AWS",
  "bi-analyst": "BI Analyst",
  c: "C",
  "claude-code": "Claude Code",
  cloudflare: "Cloudflare",
  cpp: "C++",
  "computer-science": "Computer Science",
  "code-review": "Code Review",
  codex: "Codex",
  cursor: "Cursor",
  "cyber-security": "Cyber Security",
  "data-analyst": "Data Analyst",
  "data-engineer": "Data Engineer",
  "datastructures-and-algorithms": "Data Structures and Algorithms",
  "design-system": "Design System",
  devops: "DevOps",
  "devops-beginner": "DevOps Beginner",
  devrel: "Developer Relations",
  devsecops: "DevSecOps",
  django: "Django",
  docker: "Docker",
  elasticsearch: "Elasticsearch",
  "engineering-manager": "Engineering Manager",
  flutter: "Flutter",
  "forward-deployed-engineer": "Forward Deployed Engineer",
  frontend: "Frontend",
  "frontend-beginner": "Frontend Beginner",
  "full-stack": "Full Stack",
  "game-developer": "Game Developer",
  git: "Git",
  "git-github": "Git and GitHub",
  "git-github-beginner": "Git and GitHub Beginner",
  golang: "Go",
  graphql: "GraphQL",
  html: "HTML",
  "inference-engineering": "Inference Engineering",
  ios: "iOS",
  java: "Java",
  javascript: "JavaScript",
  kotlin: "Kotlin",
  kubernetes: "Kubernetes",
  laravel: "Laravel",
  leetcode: "LeetCode",
  linux: "Linux",
  "machine-learning": "Machine Learning",
  mlops: "MLOps",
  mongodb: "MongoDB",
  "network-engineer": "Network Engineer",
  nextjs: "Next.js",
  nodejs: "Node.js",
  openclaw: "OpenClaw",
  php: "PHP",
  "postgresql-dba": "PostgreSQL DBA",
  "power-bi": "Power BI",
  "product-design": "Product Design",
  "product-manager": "Product Manager",
  "prompt-engineering": "Prompt Engineering",
  python: "Python",
  "python-data-analysis": "Python Data Analysis",
  qa: "QA",
  r: "R",
  react: "React",
  "react-native": "React Native",
  redis: "Redis",
  "ruby-on-rails": "Ruby on Rails",
  rust: "Rust",
  sql: "SQL",
  "system-design": "System Design",
  tailwind: "Tailwind CSS",
  "technical-writer": "Technical Writer",
  terraform: "Terraform",
  typescript: "TypeScript",
  "ui-ux-design": "UI/UX Design",
  "vibe-coding": "Vibe Coding",
  "video-game": "Video Game",
  vue: "Vue",
};

/**
 * A deliberate progression, not an alphabetical list. Beginner paths come first,
 * advanced paths last, and within a level we keep the upstream readme order.
 */
const BEGINNER_ROADMAPS = new Set([
  "frontend-beginner",
  "backend-beginner",
  "devops-beginner",
  "git-github-beginner",
  "html",
  "css",
  "javascript",
  "typescript",
  "git-github",
  "python",
  "sql",
  "shell-bash",
]);

const ADVANCED_ROADMAPS = new Set([
  "software-architect",
  "software-design-architecture",
  "system-design",
  "cyber-security",
  "devsecops",
  "mlops",
  "inference-engineering",
  "ai-red-teaming",
  "ai-agents",
  "ai-product-builder",
  "kubernetes",
  "blockchain",
  "rust",
  "scala",
  "engineering-manager",
  "forward-deployed-engineer",
  "machine-learning",
  "data-engineer",
]);

function roadmapLevel(slug: string): "beginner" | "intermediate" | "advanced" {
  if (BEGINNER_ROADMAPS.has(slug)) return "beginner";
  if (ADVANCED_ROADMAPS.has(slug)) return "advanced";
  return "intermediate";
}

const RESOURCE_KIND: Record<string, string> = {
  official: "docs",
  article: "article",
  video: "video",
  course: "course",
  book: "book",
  feed: "article",
  roadmap: "roadmap",
  podcast: "podcast",
  tool: "tool",
};

function parseReadmeTitles(): Map<string, string> {
  const titles = new Map<string, string>();
  const source = readFileSync(resolve(repoRoot, "readme.md"), "utf8");
  const pattern = /\[([^\]]+)\]\(https:\/\/roadmap\.sh\/([a-z0-9-]+)[^)]*\)/gi;
  for (const match of source.matchAll(pattern)) {
    const label = match[1];
    const slug = match[2];
    if (!label || !slug) continue;
    if (!titles.has(slug)) {
      titles.set(
        slug,
        label
          .replace(/\s+Roadmap$/i, "")
          .replace(/\s+Beginner$/i, " Beginner")
          .trim(),
      );
    }
  }
  return titles;
}

function parseReadmeOrder(): Map<string, number> {
  const order = new Map<string, number>();
  const source = readFileSync(resolve(repoRoot, "readme.md"), "utf8");
  const pattern = /https:\/\/roadmap\.sh\/([a-z0-9-]+)/gi;
  let index = 0;
  for (const match of source.matchAll(pattern)) {
    const slug = match[1];
    if (!slug || ["best-practices", "questions", "get-started"].includes(slug)) continue;
    if (order.has(slug)) continue;
    order.set(slug, index);
    index += 1;
  }
  return order;
}

function providerFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

function normalizeText(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTopicMarkdown(raw: string, slug: string, sourceFile: string): ParsedTopic {
  const text = raw.replace(/\r\n/g, "\n");
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? titleCase(slug);

  const resources: ParsedResource[] = [];
  const resourcePattern = /^\s*[-*]\s+\[(?:@([a-z-]+)@)?([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gim;
  for (const match of text.matchAll(resourcePattern)) {
    const kind = match[1]?.toLowerCase() ?? "article";
    const url = match[3];
    if (!url) continue;
    resources.push({
      label: normalizeText(match[2] ?? url),
      url,
      kind: RESOURCE_KIND[kind] ?? "article",
      provider: providerFromUrl(url),
    });
  }

  const beforeResources = text.split(/Visit the following resources to learn more:/i)[0] ?? text;
  const summary = normalizeText(
    beforeResources
      .replace(/^#\s+.+$/m, "")
      .replace(/^#{2,6}\s+.+$/gm, " ")
      .slice(0, 1600),
  ).slice(0, 700);

  return {
    slug,
    title,
    summary: summary || `A focused topic in the ${title} path.`,
    resources,
    body: text.slice(0, 6000),
    sourceFile,
  };
}

function loadRoadmaps(): Map<string, RoadmapSource> {
  const readmeTitles = parseReadmeTitles();
  const sources = new Map<string, RoadmapSource>();
  for (const entry of readdirSync(roadmapsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const contentDir = resolve(roadmapsRoot, entry.name, "content");
    let files: string[] = [];
    try {
      files = readdirSync(contentDir).filter((file) => file.endsWith(".md"));
    } catch {
      continue;
    }
    const topics = new Map<string, ParsedTopic>();
    for (const file of files) {
      const at = file.indexOf("@");
      const slug = at === -1 ? file.replace(/\.md$/, "") : file.slice(0, at);
      if (!slug) continue;
      const parsed = parseTopicMarkdown(
        readFileSync(resolve(contentDir, file), "utf8"),
        slug,
        `roadmaps/${entry.name}/content/${file}`,
      );
      const previous = topics.get(slug);
      if (
        !previous ||
        parsed.resources.length > previous.resources.length ||
        parsed.summary.length > previous.summary.length
      ) {
        topics.set(slug, parsed);
      }
    }
    sources.set(entry.name, {
      slug: entry.name,
      title:
        readmeTitles.get(entry.name) ??
        ROADMAP_TITLE_OVERRIDES[entry.name] ??
        titleCase(entry.name),
      topics,
    });
  }
  return sources;
}

function defaultWhy(source: ParsedTopic, roadmapTitle: string): string {
  return (
    source.summary ||
    `${source.title} is part of the ${roadmapTitle} path and appears repeatedly in real work, interviews and production decisions.`
  );
}

function defaultConcepts(source: ParsedTopic): string[] {
  const _firstSentence = source.summary.split(/(?<=[.!?])\s+/)[0] ?? source.summary;
  return [
    `What ${source.title} is and which problem it solves`,
    `How it behaves in a real system: trade-offs, limits and failure modes`,
    `How to recognize it in code, architecture or an interview`,
  ].slice(0, 3);
}

function defaultPractice(source: ParsedTopic): string {
  return `Build or analyze a small artifact that uses ${source.title}. Write down the decisions you made, one trade-off and one thing you would measure before shipping it.`;
}

function defaultPitfalls(source: ParsedTopic): string[] {
  return [
    `Treating ${source.title} as a checklist item instead of understanding the trade-off behind it.`,
    `Memorizing terminology without being able to recognize the concept in a real codebase.`,
  ];
}

function buildContentMarkdown(
  _title: string,
  summary: string,
  why: string,
  concepts: string[],
  practice: string,
  pitfalls: string[],
  source: ParsedTopic,
): string {
  const lines = [`## Overview`, summary, ``, `## Why it matters`, why, ``, `## Key concepts`];
  for (const concept of concepts) lines.push(`- ${concept}`);
  lines.push(``, `## Practice`, practice, ``, `## Common pitfalls`);
  for (const pitfall of pitfalls) lines.push(`- ${pitfall}`);
  if (source.resources.length > 0) {
    lines.push(``, `## Source notes`);
    for (const resource of source.resources.slice(0, 8)) {
      lines.push(`- [${resource.label}](${resource.url})`);
    }
  }
  return lines.join("\n").slice(0, 8000);
}

interface SeedTopic {
  id: string;
  roadmapId: string;
  stageId: string;
  slug: string;
  title: string;
  summary: string;
  why: string;
  concepts: string[];
  practice: string;
  pitfalls: string[];
  contentMd: string;
  sourceUrl: string;
  minutes: number;
  difficulty: string;
  sortOrder: number;
  resources: ParsedResource[];
}

interface SeedStage {
  id: string;
  roadmapId: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  estimatedHours: number;
  topics: SeedTopic[];
}

interface SeedRoadmap {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: string;
  estimatedHours: number;
  icon: string;
  sortOrder: number;
  status: string;
  contentStatus: string;
  sourceTopicCount: number;
  stages: SeedStage[];
}

function createTopic(
  roadmap: RoadmapSource,
  stage: SeedStage,
  source: ParsedTopic,
  index: number,
  overrides: Partial<CurriculumTopic> = {},
): SeedTopic {
  const why = overrides.why ?? defaultWhy(source, roadmap.title);
  const concepts = overrides.concepts ?? defaultConcepts(source);
  const practice = overrides.practice ?? defaultPractice(source);
  const pitfalls = overrides.pitfalls ?? defaultPitfalls(source);
  const id = `${roadmap.slug}::${source.slug}`;
  return {
    id,
    roadmapId: roadmap.slug,
    stageId: stage.id,
    slug: source.slug,
    title: overrides.title ?? source.title,
    summary: source.summary,
    why,
    concepts,
    practice,
    pitfalls,
    contentMd: buildContentMarkdown(
      source.title,
      source.summary,
      why,
      concepts,
      practice,
      pitfalls,
      source,
    ),
    sourceUrl: `https://roadmap.sh/${roadmap.slug}`,
    minutes: overrides.minutes ?? 45,
    difficulty: overrides.difficulty ?? "core",
    sortOrder: index,
    resources: source.resources,
  };
}

function buildGuidedRoadmap(
  roadmap: RoadmapSource,
  curriculum: Curriculum,
  sortOrder: number,
): SeedRoadmap {
  const stages: SeedStage[] = [];
  const used = new Set<string>();

  for (const curriculumStage of curriculum.stages) {
    const stage: SeedStage = {
      id: `${roadmap.slug}::${curriculumStage.slug}`,
      roadmapId: roadmap.slug,
      slug: curriculumStage.slug,
      title: curriculumStage.title,
      description: curriculumStage.description,
      sortOrder: stages.length,
      estimatedHours: 0,
      topics: [],
    };
    for (const curriculumTopic of curriculumStage.topics) {
      const source =
        roadmap.topics.get(curriculumTopic.slug) ??
        parseTopicMarkdown("", curriculumTopic.slug, "");
      used.add(curriculumTopic.slug);
      stage.topics.push(createTopic(roadmap, stage, source, stage.topics.length, curriculumTopic));
    }
    stage.estimatedHours = Math.max(
      1,
      Math.round(stage.topics.reduce((total, item) => total + item.minutes, 0) / 60),
    );
    stages.push(stage);
  }

  const remaining = [...roadmap.topics.values()]
    .filter((source) => !used.has(source.slug))
    .sort((a, b) => a.title.localeCompare(b.title));
  if (remaining.length > 0) {
    const stage: SeedStage = {
      id: `${roadmap.slug}::extended-library`,
      roadmapId: roadmap.slug,
      slug: "extended-library",
      title: "Extended library",
      description:
        "Every additional topic in this roadmap's source content. Use it as a reference shelf after the guided stages.",
      sortOrder: stages.length,
      estimatedHours: 0,
      topics: [],
    };
    for (const source of remaining) {
      stage.topics.push(createTopic(roadmap, stage, source, stage.topics.length, { minutes: 30 }));
    }
    stage.estimatedHours = Math.max(1, Math.round((stage.topics.length * 30) / 60));
    stages.push(stage);
  }

  return {
    id: roadmap.slug,
    slug: roadmap.slug,
    title: curriculum.title,
    tagline: curriculum.tagline,
    description: curriculum.description,
    level: curriculum.level,
    estimatedHours: curriculum.estimatedHours,
    icon: curriculum.icon,
    sortOrder,
    status: "guided",
    contentStatus: "full",
    sourceTopicCount: roadmap.topics.size,
    stages,
  };
}

function buildReferenceRoadmap(roadmap: RoadmapSource, sortOrder: number): SeedRoadmap {
  const stage: SeedStage = {
    id: `${roadmap.slug}::library`,
    roadmapId: roadmap.slug,
    slug: "library",
    title: "Content library",
    description:
      "A reference shelf of every topic available for this roadmap. There is no curated ordering yet; use search and the coach to navigate it.",
    sortOrder: 0,
    estimatedHours: 0,
    topics: [],
  };
  const sources = [...roadmap.topics.values()].sort((a, b) => a.title.localeCompare(b.title));
  for (const source of sources) {
    stage.topics.push(createTopic(roadmap, stage, source, stage.topics.length, { minutes: 30 }));
  }
  stage.estimatedHours = Math.max(1, Math.round((stage.topics.length * 30) / 60));
  return {
    id: roadmap.slug,
    slug: roadmap.slug,
    title: roadmap.title,
    tagline: "Reference library from the community roadmap.",
    description: `The complete set of ${roadmap.title} topics available in this fork, kept as a searchable reference. A guided ordering will be added as the path is curated.`,
    level: roadmapLevel(roadmap.slug),
    estimatedHours: stage.estimatedHours,
    icon: "library",
    sortOrder,
    status: "reference",
    contentStatus: "full",
    sourceTopicCount: roadmap.topics.size,
    stages: [stage],
  };
}

function evenlySample<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const selected: T[] = [];
  const seen = new Set<number>();
  for (let index = 0; index < count; index += 1) {
    const position = Math.round((index * (items.length - 1)) / (count - 1));
    if (!seen.has(position)) {
      seen.add(position);
      const item = items[position];
      if (item) selected.push(item);
    }
  }
  return selected;
}

function buildCatalogRoadmap(roadmap: RoadmapSource, sortOrder: number): SeedRoadmap {
  const stage: SeedStage = {
    id: `${roadmap.slug}::preview`,
    roadmapId: roadmap.slug,
    slug: "preview",
    title: "Preview topics",
    description:
      "A representative sample of this roadmap's source content. Import the full path from Settings when you want to study it.",
    sortOrder: 0,
    estimatedHours: 0,
    topics: [],
  };
  const sources = [...roadmap.topics.values()].sort((a, b) => a.title.localeCompare(b.title));
  const sampled = evenlySample(sources, 16);
  for (const source of sampled) {
    stage.topics.push(createTopic(roadmap, stage, source, stage.topics.length, { minutes: 25 }));
  }
  stage.estimatedHours = Math.max(1, Math.round((stage.topics.length * 25) / 60));
  return {
    id: roadmap.slug,
    slug: roadmap.slug,
    title: roadmap.title,
    tagline: "Community roadmap, preview edition.",
    description: `A preview of the ${roadmap.title} roadmap from this fork. ${roadmap.topics.size} source topics are available; the full path can be imported later.`,
    level: roadmapLevel(roadmap.slug),
    estimatedHours: stage.estimatedHours,
    icon: "library",
    sortOrder,
    status: "catalog",
    contentStatus: "preview",
    sourceTopicCount: roadmap.topics.size,
    stages: [stage],
  };
}

function sql(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "0";
  return `'${value.replace(/'/g, "''")}'`;
}

function json(value: unknown): string {
  return sql(JSON.stringify(value));
}

function generateSeed(roadmaps: SeedRoadmap[]): string {
  const lines: string[] = [
    "-- Generated by apps/web/scripts/build-content.ts. Do not edit by hand.",
    "-- Content remains a personal-use copy of the roadmap.sh fork; keep the app private.",
    "PRAGMA foreign_keys = ON;",
  ];

  for (const roadmap of roadmaps) {
    lines.push(
      `INSERT INTO roadmaps (id, slug, title, tagline, description, level, estimated_hours, icon, sort_order, status, content_status, source_topic_count, source, created_at, updated_at) VALUES (${sql(roadmap.id)}, ${sql(roadmap.slug)}, ${sql(roadmap.title)}, ${sql(roadmap.tagline)}, ${sql(roadmap.description)}, ${sql(roadmap.level)}, ${roadmap.estimatedHours}, ${sql(roadmap.icon)}, ${roadmap.sortOrder}, ${sql(roadmap.status)}, ${sql(roadmap.contentStatus)}, ${roadmap.sourceTopicCount}, 'roadmap.sh personal fork', ${sql(new Date().toISOString())}, ${sql(new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, estimated_hours = excluded.estimated_hours, icon = excluded.icon, sort_order = excluded.sort_order, status = excluded.status, content_status = excluded.content_status, source_topic_count = excluded.source_topic_count, updated_at = excluded.updated_at;`,
    );

    for (const stage of roadmap.stages) {
      lines.push(
        `INSERT INTO roadmap_stages (id, roadmap_id, slug, title, description, sort_order, estimated_hours) VALUES (${sql(stage.id)}, ${sql(stage.roadmapId)}, ${sql(stage.slug)}, ${sql(stage.title)}, ${sql(stage.description)}, ${stage.sortOrder}, ${stage.estimatedHours}) ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description, sort_order = excluded.sort_order, estimated_hours = excluded.estimated_hours;`,
      );
    }

    let edgeIndex = 0;
    for (const stage of roadmap.stages) {
      for (const topic of stage.topics) {
        lines.push(
          `INSERT INTO topics (id, roadmap_id, stage_id, slug, title, summary, why_it_matters, key_concepts, practice, pitfalls, content_md, source_url, estimated_minutes, difficulty, sort_order, created_at, updated_at) VALUES (${sql(topic.id)}, ${sql(topic.roadmapId)}, ${sql(topic.stageId)}, ${sql(topic.slug)}, ${sql(topic.title)}, ${sql(topic.summary)}, ${sql(topic.why)}, ${json(topic.concepts)}, ${sql(topic.practice)}, ${json(topic.pitfalls)}, ${sql(topic.contentMd)}, ${sql(topic.sourceUrl)}, ${topic.minutes}, ${sql(topic.difficulty)}, ${topic.sortOrder}, ${sql(new Date().toISOString())}, ${sql(new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET stage_id = excluded.stage_id, title = excluded.title, summary = excluded.summary, why_it_matters = excluded.why_it_matters, key_concepts = excluded.key_concepts, practice = excluded.practice, pitfalls = excluded.pitfalls, content_md = excluded.content_md, estimated_minutes = excluded.estimated_minutes, difficulty = excluded.difficulty, sort_order = excluded.sort_order, updated_at = excluded.updated_at;`,
        );
        topic.resources.forEach((resource, index) => {
          lines.push(
            `INSERT INTO resources (id, roadmap_id, topic_id, title, url, kind, provider, description, estimated_minutes, is_free, sort_order, created_at) VALUES (${sql(`${topic.id}::r${index}`)}, ${sql(topic.roadmapId)}, ${sql(topic.id)}, ${sql(resource.label.slice(0, 300))}, ${sql(resource.url)}, ${sql(resource.kind)}, ${sql(resource.provider)}, NULL, NULL, 1, ${index}, ${sql(new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET title = excluded.title, url = excluded.url, kind = excluded.kind, provider = excluded.provider, sort_order = excluded.sort_order;`,
          );
        });

        if (roadmap.status !== "catalog") {
          const cardId = `${topic.id}::recall`;
          lines.push(
            `INSERT INTO flashcards (id, roadmap_id, topic_id, front, back, hint, explanation, tags, source, created_at, updated_at) VALUES (${sql(cardId)}, ${sql(topic.roadmapId)}, ${sql(topic.id)}, ${sql(`Explain ${topic.title} in your own words.`)}, ${sql(topic.summary)}, ${sql(topic.concepts[0] ?? null)}, ${sql(topic.why)}, ${json([roadmap.slug, topic.slug])}, 'seed', ${sql(new Date().toISOString())}, ${sql(new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET front = excluded.front, back = excluded.back, hint = excluded.hint, explanation = excluded.explanation, tags = excluded.tags, updated_at = excluded.updated_at;`,
          );
        }
      }

      for (let index = 1; index < stage.topics.length; index += 1) {
        const previous = stage.topics[index - 1];
        const current = stage.topics[index];
        if (!previous || !current) continue;
        lines.push(
          `INSERT INTO topic_edges (id, roadmap_id, from_topic_id, to_topic_id, kind) VALUES (${sql(`${roadmap.id}::edge::${stage.slug}::${edgeIndex}`)}, ${sql(roadmap.id)}, ${sql(previous.id)}, ${sql(current.id)}, 'next') ON CONFLICT(id) DO NOTHING;`,
        );
        edgeIndex += 1;
      }
    }
  }

  lines.push("INSERT INTO topics_fts(topics_fts) VALUES('rebuild');");
  lines.push("INSERT INTO resources_fts(resources_fts) VALUES('rebuild');");
  return `${lines.join("\n")}\n`;
}

function main(): void {
  const sources = loadRoadmaps();
  const readmeOrder = parseReadmeOrder();
  const curriculaBySlug = new Map(curricula.map((curriculum) => [curriculum.slug, curriculum]));
  const roadmaps: SeedRoadmap[] = [];
  const orderOf = (slug: string): number => readmeOrder.get(slug) ?? 1000;

  for (const curriculum of curricula) {
    const source = sources.get(curriculum.slug);
    if (!source) {
      console.warn(`No content folder for guided roadmap ${curriculum.slug}`);
      continue;
    }
    roadmaps.push(buildGuidedRoadmap(source, curriculum, orderOf(curriculum.slug)));
  }

  for (const slug of ["devops", "full-stack"]) {
    const source = sources.get(slug);
    if (source) {
      roadmaps.push(buildReferenceRoadmap(source, orderOf(slug)));
    }
  }

  const guidedSlugs = new Set(roadmaps.map((roadmap) => roadmap.slug));
  const catalog = [...sources.values()]
    .filter((source) => !guidedSlugs.has(source.slug) && !curriculaBySlug.has(source.slug))
    .sort((a, b) => orderOf(a.slug) - orderOf(b.slug) || a.title.localeCompare(b.title));
  for (const source of catalog) {
    roadmaps.push(buildCatalogRoadmap(source, orderOf(source.slug)));
  }

  const seed = generateSeed(roadmaps);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(resolve(outputDir, "seed.sql"), seed, "utf8");
  const roadmapSeed = seed
    .split("\n")
    .filter((line) => line.startsWith("INSERT INTO roadmaps "))
    .join("\n");
  writeFileSync(resolve(outputDir, "roadmaps.sql"), `${roadmapSeed}\n`, "utf8");

  const topicCount = roadmaps.reduce(
    (total, roadmap) =>
      total + roadmap.stages.reduce((stageTotal, stage) => stageTotal + stage.topics.length, 0),
    0,
  );
  const resourceCount = roadmaps.reduce(
    (total, roadmap) =>
      total +
      roadmap.stages.reduce(
        (stageTotal, stage) =>
          stageTotal +
          stage.topics.reduce((topicTotal, topic) => topicTotal + topic.resources.length, 0),
        0,
      ),
    0,
  );
  const manifest = {
    generatedAt: new Date().toISOString(),
    roadmaps: roadmaps.length,
    guided: roadmaps.filter((roadmap) => roadmap.status === "guided").length,
    reference: roadmaps.filter((roadmap) => roadmap.status === "reference").length,
    catalog: roadmaps.filter((roadmap) => roadmap.status === "catalog").length,
    topics: topicCount,
    resources: resourceCount,
    bytes: Buffer.byteLength(seed, "utf8"),
  };
  writeFileSync(
    resolve(outputDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(manifest, null, 2));
}

main();
