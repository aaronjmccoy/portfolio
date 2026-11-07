# Status

Plan of record: `C:\Users\Aaron\.claude\plans\i-moved-to-caes-lovely-hanrahan.md` (portfolio-first application for GN R30471).

## Done
- 2026-11-06: Monorepo scaffolded (pnpm 12, Node 24, TypeScript 6, Vite 8, Vitest 5, ESLint 10, Relay 21). pnpm 12 needs `allowBuilds` in `pnpm-workspace.yaml`, not `onlyBuiltDependencies`. TypeScript 7 is out but typescript-eslint does not support it yet; pinned to 6.0.3.
- 2026-11-06: `packages/ui` started: semantic tokens ported from mallerart, `VisuallyHidden`, `SkipLink`, tests.
- 2026-11-06: `packages/ssr`: shared streaming SSR server (Hono + Vite middleware in dev, prebuilt entry in prod) and Prometheus metrics on a separate loopback listener.
- 2026-11-06: `apps/shop`: SSR skeleton builds; Storefront API schema generated from `@shopify/hydrogen-react` (no store needed), relay-compiler configured.
- 2026-11-06: `apps/letters`: filename parser and archive index with tests (built from the real 1,839-name listing in `data/listing.txt`), Pothos GraphQL schema (Relay-spec), Yoga mounted at `/graphql`, SSR skeleton builds.
- 2026-11-06: `apps/portfolio`: Vite build + SSR prerender into `dist/index.html`.
- 2026-11-06: `tools/catalog`: CLI skeleton with argument parsing and tests.
- 2026-11-06: GN stack research in `docs/research/gn-stack.md`.

- 2026-11-07: Letters reader written (Relay environments, routes with SSR preload, Sections/Chapter/Letter pages,
  reader styles, react-router 8) and the SSR contract extended (async render, request context, serialized tail).
- 2026-11-07: Relay tag transform fixed. `@vitejs/plugin-react` 6 has no `babel` option, so `babel-plugin-relay`
  was never configured; `packages/ssr/src/vite-relay.ts` (`@portfolio/ssr/vite`) now rewrites each `graphql`
  tag to an import of its `__generated__` artifact (magic-string, with source maps), in dev, build, SSR and
  Vitest. Artifacts are committed because CI typechecks before it builds. SSR status now comes from the
  preloaded store (`/letter/nope` → 404). Green: typecheck, lint, 22 tests, 4 builds, smoke.

- 2026-11-07: Letters image pipeline and transcriptions. `scripts/derive-images.ts` (sharp → WebP 320/800/1600 +
  `img/manifest.json` of original sizes; idempotent, `--dry-run`, `--force`, pooled) with a real-sharp test;
  `server/transcriptions.ts` loads `transcriptions/<letterKey>.md` (front matter `source: ocr` optional);
  `Image.width/height` in the schema and on `<img>` so scans reserve space (`aspect-ratio: auto 3 / 4` fallback).
  Derived filenames fold the page id to `[A-Za-z0-9._-]` so Caddy and Hono agree on them. Pushed; CI green.

- 2026-11-07: Letters e2e: Playwright + `@axe-core/playwright` (`apps/letters/e2e/reader.spec.ts`, `pnpm e2e` after
  a build): SSR titles/status, pagination (ch3, 246 letters), focus to `main` after navigation, keyboard paging,
  no hydration errors, readable with JS off, 404 page; zero axe violations (WCAG 2.2 AA + best-practice) on every
  route. Playwright 1.65 needs `pnpm exec playwright install chromium` locally once.

- 2026-11-07: `packages/ui` primitives with tests (43 tests repo-wide): Button (busy keeps focus, `buttonClass`
  for links), LiveRegionProvider/useAnnounce, Disclosure (native `<details>`), Dialog/Drawer (native `<dialog>`
  + `showModal`, Esc/backdrop/close, children mount on open), Price (sale spoken), Image (CDN srcset, never
  upscaled, lazy unless `priority`), VariantPicker (radio groups, sold-out spoken). Storybook 10 with addon-a11y
  (`pnpm --filter @portfolio/ui build-storybook` → `storybook-static/`, builds under Vite 8). Testing Library
  cleanup is now registered in `vitest.setup.ts` (Vitest globals are off, so it was not automatic).

- 2026-11-07: Letters deployment prep: `apps/letters/Dockerfile` (multi-stage; the runtime stage keeps the pnpm
  workspace layout because Node will not strip types under `node_modules`, which rules out `pnpm deploy`),
  `apps/letters/deploy/compose.yaml` + runbook (loopback app port behind the webhost's Caddy as with the
  bookshop; `/scans/` and `/img/` still served by Caddy; metrics fenced to VM 107 in DOCKER-USER), CI job
  `image-letters` that boots the image and renders a page, then publishes `ghcr.io/aaronjmccoy/portfolio-letters`
  on `main`. Reading VM 104's Caddyfile from here was blocked by the permission classifier, so the Caddy block in
  the runbook is a template to merge, not a verified diff.

- 2026-11-07: Letters live on VM 104 (`/opt/letters`, image pulled from GHCR, 5,511 renditions derived in 11 min,
  Caddy serving `/scans/`, `/img/`, `/photos/` and proxying the rest; metrics fenced by a systemd oneshot).
  The book's landing page restored as the Home tab (`/`), contents at `/letters`. Verified from outside:
  `/`, `/letters`, `/letter/440` 200 with SSR titles, `/letter/nope` 404. `portfolio.aaronjmccoy.com` A record
  added, DNS-only.

## Next
- Letters: first chapter of transcriptions from the book; Markdown rendering of transcriptions (currently paragraphs only).
- Shop: Relay environment for the Storefront API, routes (home, collection, product, search, cart), once the dev store exists.
- UI: adopt the primitives in the letters app (Button, LiveRegion for page changes); serve Storybook at `portfolio.aaronjmccoy.com/ui/`.
- Playwright + axe e2e for shop and portfolio (letters done); Lighthouse CI budgets.
- Deployment: shop and portfolio Dockerfiles, following the letters recipe.

## Operator steps outstanding
- Shopify Partner dev store for Maller Art; Headless channel token; Admin custom app token → `apps/shop/.env`.
- Megan's catalog (titles, prices, photos, editions, shipping).
- First chapter of transcriptions.
