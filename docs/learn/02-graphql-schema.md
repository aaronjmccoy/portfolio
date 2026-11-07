# Lesson 2: the GraphQL schema

**Claim:** "Designed a Relay-spec GraphQL API (Pothos + GraphQL Yoga)".

**Files:** `apps/letters/server/schema.ts`, `apps/letters/schema/schema.graphql`,
`apps/letters/scripts/print-schema.ts`, `apps/letters/server/index.ts` (the Yoga mount).

## The decisions

- **Code-first with Pothos.** The schema is built from TypeScript: `builder.objectRef<Letter>('Letter')`
  ties the GraphQL type to the `Letter` type from lesson 1, so a resolver that returns the wrong
  shape fails to compile. The alternative, writing SDL by hand and generating resolver types, means
  two sources of truth; here the only artifact is the printed schema, and it is generated.
- **Non-null by default.** `defaultFieldNullability: false` means every field is `String!` unless
  it says `nullable: true`. Nullable is then a deliberate statement ("chapter is absent for the
  Introduction", "transcription may not exist yet"), which the client types reflect.
- **Resolvers are thin.** Each one reads the in-memory index that arrives as `context`. No
  resolver does I/O. That is why SSR can execute the schema in-process (lesson 5) with no network.
- **The printed schema is committed.** `pnpm schema:print` writes `schema/schema.graphql`;
  relay-compiler reads it (lesson 4). The build runs the print first so they cannot drift.
- **Yoga serves it.** `createYoga({ schema, context })` is mounted on Hono at `/graphql`;
  GraphiQL is on in development and off in production. A tiny Yoga plugin counts operations
  into a Prometheus counter (lesson 9).

## Read the schema file

Open `server/schema.ts` and `schema/schema.graphql` side by side. For each GraphQL type find
the `builder.node(...)` or `builder.objectType(...)` that made it, then for each field, the
resolver. Note which fields are `exposeString`/`exposeInt` (a property passthrough) and which
are computed (`letterCount`, `previous`, `srcset`).

The `Image` type is the one to understand fully: it is not a stored object. `Page.image` returns
`{ page }` when the page is an image, and `Image`'s resolvers compute URLs from it. `width` and
`height` come from the manifest that the image pipeline writes (lesson 6), via `context.dimensions`,
and are `null` until that has run.

## Trace it

`{ letter(key: "440") { previous { number } } }`:

1. Yoga parses and validates against `schema`, then calls `Query.letter`'s resolver with
   `(root, { key }, context)`. It returns `index.letterByKey.get('440')`, a `Letter` object.
2. For `previous`, the `Letter` resolver gets that object as its first argument and reads
   `index.letters` around `indexOf(l)`.
3. `number` is `exposeInt('number')`: a property read.

Each level of the query is a function call with the parent's result. That is the whole
execution model, and it is why N+1 problems exist (a resolver per edge) and why DataLoader
exists for real databases. Here the data is in memory, so there is nothing to batch.

## Try it

With `pnpm dev` running, open http://localhost:3001/graphql and run:

```graphql
{ sections { key title letterCount } }
{ letter(key: "440") { number pageCount section { title } previous { key } next { key } } }
{ letter(key: "440") { pages { page image { src width } } companions { page ext } } }
```

Use the Docs panel in GraphiQL: every description string in `schema.ts` is there.

## Exercise

`pnpm learn 02`. 2a passes; trace it. 2b and 2c add fields to `server/schema.ts`. Then run
`pnpm schema:print` and `git diff schema/schema.graphql`; the diff is what a reviewer would read.
Keep the fields or revert them, your choice.

## Say it out loud

- What does "Relay-spec" require of a schema? (Lesson 3 answers in full; name the three things now.)
- Why is the printed schema committed if it is generated?
- Where would you add caching or batching in this design, and why is it not needed today?
- What would change if the index lived in SQLite? Which resolvers would become async, and what would the client notice?
