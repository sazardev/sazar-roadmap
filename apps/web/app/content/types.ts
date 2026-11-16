export type TopicDifficulty = "foundation" | "core" | "advanced";

export interface CurriculumTopic {
  slug: string;
  title?: string;
  summary?: string;
  difficulty?: TopicDifficulty;
  minutes?: number;
  why?: string;
  concepts?: string[];
  practice?: string;
  pitfalls?: string[];
  resources?: Array<{ title: string; url: string; kind?: string }>;
}

export interface CurriculumStage {
  slug: string;
  title: string;
  description: string;
  topics: CurriculumTopic[];
}

export interface Curriculum {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
  estimatedHours: number;
  stages: CurriculumStage[];
}

export const topic = (
  slug: string,
  why: string,
  concepts: string[],
  practice: string,
  options: Partial<
    Pick<CurriculumTopic, "title" | "summary" | "difficulty" | "minutes" | "pitfalls" | "resources">
  > = {},
): CurriculumTopic => ({ slug, why, concepts, practice, ...options });
