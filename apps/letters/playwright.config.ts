/**
 * End-to-end checks against the production build (run `pnpm build` first;
 * CI does). Each run boots the real SSR server on its own ports so it can
 * sit beside a dev server.
 */
import { defineConfig, devices } from '@playwright/test';

const port = 3911;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node server/index.ts',
    url: `http://127.0.0.1:${port}/healthz`,
    env: { NODE_ENV: 'production', PORT: String(port), METRICS_PORT: '9911', METRICS_BIND: '127.0.0.1' },
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
