import { defineConfig, devices } from "@playwright/test";

/**
 * Cortex E2E: journeys against the Vite dev server (UI + validation).
 * API-backed submissions resolve gracefully without the full stack;
 * chromium-only keeps CI fast.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --port 5173",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
