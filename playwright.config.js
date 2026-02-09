// @ts-check
import { defineConfig, devices } from "@playwright/test";

function getBasePath() {
  if (process.env.E2E_BASE_URL) {
    return new URL(process.env.E2E_BASE_URL).pathname;
  }
  return ""; // Empty path for local development
}

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5500",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",

    // Enhanced context options for CI
    launchOptions: {
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ],
    },

    contextOptions: {
      permissions: ["clipboard-read", "clipboard-write"],
      bypassCSP: true,
      ignoreHTTPSErrors: true,
      // Add this to handle strict CSP environments
      strictSelectors: false,
    },

    // Add these for additional stability
    acceptDownloads: true,
    javaScriptEnabled: true,
    hasTouch: false,
    isMobile: false,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Override viewport for consistent testing
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Add global timeout
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
