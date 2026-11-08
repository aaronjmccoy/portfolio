# catalog

Bulk tooling for the Maller Art shop, on the Shopify Admin GraphQL API.

Megan works in the Shopify admin: one product per original painting, photos in display
order, in the **originals** collection. This tool does the repetitive part:

```sh
pnpm derive --dry-run     # show what would change
pnpm derive               # write it
pnpm derive --only blue-heron
```

For every original it generates a **print** product (one variant per size in
`derive.config.json`, the original's photos reused) and, when `stickers/<handle>.png`
exists, a **sticker** product with that artwork uploaded through a staged upload. Both are
published to the Headless channel. Derived products are keyed by handle
(`<original>-print`, `<original>-sticker`), tagged `derived`, `source:<original>` and
`fp:<hash>`; an unchanged product is skipped, a changed price or size list updates it, an
original removed from the collection is reported as an orphan to archive by hand.

Credentials: copy `.env.example` to `.env` (gitignored). The app is a Dev Dashboard app
installed on the store; the tool mints a 24-hour token with the client credentials grant.
Variants are untracked (made to order); the app has no inventory scopes.
