import type { Curriculum } from "../types";
import { aiEngineer } from "./ai-engineer";
import { backend } from "./backend";
import { cloudflare } from "./cloudflare";
import { frontend } from "./frontend";

export const curricula: Curriculum[] = [frontend, backend, aiEngineer, cloudflare];

export const curriculaBySlug = new Map(curricula.map((item) => [item.slug, item]));
