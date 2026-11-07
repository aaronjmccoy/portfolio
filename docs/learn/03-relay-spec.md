# Lesson 3: the Relay server spec

**Claim:** "Relay-spec ... Node interface, connections, pagination".

**Files:** `apps/letters/server/schema.ts` (the `builder.node` and `t.connection` calls),
`schema/schema.graphql` (`Node`, `PageInfo`, `*Connection`, `*Edge`).

## The three rules

Relay's client makes assumptions about the server. A schema that follows them is "Relay-spec":

1. **Object identification.** Any type that can be refetched implements `interface Node { id: ID! }`
   with a **globally unique** id, and `Query.node(id:)` returns it. The client's normalized store
   (lesson 4) keys records by that id, so two queries that return the same letter share one record.
2. **Connections for lists that paginate.** A paginated field returns a `Connection` with
   `edges { cursor node }` and `pageInfo { hasNextPage hasPreviousPage startCursor endCursor }`,
   and takes `first/after` (forward) and `last/before` (backward). Cursors are opaque strings.
3. **Mutations** take one `input` object and return a payload (not used in letters; the shop will).

## How Pothos does it here

- `builder.node(LetterRef, { id: { resolve: l => l.key }, loadOne: (id, ctx) => ... })` registers
  `Letter` as a `Node`. Pothos builds the global id by encoding `Letter:440` (type name plus the
  local id) in base64, and `Query.node`/`Query.nodes` decode it and call `loadOne`. The local id is
  the letter key, so `node(id:)` is a map lookup.
- `t.connection({ type: LetterRef, resolve: (s, args) => resolveArrayConnection({ args }, s.letters) })`
  makes `Section.letters` a connection over the in-memory array. `resolveArrayConnection` turns
  `first/after` into a slice and makes cursors from array offsets, also base64. Opaque to the
  client; decodable by you in an exercise.
- The `Page` node's `loadOne` shows the cost of global ids: a page id is `440/pfr100313`, so the
  loader has to find the letter first, then search its three page lists.

## Why it matters on the client

`usePaginationFragment` (lesson 4) works only because the server speaks connections: the client
reads `pageInfo.endCursor`, sends it back as `after`, and appends the new edges to the one it
already holds under a `@connection` key. Without the spec, every list would need custom merge
code.

## Trace it

In GraphiQL:

```graphql
{ section(key: "ch3") { letters(first: 2) { edges { cursor node { number } } pageInfo { endCursor hasNextPage } } } }
```

Decode `endCursor` in Node: `Buffer.from('<cursor>', 'base64').toString()`. Then run the same
query with `after: "<cursor>"`. Then fetch letter 440's `id` and pass it to
`{ node(id: "...") { __typename ... on Letter { number } } }`.

## Exercise

`pnpm learn 03`. Write two paging queries and one `node` query; decode a global id.

## Say it out loud

- What goes wrong in a Relay client if two different objects share an `id`?
- Why are cursors opaque? What could a server put in one besides an offset?
- `first: 50, after: X` vs `offset: 50, limit: 50`: what does cursor pagination give you when the list changes under you?
- Shopify's Storefront API is Relay-spec. Name two things you already know about `products(first:, after:)` from this lesson.
