import { defineConfig, devices } from '@playwright/test';

// The port the application will be served on.
// Must match the frontend dev server or production app port
const PORT = 4205;

export default defineConfig({
  // Directory where the tests are located.
  testDir: './e2e',

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Timeout per test (Phase 2 tests with complex interactions need more time)
  timeout: 30000,

  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: `http://localhost:${PORT}`,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',

    // Increased viewport to see all panels
    viewport: { width: 1920, height: 1080 },
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // IMPORTANT: In Docker, the app is already built and available at http://localhost:4205
  // The test assumes the dev server OR production server is already running
  // Inside the Dockerfile.e2e container, run the dev server before tests:
  //   npm start -- --host 0.0.0.0 --port 4205 &
  // OR use webServer below only if running outside Docker

  // Conditionally use webServer only when NOT in Docker container
  ...(process.env['IN_DOCKER'] ? {} : {
    webServer: {
      // Command to execute. Runs the production build from dist/frontend
      command: `npx http-server ./dist/frontend -p ${PORT} --silent`,
      // URL to wait for before starting tests.
      url: `http://localhost:${PORT}`,
      // Reuse the server if it's already running.
      reuseExistingServer: !process.env['CI'],
    },
  }),
});
