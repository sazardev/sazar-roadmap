import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(root, "app"),
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["app/features/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.server.ts"],
    },
  },
});
