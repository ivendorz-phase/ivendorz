import { defineConfig, devices } from "@playwright/test";

// Playwright config — E2E + a11y (Doc-8B D1: Playwright + @axe-core/playwright; Playwright
// snapshots for visual). Spine-only smoke at Wave 0; real surface E2E lands with Doc-7 waves.
//
// SMOKE_BASE_URL points this at a live deployment (production.yml's post-deploy smoke test)
// instead of a locally built+served app; when unset (local dev, ci.yml) behavior is unchanged.
const smokeBaseURL = process.env.SMOKE_BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: smokeBaseURL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  // Build + serve the app for E2E. `reuseExistingServer` keeps local runs fast. Skipped when
  // SMOKE_BASE_URL is set — there's already a live server to test against.
  webServer: smokeBaseURL
    ? undefined
    : {
        command: "npm run build && npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
