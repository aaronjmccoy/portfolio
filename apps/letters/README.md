# German War Letters

React 19 + Relay reader for the family letter archive at germanwarletters.com, backed by a self-authored
GraphQL API (Pothos + Yoga over node:sqlite) and server-rendered with Hono.

- `scripts/derive-images.ts` walks the scan archive once, parses chapter and letter numbers out of the
  flattened filenames, writes responsive WebP sizes with sharp, and builds the SQLite index.
- `schema/schema.graphql` is the printed schema that relay-compiler reads; regenerate it with `pnpm schema:print`.
- Originals are never copied into the repo or the image; the container mounts the archive read-only.
