import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 180_000,
  workers: 1,
  use: {
    baseURL: process.env.E2E_PREVIEW ? 'http://127.0.0.1:4173/Geekcode/' : 'http://127.0.0.1:4173/',
    headless: true,
    actionTimeout: 15000,
    trace: 'retain-on-failure',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  webServer: {
    command: process.env.E2E_PREVIEW
      ? 'npm run preview -- --base /Geekcode/ --port 4173 --strictPort'
      : 'npm run dev -- --port 4173 --strictPort',
    url: process.env.E2E_PREVIEW ? 'http://127.0.0.1:4173/Geekcode/' : 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
  },
});
