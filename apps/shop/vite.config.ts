import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ babel: { plugins: ['relay'] } })],
  build: { sourcemap: true },
  ssr: { noExternal: ['@portfolio/ui'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['../../vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
