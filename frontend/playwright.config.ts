import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end harness: drives the real app in a real browser.
 *
 * What it covers and what it deliberately leaves to the unit suite is stated in
 * `.claude/skills/run-the-app/SKILL.md`; `e2e/routing.spec.ts` is the whole
 * suite.
 *
 * There is no CI in this repo yet, so there is no CI branch in here either —
 * when one arrives it will want its own retries, reporter and a
 * `reuseExistingServer: false`.
 */
const PORT = 4200;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: `npm start -- --port ${PORT}`,
    url: BASE_URL,
    // A dev server already on this port is reused rather than fought over, so
    // running the suite alongside `npm start` works and is faster.
    reuseExistingServer: true,
    // A cold Angular dev-server build is slow the first time; the default 60s
    // is not enough on a cold `.angular/cache`.
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
