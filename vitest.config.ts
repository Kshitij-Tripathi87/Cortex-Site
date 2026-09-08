import { defineConfig } from "vitest/config";

/* Repo-root test config. The app (vite.config.ts) is rooted at client/ for
 * builds, but unit tests live at the repo root so they can cover shared/. */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
