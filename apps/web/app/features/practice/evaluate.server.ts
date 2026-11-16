import { z } from "zod";

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

function systemPrompt(topic: PracticeTopic): string {
  return [
    "You are a strict but fair technical reviewer for a personal learning system.",
    "The learner must demonstrate understanding through a practice response, not merely recognize the topic.",
    "Evaluate only the learner response against the task and rubric below.",
    "",
    "PASS only when all of these are true:",
    "- It directly answers the practice task, not a different question.",
    "- It explains the idea in the learner's own words and shows understanding, not copied definitions.",
    "- It includes a concrete example, artifact, decision or code sketch where the task asks for one.",
    "- It names at least one trade-off, limitation or pitfall relevant to the topic.",
    "- It is specific enough that another engineer could inspect or act on it.",
    "",
    "REVISE when it is vague, superficial, generic, copied, missing the requested artifact, or does not engage with the key concepts.",
    "A short answer can pass if it is precise and complete; length alone is not a criterion.",
    "Do not pass a response just because it sounds confident.",
    "Be encouraging but do not inflate the score.",
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
    return { ok: false, error: "Write a more complete response before submitting." };
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
      error: "The AI reviewer could not respond. Your work was not marked complete. Try again.",
    };
  }

  if (!content) {
    return {
      ok: false,
      error: "The AI reviewer returned no result. Your work was not marked complete. Try again.",
    };
  }

  const parsed = reviewSchema.safeParse(extractJson(content));
  if (!parsed.success) {
    return {
      ok: false,
      error:
        "The AI reviewer returned an invalid result. Your work was not marked complete. Try again.",
    };
  }

  const data = parsed.data;
  const verdict = data.verdict === "pass" && data.score >= 75 ? "pass" : "revise";
  return {
    ok: true,
    review: {
      verdict,
      score: Math.round(data.score),
      feedback: data.feedback,
      strengths: data.strengths,
      gaps: data.gaps,
      nextStep: data.next_step,
      model,
    },
  };
}
