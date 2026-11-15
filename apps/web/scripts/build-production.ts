import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface WranglerConfig {
  [key: string]: unknown;
  main?: string;
  assets?: { directory?: string };
  configPath?: string;
  userConfigPath?: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "..");
const buildConfigPath = resolve(appRoot, "build/server/wrangler.json");
const productionConfigPath = resolve(appRoot, "wrangler.prod.jsonc");
const outputPath = resolve(appRoot, "build/server/wrangler.prod.json");

const build = JSON.parse(readFileSync(buildConfigPath, "utf8")) as WranglerConfig;
const production = JSON.parse(readFileSync(productionConfigPath, "utf8")) as WranglerConfig;

const output: WranglerConfig = {
  ...build,
  ...production,
  main: "index.js",
  no_bundle: true,
};
if (build.assets) output.assets = build.assets;
// The generated config records where it came from; those paths are meaningless after deployment.
delete output.configPath;
delete output.userConfigPath;

// The Vite plugin copies .dev.vars into the server output. It is a local-only file and must
// never travel with a production artifact.
for (const file of readdirSync(resolve(appRoot, "build/server"))) {
  if (file.startsWith(".dev.vars")) {
    rmSync(resolve(appRoot, "build/server", file), { force: true });
  }
}

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
