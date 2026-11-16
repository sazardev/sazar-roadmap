import { z } from "zod";

export interface PracticeResource {
  title: string;
  url: string;
  kind: string;
}

export interface PracticeTopic {
  id: string;
  title: string;
  summary: string;
  why: string;
  concepts: string[];
  practice: string;
  pitfalls: string[];
  roadmapTitle: string;
  stageTitle: string;
  resources?: PracticeResource[];
}

export interface PracticeReview {
  verdict: "pass" | "revise";
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  nextStep: string;
  model: string;
}

export type PracticeReviewResult =
  | { ok: true; review: PracticeReview }
  | { ok: false; error: string };

/** A clear answer that shows the core idea is enough to move on. */
export const PASS_SCORE = 65;

export function verdictForScore(score: number): "pass" | "revise" {
  return score >= PASS_SCORE ? "pass" : "revise";
}

const reviewSchema = z.object({
  verdict: z.enum(["pass", "revise"]),
  score: z.coerce.number().min(0).max(100),
  feedback: z.string().min(1).max(2000),
  strengths: z.array(z.string().max(300)).max(5).default([]),
  gaps: z.array(z.string().max(300)).max(5).default([]),
  next_step: z.string().max(500).default(""),
});

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

function studyReferences(topic: PracticeTopic): string {
  const resources = topic.resources ?? [];
  if (resources.length === 0) return "not recorded";
  return resources
    .slice(0, 5)
    .map((resource) => `${resource.title} (${resource.kind}) — ${resource.url}`)
    .join("\n");
}

function systemPrompt(topic: PracticeTopic): string {
  return [
    "You are a fair, encouraging technical coach reviewing practice for a personal learning system.",
    "Your job is to decide whether the learner showed enough understanding to move on, and to help them improve.",
    "The learner is studying, not defending a thesis. A response does not need to be perfect, exhaustive or polished.",
    "",
    "PASS (score 65-100) when:",
    "- It answers the main question in the learner's own words, even if it is brief.",
    "- It shows the core idea correctly; some details may be missing.",
    "- It includes a concrete example, artifact, decision or code sketch when the task asks for application.",
    "- It names at least one relevant trade-off, limitation or pitfall when the topic calls for it.",
    "Do not require every key concept: one or two correctly explained concepts are enough to pass.",
    "A missing trade-off or example lowers the score, but it should not fail an otherwise correct explanation.",
    "Minor omissions, grammar or spelling do not block a pass.",
    "",
    "REVISE (score 0-64) only when:",
    "- The response is off-topic, copied, or only restates a definition without showing understanding.",
    "- It misses the central concept of the topic.",
    "- It ignores an artifact the task explicitly asks for, such as code or a design decision.",
    "- It is too vague to tell whether the learner understands.",
    "",
    "Scoring calibration:",
    "- 85-100: clear, accurate, specific, with a good example or trade-off.",
    "- 70-84: correct core idea with one or two minor gaps.",
    "- 65-69: enough understanding to continue; note the gaps for later review.",
    "- 45-64: partial understanding; one focused revision should fix it.",
    "- 0-44: off-topic, copied, or no real explanation.",
    "",
    "Feedback rules:",
    "- Write 2-4 sentences directly to the learner.",
    "- Start with what is right, then give the single most useful improvement.",
    "- Be specific and kind. Never scold or say the learner failed.",
    "- If it passes, say so clearly and name one thing to keep doing.",
    "- If it needs revision, give one concrete action and point to a section or study reference below.",
    "- Match the learner's language (English or Spanish). Keep JSON keys in English.",
    "- Do not invent resources or URLs. You may mention the references listed below by title.",
    "- gaps: at most 3, concrete and actionable.",
    "- next_step: one short action, ideally naming a concept or study reference to review.",
    "",
    "Return JSON only, with no markdown fences and no extra text:",
    '{"verdict":"pass" or "revise","score":0-100,"feedback":"2-4 sentences addressed to the learner","strengths":["..."],"gaps":["..."],"next_step":"one concrete action"}',
    "",
    "Topic context:",
    `Title: ${topic.title}`,
    `Roadmap: ${topic.roadmapTitle} / ${topic.stageTitle}`,
    `Summary: ${topic.summary}`,
    `Why it matters: ${topic.why}`,
    `Key concepts: ${topic.concepts.join("; ") || "not recorded"}`,
    `Practice task: ${topic.practice}`,
    `Pitfalls: ${topic.pitfalls.join("; ") || "not recorded"}`,
    `Study references:\n${studyReferences(topic)}`,
  ].join("\n");
}

async function runModel(
  env: Env,
  model: string,
  messages: Array<{ role: "system" | "user"; content: string }>,
): Promise<string | null> {
  if (!env.AI) return null;
  const run = env.AI.run.bind(env.AI) as (model: string, inputs: unknown) => Promise<unknown>;
  const output = await Promise.race([
    run(model, {
      messages,
      max_tokens: 900,
      temperature: 0.2,
    }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI review timeout")), 30_000);
    }),
  ]);
  const record = output as {
    response?: unknown;
    result?: { response?: unknown };
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content =
    typeof record.response === "string"
      ? record.response
      : typeof record.result?.response === "string"
        ? record.result.response
        : typeof record.choices?.[0]?.message?.content === "string"
          ? record.choices[0].message.content
          : null;
  return content?.trim() || null;
}

export async function evaluatePractice(
  env: Env,
  topic: PracticeTopic,
  response: string,
  model: string,
): Promise<PracticeReviewResult> {
  const cleanResponse = response.trim().slice(0, 8000);
  if (cleanResponse.length < 40) {
    return {
      ok: false,
      error: "Add a little more detail so the reviewer can see your reasoning.",
    };
  }

  let content: string | null = null;
  try {
    content = await runModel(env, model, [
      { role: "system", content: systemPrompt(topic) },
      {
        role: "user",
        content: `Practice task:\n${topic.practice}\n\nLearner response:\n${cleanResponse}\n\nReview the response. Return JSON only.`,
      },
    ]);
  } catch {
    return {
      ok: false,
      error: "The reviewer could not respond. Nothing was lost; try again in a moment.",
    };
  }

  if (!content) {
    return {
      ok: false,
      error: "The reviewer returned no result. Nothing was lost; try again in a moment.",
    };
  }

  const parsed = reviewSchema.safeParse(extractJson(content));
  if (!parsed.success) {
    return {
      ok: false,
      error: "The reviewer returned an invalid result. Nothing was lost; try again in a moment.",
    };
  }

  const data = parsed.data;
  const score = Math.round(data.score);
  const verdict = verdictForScore(score);
  return {
    ok: true,
    review: {
      verdict,
      score,
      feedback: data.feedback,
      strengths: data.strengths,
      gaps: data.gaps,
      nextStep: data.next_step || "Review the key concepts and try one more pass.",
      model,
    },
  };
}
