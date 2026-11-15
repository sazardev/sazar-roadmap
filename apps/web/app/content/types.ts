export type TopicDifficulty = "foundation" | "core" | "advanced";

export interface CurriculumTopic {
  slug: string;
  title?: string;
  difficulty?: TopicDifficulty;
  minutes?: number;
  why?: string;
  concepts?: string[];
  practice?: string;
  pitfalls?: string[];
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
  options: Partial<Pick<CurriculumTopic, "title" | "difficulty" | "minutes" | "pitfalls">> = {},
): CurriculumTopic => ({ slug, why, concepts, practice, ...options });
