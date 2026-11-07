import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { relay } from '@portfolio/ssr/vite';

export default defineConfig({
  plugins: [relay({ artifactDirectory: fileURLToPath(new URL('./src/__generated__', import.meta.url)) }), react()],
  build: { sourcemap: true },
  ssr: { noExternal: ['@portfolio/ui'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['../../vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts', 'scripts/**/*.test.ts'],
    // Course exercises (docs/learn) run through vitest.learn.config.ts, never here.
    exclude: ['**/node_modules/**', '**/dist/**', 'src/learn/**'],
  },
});
