import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";
import * as schema from "~/db/schema";

export type Database = DrizzleD1Database<typeof schema>;

/** One Drizzle client per request. Workers isolate reuse is handled by the runtime. */
export function getDb(context: AppLoadContext): Database {
  return drizzle(context.cloudflare.env.DB, { schema });
}

export function getEnv(context: AppLoadContext): Env {
  return context.cloudflare.env;
}
