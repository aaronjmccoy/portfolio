# Lesson 2: the GraphQL schema

**Claim on the resume:** "Designed a Relay-spec GraphQL API (Pothos + GraphQL Yoga)".

**Files:** `apps/letters/server/schema.ts`, `apps/letters/schema/schema.graphql`,
`apps/letters/scripts/print-schema.ts`, `apps/letters/server/index.ts` (the Yoga mount).

## The words

Start with what you already know. A REST API is a set of URLs: `GET /letters/440` returns a JSON
blob the server decided the shape of. A page that shows a letter, its section title and its
neighbours either makes three requests or the server adds a special endpoint for that page.

**GraphQL** turns that around. There is one URL, `/graphql`. The client sends a text describing the
data it wants, in the shape it wants back:

```graphql
{ letter(key: "440") { number pageCount section { title } previous { key } } }
```

and the server answers with JSON in exactly that shape. One request, only those fields.

**Schema.** For that to work the server must publish what can be asked for. The schema lists the
**types** (`Letter`, `Section`, `Page`), the **fields** on each (`number: Int!`), the **arguments**
fields take (`letter(key: String!)`), and the top-level entry points under `Query`. `!` means
never null. It is a typed contract, like a TypeScript interface for the API.

**Resolver.** The function behind one field. Execution is a walk: the server calls `Query.letter`'s
resolver with the arguments, gets a `Letter` object, then for each sub-field the client asked for
calls that field's resolver with the letter as its parent. `number` is just a property read;
`previous` looks at the neighbours array. Every resolver also gets a shared **context** object; here
that is the index from lesson 1.

**Code-first vs schema-first.** You can write the schema text by hand and then write resolvers you
hope match it (schema-first), or write typed code and generate the schema text from it
(code-first). **Pothos** is the TypeScript library that does the second: `builder.objectRef<Letter>`
ties the GraphQL type to the TS type, so a resolver returning the wrong shape fails to compile.

**GraphQL Yoga.** The HTTP layer: it receives the POST, parses the query text, validates it against
the schema, runs the resolvers, returns JSON. It also serves **GraphiQL**, the in-browser query
editor, in development.

**N+1.** If `letters` returned 50 letters and `section` on each one hit a database, that is 51
queries. Real servers batch those with DataLoader. Here everything is in memory, so there is
nothing to batch; the point is to know where the problem would appear.

## The interview answer

**"What is GraphQL, in your words?"**

> It is an API style where the client describes the data it wants as a tree, and the server fills
> that tree in. Instead of one endpoint per resource, there is one endpoint and a typed schema that
> says what can be asked for. The win is that a page gets exactly its data in one round trip, and
> the schema is a contract both sides can check against, so the client's types are generated rather
> than guessed. The cost is that the server has to think about execution: each field is a function,
> and nested lists can fan out into many calls if you are not careful.

**"Tell me about the GraphQL API you built."**

> For the letters site I built the API code-first with Pothos on top of GraphQL Yoga. Code-first
> means the schema is generated from TypeScript rather than written by hand: each GraphQL type is
> bound to the TypeScript type from the archive index, so if a resolver returns the wrong shape it
> does not compile. I set fields to non-null by default, so anything nullable is a deliberate
> statement, like "the Introduction has no chapter number" or "a transcription may not exist yet",
> and the client types reflect that. The resolvers are thin: they read the in-memory index that
> arrives as context and never do I/O. That last choice is what lets the server-rendering layer
> execute the schema in-process instead of making an HTTP request to itself. The printed schema
> file is committed and regenerated on every build, because the Relay compiler reads it to validate
> the client's queries, and I wanted the two to be unable to drift.

**Likely follow-ups**

- *"Why Pothos and not Apollo Server or Nexus?"* Pothos is a schema builder, not a server; it pairs
  with any server, and Yoga is small and standards-based. Its Relay plugin gives `Node` and
  connections (lesson 3) in one call. Nexus is similar but less maintained.
- *"Where would caching go?"* Nowhere yet: in-memory lookups are already microseconds. With a
  database behind it, DataLoader per request for batching, and an HTTP cache in front for
  anonymous reads.
- *"What is an `Image` in your schema if it is not stored anywhere?"* A computed type.
  `Page.image` returns `{ page }` when the page is a scan; `Image`'s resolvers compute the URLs and
  read the pixel size from the manifest the image pipeline writes (lesson 6).

## How it was built here

- `builder.objectRef<Letter>('Letter')` and `builder.node(...)` (lesson 3) declare the types.
  `exposeString`/`exposeInt` are property passthroughs; `letterCount`, `previous`, `srcset` are
  computed in a `resolve` function.
- `defaultFieldNullability: false` makes `!` the default.
- `createYoga({ schema, context })` is mounted on Hono at `/graphql`; GraphiQL on in development,
  off in production. A tiny Yoga plugin counts operations into a Prometheus counter (lesson 9).
- `pnpm schema:print` writes `schema/schema.graphql`; `pnpm build` runs it first.

Open `server/schema.ts` and `schema/schema.graphql` side by side. For each GraphQL type find the
builder call that made it, then for each field, its resolver.

## Trace it

`{ letter(key: "440") { previous { number } } }`:

1. Yoga parses and validates, then calls `Query.letter`'s resolver with `(root, { key }, context)`.
   It returns `index.letterByKey.get('440')`.
2. For `previous`, the `Letter` resolver receives that object as its first argument and reads
   `index.letters` around `indexOf(l)`.
3. `number` is `exposeInt('number')`: a property read.

Each level is a function call with the parent's result. That is the whole execution model.

## Try it

With `pnpm dev` running, open http://localhost:3001/graphql and run:

```graphql
{ sections { key title letterCount } }
{ letter(key: "440") { number pageCount section { title } previous { key } next { key } } }
{ letter(key: "440") { pages { page image { src width } } companions { page ext } } }
```

Use the Docs panel in GraphiQL: every description string in `schema.ts` is there. Now change a
field name to something that does not exist and read the error: that is validation against the
schema.

## Exercise

`pnpm learn 02`. 2a passes; trace it. 2b and 2c add fields to `server/schema.ts`. Then run
`pnpm schema:print` and `git diff schema/schema.graphql`; the diff is what a reviewer would read.

## Say it out loud, without notes

- What is a schema? What is a resolver? What is context?
- GraphQL versus REST: one advantage, one cost.
- What does code-first mean, and what bug does it prevent?
- Why is the printed schema committed if it is generated?
- Where is the N+1 problem in this schema, and why does it not matter here?
