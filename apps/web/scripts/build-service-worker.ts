import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(here, "../build/client");
const assetsDir = resolve(clientDir, "assets");
const templatePath = resolve(here, "sw-template.js");
const outputPath = resolve(clientDir, "sw.js");

if (!existsSync(assetsDir)) {
  console.error("Missing build/client/assets. Run the client build first.");
  process.exit(1);
}

function walk(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

const publicFiles = [
  "/offline",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

const assetFiles = walk(assetsDir).map((file) => `/assets/${relative(assetsDir, file)}`);
const available = [...new Set([...publicFiles, ...assetFiles])]
  .filter((url) => {
    if (!url.startsWith("/") || url.startsWith("//")) return false;
    const file = resolve(clientDir, url === "/offline" ? "offline.html" : url.slice(1));
    return existsSync(file) && statSync(file).isFile();
  })
  .sort();

const fingerprint = available
  .map((url) => {
    const file = resolve(clientDir, url === "/offline" ? "offline.html" : url.slice(1));
    const stats = statSync(file);
    return `${url}:${stats.size}:${stats.mtimeMs}`;
  })
  .join("\n");
const version = createHash("sha256").update(fingerprint).digest("hex").slice(0, 12);
const template = readFileSync(templatePath, "utf8");
const output = template
  .replace("__SW_VERSION__", JSON.stringify(version))
  .replace("__PRECACHE_URLS__", JSON.stringify(available));

writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${outputPath} (${available.length} precached URLs, version ${version})`);
