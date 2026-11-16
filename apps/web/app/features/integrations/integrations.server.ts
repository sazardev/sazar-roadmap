type ServiceName = "NOTES" | "TASKS" | "LEARN" | "NEWS" | "ENGLISH";

type ServiceUrlKey = "NOTES_URL" | "TASKS_URL" | "LEARN_URL" | "NEWS_URL" | "ENGLISH_URL";

const SERVICE_URLS: Record<ServiceName, ServiceUrlKey> = {
  NOTES: "NOTES_URL",
  TASKS: "TASKS_URL",
  LEARN: "LEARN_URL",
  NEWS: "NEWS_URL",
  ENGLISH: "ENGLISH_URL",
};

export interface ReadingItem {
  id: string;
  title: string;
  source: string;
  progress: number;
  updated_at: string;
  url: string;
}

export interface TaskCard {
  id: string;
  title: string;
  status: string;
  due_at: string | null;
  priority: string | null;
  important: number;
  project: string | null;
  github_url: string | null;
  url: string;
}

export interface NewsCard {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  link: string;
  published_at: string;
}

export interface EnglishToday {
  day: number;
  week: number;
  focus: string;
  streak: number;
  due: number;
  new_remaining: number;
  reviews: number;
  goal: number;
  lesson: string;
  checklist: string[];
  url: string;
}

export interface IntegrationStatus {
  notes: boolean;
  tasks: boolean;
  learn: boolean;
  news: boolean;
  english: boolean;
}

export function integrationStatus(env: Env): IntegrationStatus {
  const key = env.INTEGRATION_KEY;
  const has = (name: ServiceName): boolean => {
    if (!key) return false;
    const binding = (env as unknown as Record<string, unknown>)[name];
    if (binding && typeof (binding as Fetcher).fetch === "function") return true;
    const url = env[SERVICE_URLS[name]];
    return typeof url === "string" && url.length > 0;
  };
  return {
    notes: has("NOTES"),
    tasks: has("TASKS"),
    learn: has("LEARN"),
    news: has("NEWS"),
    english: has("ENGLISH"),
  };
}

async function callInternal(
  env: Env,
  name: ServiceName,
  path: string,
  init: RequestInit = {},
): Promise<Response | null> {
  const key = env.INTEGRATION_KEY;
  if (!key) return null;
  const headers = new Headers(init.headers);
  headers.set("x-integration-key", key);
  headers.set("accept", "application/json");

  const binding = (env as unknown as Record<string, unknown>)[name];
  if (binding && typeof (binding as Fetcher).fetch === "function") {
    try {
      return await (binding as Fetcher).fetch(
        new Request(`https://${name.toLowerCase()}.internal${path}`, {
          ...init,
          headers,
          signal: AbortSignal.timeout(3000),
        }),
      );
    } catch {
      return null;
    }
  }

  const base = env[SERVICE_URLS[name]];
  if (typeof base !== "string" || base.length === 0) return null;
  try {
    return await fetch(new URL(path, base), {
      ...init,
      headers,
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    return null;
  }
}

async function readJson<T>(response: Response | null): Promise<T | null> {
  if (!response?.ok) return null;
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getReading(env: Env): Promise<ReadingItem[]> {
  const data = await readJson<{ items?: ReadingItem[] }>(
    await callInternal(env, "LEARN", "/internal/reading"),
  );
  return Array.isArray(data?.items) ? data.items.slice(0, 6) : [];
}

export async function getTasksToday(env: Env): Promise<{
  overdue: number;
  today: number;
  important: number;
  tasks: TaskCard[];
} | null> {
  return readJson<{ overdue: number; today: number; important: number; tasks: TaskCard[] }>(
    await callInternal(env, "TASKS", "/internal/today"),
  );
}

export async function getTopNews(env: Env, limit = 3): Promise<NewsCard[]> {
  const data = await readJson<{ items?: NewsCard[] }>(
    await callInternal(env, "NEWS", `/internal/top?limit=${limit}`),
  );
  return Array.isArray(data?.items) ? data.items.slice(0, limit) : [];
}

export async function getEnglishToday(env: Env): Promise<EnglishToday | null> {
  return readJson<EnglishToday>(await callInternal(env, "ENGLISH", "/internal/today"));
}

export async function createNote(
  env: Env,
  input: { title: string; body_md: string; tags?: string[]; source_url?: string },
): Promise<{ ok: true; note: { id: string; url: string } } | { ok: false; error: string }> {
  const response = await callInternal(env, "NOTES", "/internal/notes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readJson<{ note?: { id: string; url: string } }>(response);
  if (data?.note) return { ok: true, note: data.note };
  return { ok: false, error: "Notes is unavailable. The note was saved inside Roadmap instead." };
}

export async function createTask(
  env: Env,
  input: { title: string; due_at?: string; notes?: string; source_url?: string },
): Promise<{ ok: true; task: { id: string; url: string } } | { ok: false; error: string }> {
  const response = await callInternal(env, "TASKS", "/internal/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readJson<{ task?: { id: string; url: string } }>(response);
  if (data?.task) return { ok: true, task: data.task };
  return { ok: false, error: "Tasks is unavailable. The task was not created." };
}
