import type { Curriculum } from "../types";
import { aiEngineer } from "./ai-engineer";
import { android } from "./android";
import { csharpDotnet } from "./aspnet-core";
import { backend } from "./backend";
import { cLanguage } from "./c";
import { cloudflare } from "./cloudflare";
import { flutter } from "./flutter";
import { frontend } from "./frontend";
import { golang } from "./golang";
import { ios } from "./ios";
import { networkEngineer } from "./network-engineer";
import { softwareArchitecture } from "./software-design-architecture";
import { systemDesign } from "./system-design";

export const curricula: Curriculum[] = [
  frontend,
  backend,
  golang,
  aiEngineer,
  cloudflare,
  flutter,
  android,
  ios,
  cLanguage,
  csharpDotnet,
  networkEngineer,
  softwareArchitecture,
  systemDesign,
];

export const curriculaBySlug = new Map(curricula.map((item) => [item.slug, item]));
