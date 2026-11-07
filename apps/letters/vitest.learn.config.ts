/**
 * Runs the course exercises in src/learn (docs/learn/README.md). They are kept
 * out of `pnpm test` and CI on purpose: an exercise is meant to fail until you
 * have done it.
 *
 *   pnpm learn        every exercise
 *   pnpm learn 03     one lesson, by file-name prefix
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import base from './vite.config.ts';

export default defineConfig({
  ...base,
  resolve: {
    ...base.resolve,
    // The exercises execute the schema in-process. `graphql` ships CommonJS
    // (`main`) and ESM (`module`) builds; Node loads the first (so Pothos does
    // too) while Vite would pick the second, and graphql-js refuses to mix the
    // two ("Cannot use GraphQLSchema from another module or realm"). Pin Vite
    // to the file Node uses. Lesson 4 says more about dual packages.
    alias: [{ find: /^graphql$/, replacement: fileURLToPath(new URL('./node_modules/graphql/index.js', import.meta.url)) }],
  },
  test: {
    ...base.test,
    include: ['src/learn/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
