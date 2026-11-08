/**
 * End-to-end checks against the production build (run `pnpm build` first;
 * CI does). Boots the real SSR server on its own ports, talking to the live
 * store with the credentials in .env (locally) or the CI secrets.
 */
import { defineConfig, devices } from '@playwright/test';

const port = 3912;

// Locally the credentials live in .env; load them here so the spec can tell whether a store is reachable.
if (!process.env['SHOPIFY_STORE_DOMAIN']) {
  try {
    process.loadEnvFile(new URL('./.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  } catch {
    // no .env: the spec skips itself
  }
}

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node --env-file-if-exists=.env server/index.ts',
    url: `http://127.0.0.1:${port}/healthz`,
    env: { NODE_ENV: 'production', PORT: String(port), METRICS_PORT: '9912', METRICS_BIND: '127.0.0.1' },
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
