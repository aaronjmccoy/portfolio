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

## Next
- Letters: image derivation script (sharp → WebP 320/800/1600), transcription loader (Markdown by letter key), Relay routes and the reader UI.
- Shop: Relay environment for the Storefront API, routes (home, collection, product, search, cart), once the dev store exists.
- UI: Dialog/Drawer, Disclosure, VariantPicker, Image, LiveRegion, Button, Price; Storybook with the a11y addon.
- Playwright + axe e2e per app; Lighthouse CI budgets.
- Deployment: Dockerfiles, Compose on VM 104, Caddy blocks, Pi-hole records.

## Operator steps outstanding
- Raise VM 104 to 4 GB RAM before the Node services deploy.
- Shopify Partner dev store for Maller Art; Headless channel token; Admin custom app token.
- Cloudflare A record for `portfolio.aaronjmccoy.com`.
- Megan's catalog (titles, prices, photos, editions, shipping).
- Approve the first push of this repo to GitHub (`aaronjmccoy/portfolio`).
