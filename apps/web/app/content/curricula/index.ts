import type { Curriculum } from "../types";
import { aiEngineer } from "./ai-engineer";
import { backend } from "./backend";
import { cloudflare } from "./cloudflare";
import { frontend } from "./frontend";
import { golang } from "./golang";

export const curricula: Curriculum[] = [frontend, backend, golang, aiEngineer, cloudflare];

export const curriculaBySlug = new Map(curricula.map((item) => [item.slug, item]));
