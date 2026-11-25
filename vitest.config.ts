// TS-3: write coverage as lcov so CI can check coverage on changed lines.
// There is deliberately no global coverage threshold.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Monorepo: list the package folders, so one run covers every package
    // and writes one coverage report. Each package keeps its own vite config.
    projects: ['apps/*', 'packages/*', 'tools/*'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
    },
  },
});
