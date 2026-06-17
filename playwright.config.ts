import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// ローカル環境なら、 .env.localを読み込む
!process.env.CI &&
  dotenv.config({ path: path.resolve(__dirname, ".env.local") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    /* Next.js の URL */
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  /* Chrome のみテスト */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* GraphQL モックと Next.js（Production）を起動。事前にビルド済みである前提。 */
  webServer: [
    {
      // GitHub GraphQL API のモック（port 4000）。GET '/' が GraphiQL(200) を返すので疎通確認に使える。
      command: "pnpm run mock",
      url: "http://localhost:4000",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm run start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      // API の通信先は process.env.GITHUB_API_ENDPOINT で指定する
    },
  ],
});
