# portfolio

Monorepo behind **portfolio.aaronjmccoy.com** and the headless **Maller Art** storefront.

| Package | What it is |
|---|---|
| `apps/shop` | React 19 + Relay storefront on the Shopify Storefront API, server-rendered by a small Node server |
| `apps/letters` | React 19 + Relay reader for germanwarletters.com over a self-authored GraphQL API (Pothos + Yoga + SQLite), server-rendered |
| `apps/portfolio` | Prerendered React portfolio site |
| `packages/ui` | Shared accessible components and design tokens |
| `tools/catalog` | CLI that upserts the Maller Art catalog through the Shopify Admin GraphQL API |

Requires Node 24 and pnpm 12.
