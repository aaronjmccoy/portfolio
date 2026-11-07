# GN brand sites: stack fingerprint (2026-11-06)

Method: fetched each homepage with a browser User-Agent and read response headers, markup markers
and script hosts (what Wappalyzer does). Public pages only; nothing authenticated.

| Site | Framework | CMS / data | Commerce | Hosting / CDN | Analytics & tooling |
|---|---|---|---|---|---|
| **jabraenhance.com** (the role) | Next.js, pages router, webpack | Payload CMS (self-hosted at `payload-cms-admin.jabraenhance.com`, behind Cloudflare Access); `/api/graphql` live; traces of Contentful | Recharge (Shopify subscriptions), PayPal | CloudFront behind Cloudflare | Segment, Amplitude, Sentry |
| jabra.com | Next.js | Sitecore headless (JSS, GraphQL) | — | Azure Front Door | GTM; Radix UI; shared `gn-audio-components` / `gn-audio-core` bundles |
| blueparrott.com | Next.js | Sitecore headless | — | Azure Front Door | same shared bundles as jabra.com |
| steelseries.com | Next.js (turbopack) | Contentful | Shopify, Yotpo, Klarna | Cloudflare | Osano |
| resound.com | Sitecore MVC (classic) | Sitecore | — | — | GTM, Cookiebot, Coveo |
| beltone.com | Sitecore MVC, jQuery validate | Sitecore | — | — | GTM, Cookiebot, Coveo |
| interton.com / falcom.com | Sitecore MVC | Sitecore | — | — | GTM, Cookiebot |

## What it means for the application

- **Jabra Enhance is headless commerce on React/Next.js with Shopify underneath.** Recharge only runs on
  Shopify, and the posting's "Shopify: Liquid, Storefront/Admin APIs" line matches that. The storefront
  pages are custom (`/products` and `/collections` are not Shopify theme routes; they 307 home).
- **Relay + GraphQL** in the posting is consistent with a GraphQL BFF (`/api/graphql`) in front of Payload
  and Shopify. No Relay runtime markers were visible in the shell bundles; see the follow-up probe below.
- **SSR/CSR** in the posting = Next.js. Our shop and letters apps use Vite SSR with the same React 19
  primitives (`renderToPipeableStream`, hydration), which is the transferable skill. Worth being fluent in
  Next.js pages-router data fetching (`getServerSideProps`) for interviews.
- **Growth tooling** is Segment + Amplitude. Our experiment write-up should speak that language
  (events, funnels, cohorts) even though we ship metrics to Prometheus.
- **Design system:** the GN audio sites share a component library on Radix UI. Our `packages/ui`
  (accessible primitives, tokens, Storybook) is the right shape to talk about.
- **Observability:** Sentry on the front end. Mention error budgets / source maps in the case study.

## Follow-up probe (product page, GraphQL introspection)

Not run. Sending an introspection query to `/api/graphql` and pulling product-page bundles was judged
to cross from fingerprinting into probing, so it was stopped. The homepage evidence above is enough:
the shell bundles carry Payload, Segment, Amplitude, Sentry and Recharge references and no Relay or
Apollo runtime strings, so Relay is either confined to page chunks or part of where the team is
heading. Treat it as a skill to show, not a thing to reverse-engineer.
