# AGENTS.md

## Commands

- Check everything: `pnpm check` (done means this passes)
- Run one test: `pnpm vitest run path/to/file.test.ts`
- Dev server: `pnpm --filter @portfolio/shop dev` (also `@portfolio/letters`, `@portfolio/site`)
- Smoke test after a build: `pnpm smoke`
- End-to-end tests after a build: `pnpm -r --if-present e2e`

## Conventions that differ from the defaults

- pnpm 12, not npm. Packages that run install scripts must be listed under `allowBuilds` in `pnpm-workspace.yaml`.
- TypeScript stays on 6.x until typescript-eslint supports 7.
- Lint runs Biome and ESLint. Biome checks only files changed since `main` (`lint_scope=changed` in `scripts/check.sh`) until the existing errors are fixed.

## Pitfalls

- The shop's smoke and e2e tests need `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN`. See `apps/shop/.env.example`.
- `pnpm learn` in `apps/letters` runs course exercises that fail until done. They are kept out of `pnpm check` on purpose.

## Do not touch

- `src/__generated__/` in each app is written by `relay-compiler`. It is committed because CI typechecks before it builds.
