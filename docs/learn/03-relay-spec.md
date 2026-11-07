# Lesson 3: the Relay server spec

**Claim on the resume:** "Relay-spec ... Node interface, connections, pagination".

**Files:** `apps/letters/server/schema.ts` (the `builder.node` and `t.connection` calls),
`schema/schema.graphql` (`Node`, `PageInfo`, `*Connection`, `*Edge`).

## The words

"Relay-spec" describes a *server*. Relay (lesson 4) is a client library with strong assumptions
about the API it talks to; a server that satisfies them is Relay-spec. Shopify's Storefront API is
one, GitHub's API is one, and the letters API is one. Three conventions:

**Node and global ids.** Any object the client might fetch again on its own implements
`interface Node { id: ID! }`, and the `id` is unique across the *whole* API, not just within its
type. Why: the client keeps one record per object in a flat store (lesson 4), so `Letter` 440 and
`Page` 440 must not collide. The usual trick is to encode the type name into the id and base64 it:
`Letter:440` → `TGV0dGVyOjQ0MA==`. `Query.node(id:)` fetches any Node by that id, whatever its type.

**Connections.** A paginated list is not returned as a plain array. It is a `Connection` object:

```graphql
letters(first: 2, after: "<cursor>") {
  edges { cursor node { number } }
  pageInfo { hasNextPage endCursor }
}
```

An **edge** wraps one item plus its **cursor**, an opaque string that says "this position". To get
the next page you send the last cursor back as `after`. `pageInfo` tells you whether there is more.

**Cursor vs offset pagination.** `offset: 50, limit: 50` breaks when a row is inserted before
position 50 while you are paging: you see one item twice or skip one. A cursor marks an item, not
a position, so the next page starts after *that item*. Opaque means the client must not parse it;
the server may change what is inside (an offset today, a sort key and id tomorrow).

**Mutations with `input` and payload.** Every write takes one `input` object argument and returns a
payload type. Not used in letters; the shop's cart calls are shaped this way.

## The interview answer

**"What does it mean for a GraphQL API to be Relay-spec?"**

> Three things. Every object you might want to refetch implements a `Node` interface with a
> globally unique id, and there is a `node(id:)` field that can return any of them. Lists that
> paginate are connections: edges with cursors and a `pageInfo`, driven by `first` and `after`
> rather than offset and limit. And mutations take a single input object and return a payload. The
> reason is the client: Relay keeps a normalized store keyed by those ids, and its pagination hook
> knows how to append connection pages. If the server speaks the spec, the client gets caching,
> deduplication and infinite scroll without custom merge code per list.

**"How did you implement it?"**

> With Pothos's Relay plugin. `builder.node` registers a type as a Node: I give it a function for
> the local id, which is the letter key, and a `loadOne` that looks it up in the index; Pothos
> builds the global id by base64-encoding the type name plus that key, and implements `node` and
> `nodes` by decoding and calling my loader. For lists, `t.connection` with `resolveArrayConnection`
> turns `first`/`after` into a slice over the in-memory array and makes cursors from offsets. The
> one place the cost of global ids showed was `Page`: a page id is `440/pfr100313`, so its loader
> has to find the letter first and then search its page lists.

**Likely follow-ups**

- *"Why are cursors opaque?"* So the server can change its pagination strategy without breaking
  clients. Today it is an array offset; against a database it would be a sort key.
- *"What goes wrong if two objects share an id?"* The client merges them into one record and one
  overwrites the other's fields; the UI shows the wrong object.
- *"You will be working with Shopify's Storefront API. What do you already know about it?"*
  `products(first:, after:)` is a connection, product ids are global ids, cart mutations take
  `input` and return `cartLinesAddPayload`-style payloads with `userErrors`.

## How it was built here

- `builder.node(LetterRef, { id: { resolve: l => l.key }, loadOne: (id, ctx) => ... })`.
- `t.connection({ type: LetterRef, resolve: (s, args) => resolveArrayConnection({ args }, s.letters) })`
  makes `Section.letters` a connection.
- `usePaginationFragment` on the client (lesson 4) reads `pageInfo.endCursor`, sends it as `after`,
  and appends the new edges under a `@connection` key.

## Trace it

In GraphiQL:

```graphql
{ section(key: "ch3") { letters(first: 2) { edges { cursor node { number } } pageInfo { endCursor hasNextPage } } } }
```

Decode `endCursor` in Node: `Buffer.from('<cursor>', 'base64').toString()`. Run the same query with
`after: "<cursor>"`. Then fetch letter 440's `id` and pass it to
`{ node(id: "...") { __typename ... on Letter { number } } }`.

## Exercise

`pnpm learn 03`. Write two paging queries and one `node` query; decode a global id.

## Say it out loud, without notes

- Name the three Relay-spec conventions and say why each exists.
- What is a connection? What is an edge? What is a cursor?
- Cursor versus offset pagination: what breaks with offsets when the list changes under you?
- Decode `TGV0dGVyOjQ0MA==` in your head: what are the two parts?
