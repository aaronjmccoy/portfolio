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

- 2026-11-07: Course for the operator: `docs/learn/` (ten lessons, one per resume claim: index, schema, Relay spec,
  Relay client, SSR, images, a11y e2e, UI library, shipping, interview) with exercises in `apps/letters/src/learn`
  run by `pnpm learn` (own Vitest config, never in CI). Two tooling facts surfaced: the Relay Vite plugin must skip
  its own source (it mentions the tag), and `graphql` must be aliased to one build under Vitest or Pothos and
  the test hold schemas from different realms.
- 2026-11-07: Course rewritten for a reader who does not know the vocabulary: `docs/learn/00-glossary.md`
  defines every term (SSR, hydration, GraphQL, Relay, connections, a11y, Docker) in interview form, and each
  lesson now opens with "The words" and scripted spoken answers to "What is it?" / "How did you use it?"
  before the repo walk. Lesson 10 gained a definitions round.

- 2026-11-08: Shopify store `mallerart.myshopify.com` is live (password-protected, USD) on Aaron's reactivated
  account; Headless channel installed, private Storefront token in `apps/shop/.env` as
  `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`; smoke query and `schema:pull --live` succeed. Catalog is empty
  (0 products, default `frontpage` collection), so `tools/catalog` runs before the shop routes.
- 2026-11-08: Dev Dashboard app `mallerart-api` installed on the store (Basic plan); client credentials grant
  verified from `tools/catalog/.env` (24-hour tokens, scopes write_files, write_products, write_publications,
  write_product_listings, write_product_feeds). Headless publication is `gid://shopify/Publication/355119300651` ("Headless"; the
  duplicate storefront was removed). Megan's catalog will be `catalog.xlsx` + `photos/<title>/`
  in Nextcloud, not `products.json`.
- 2026-11-08: `tools/catalog derive` built and verified against the live store with a throwaway original
  (deleted afterwards): staged upload of sticker art, `productSet` keyed by handle with options/variants and
  images reused from the original, `publishablePublish` to Headless, fingerprint tag for idempotency (second
  run skips, price change updates without re-sending media). Existing products are looked up by handle because
  the `products(query:)` search index lags behind writes. Collections `originals`, `prints`, `stickers` now
  exist in the store. Megan works only in the Shopify admin; there is no spreadsheet.
- 2026-11-08: `apps/shop` storefront built against the live store, following the measured mockup in
  `koifrog/Web Development/mallerart` (wordmark, nav, search pill, hero, rail-beside-grid collections):
  Relay environment with SSR preload and store serialization, routes `/`, `/collections/:handle` (paginated
  `@connection`), `/products/:handle` (variant picker, JSON-LD, add-to-cart form), `/search?q=` (plus
  predictive suggestions in the header), `/cart`; cart drawer on the native dialog with optimistic
  `cartLinesAdd/Update/Remove`; the browser talks to `/graphql` on our server, which forwards with the Headless
  private token (the public token is unused for now); `POST /cart/add|update` make the cart work with
  JavaScript off; cart id in the `ma_cart` cookie. All 12 operations validated with Shopify's Dev MCP. e2e:
  axe on every route, keyboard drawer, no-JS cart, 404s (`apps/shop/e2e`). Smoke checks Relay store + 404.
- 2026-11-08: `tools/catalog originals --dir <photos>` creates DRAFT originals from photos named by handle
  (main shot first, details after); ran it on the 8 sets in the mockup's `img/` folder. Collections published
  to Headless with titles Paintings / Prints / Trinkets; Starstuff added to `originals`.
- 2026-11-08: the 8 originals are ACTIVE placeholders carrying Starstuff's listing data ($5,000, 10 lb, one of a
  kind, DENY) plus a placeholder description marked as such; all nine (Starstuff included) now share vendor
  Maller Art, type Original, tag `original`, taxonomy category Paintings. Inventory is untracked on the 8 (the
  app has no inventory scope); Megan sets quantity 1 as she edits each one. Dev-server fix: Vite's
  `configLoader: 'native'` so `node --watch` stops restart-looping on Vite's temp config file.
- 2026-11-08: home page collections are a mosaic: six rows (gaps included) per column, each tile's spans chosen
  on the server from the image's own proportions (`apps/shop/src/lib/mosaic.ts`, landscapes take two columns),
  `grid-auto-flow: dense` fills the holes; no JS, no cropping beyond half a row. Rail tightened to 250/767 of the
  row with a smaller section title so "Paintings" stays on one line.

## Next
- Letters: first chapter of transcriptions from the book; Markdown rendering of transcriptions (currently paragraphs only).
- Shop: Lighthouse CI budgets; growth experiment (server-side bucketing, Prometheus funnel, cart attributes); Dockerfile + deploy like letters; an inquire-only state for large originals.
- UI: adopt the primitives in the letters app (Button, LiveRegion for page changes); serve Storybook at `portfolio.aaronjmccoy.com/ui/`.
- Playwright + axe e2e for portfolio (letters and shop done); Lighthouse CI budgets.
- Deployment: shop and portfolio Dockerfiles, following the letters recipe.

## Operator steps outstanding
- GitHub Actions secrets `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` (public token) so CI can boot the shop (`gh secret set`).
- Megan: replace the placeholder price, description, weight and quantity on all 9 originals in the admin; decide print sizes/prices for `tools/catalog/derive.config.json`.
- Shopify: done 2026-11-08 (store, Headless public + private tokens in `apps/shop/.env`, Admin app credentials in `tools/catalog/.env`, all verified). Only the mallerart.com domain move remains, at launch.
- Megan's catalog (titles, prices, photos, editions, shipping).
- First chapter of transcriptions.
