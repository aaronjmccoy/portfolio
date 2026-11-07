# Lesson 4: Relay on the client

**Claim on the resume:** "React 19 + Relay reader", "Relay queries load per route", "paginated connections".

**Files:** `apps/letters/src/pages/ChapterPage.tsx` (query + pagination fragment),
`src/pages/LetterPage.tsx`, `src/routes.tsx`, `src/relay/environment.ts`, `relay.config.json`,
`src/__generated__/*.graphql.ts`, and `packages/ssr/src/vite-relay.ts`.

## The words

**What Relay is.** A GraphQL client library for React, from Meta. It is the thing in the browser
that sends queries to `/graphql`, keeps the results, and hands them to components. The
alternatives are Apollo Client, urql, or TanStack Query with `fetch`. Relay is stricter than all
of them in three ways, and those three are the whole topic:

1. **A compiler.** You write queries in `graphql` tagged templates inside components. Before the
   app runs, `relay-compiler` reads them all, validates them against the schema from lesson 2, and
   writes one generated file per query or fragment into `src/__generated__/`. Those files, called
   **artifacts**, contain the query text, a description of its shape the runtime uses to read and
   write the store, and TypeScript types for the result. A typo in a field name is a compile
   error, not a runtime surprise.

2. **Fragments owned by components.** A **fragment** is a named piece of a query attached to a
   type: `fragment ChapterPage_letters on Section { letters(first: 50) { ... } }`. In Relay each
   component declares the fields it renders as a fragment, and a page-level **query** spreads the
   fragments of the components it contains. Data needs live beside the UI that uses them
   (**colocation**). The runtime then enforces **masking**: a component can read only the fields
   in its own fragment, even though the whole query fetched more. So no component can quietly
   depend on data another component asked for.

3. **One normalized store.** Responses are not cached as nested JSON blobs per query. Every object
   with an `id` becomes one flat **record** keyed by its global id (lesson 3), and other records
   point to it by reference. Two queries that both include letter 440 share a single record, so
   there is one source of truth in the client.

**The runtime objects.** An **Environment** = a **Network** + a **Store**. The Network is a function
that sends an operation and returns the response; the Store is the record map. Hooks like
`useLazyLoadQuery` and `usePaginationFragment` take the Environment from React context.

**fetchPolicy.** Per query: `store-only` (never hit the network, fail if missing),
`store-or-network` (use the store if it has everything, else fetch), `network-only`. The server
renders with `store-only` because the data was preloaded; the client uses `store-or-network`.

**Pagination directives.** `@connection(key:)` on a connection field tells the runtime to keep the
edges under one key and append new pages. `@refetchable(queryName:)` on a fragment makes the
compiler generate a second query that fetches just that fragment with new variables.
`usePaginationFragment` ties them together and returns `data`, `hasNext`, `loadNext`.

## The interview answer

**"What is Relay, and why would you pick it over Apollo?"**

> Relay is Meta's GraphQL client for React. The difference from Apollo is discipline. Relay has a
> compile step that validates every query against the schema and generates the types, so a broken
> query fails the build, not the user. Components own fragments, so each one declares exactly what
> it renders and can only see that, which keeps a large codebase from growing hidden dependencies
> between components. And everything lives in one normalized store keyed by global id, so the
> same object is never cached twice. The cost is that the server has to follow the Relay spec, and
> the tooling is heavier: a compiler, generated files, and a plugin to swap the tags for the
> artifacts. For a small app Apollo is quicker to start; for a storefront with many components
> reading the same product data, Relay's constraints pay back.

**"Walk me through how a page gets its data in your letters app."**

> Each route in `routes.tsx` declares the query its page renders and how to build the variables
> from the URL. On the server that query is run before React renders, which is the SSR story in
> the next lesson. On the client the page component calls `useLazyLoadQuery` with the query and
> `store-or-network`. On first load the store was seeded from what the server embedded, so there is
> no request. On navigation it fetches. The chapter page has a `ChapterPage_letters` fragment on
> `Section` with `@connection` and `@refetchable`; `usePaginationFragment` gives it `loadNext`, and
> "Show more letters" calls `loadNext(50)`. The runtime reads `pageInfo.endCursor`, sends it as
> `after` in the generated pagination query, and appends the edges to the list it already holds.

**"What was hard about setting up Relay?"**

> Relay expects a Babel plugin to replace each `graphql` tag with an import of its generated
> artifact. This repo builds with Vite and `@vitejs/plugin-react` 6, which has no Babel option at
> all, so the first run died with Relay's "unexpected invocation at runtime": the tag was being
> called instead of replaced. I wrote a small Vite plugin instead: a regex finds each tag, reads the
> operation name, and rewrites it with magic-string to an import of `__generated__/<Name>.graphql.ts`,
> with a source map. Because it is a Vite plugin it works in dev, build, server rendering and
> Vitest, which a Babel config would not have covered uniformly.

**Likely follow-ups**

- *"What is fragment masking and what bug does it prevent?"* A component sees only its own
  fragment's fields. Without it, component A renders a field component B requested; someone removes
  B and A breaks at runtime with no type error.
- *"What is in the normalized store?"* One record per object keyed by global id, plus `client:root`
  whose fields point at them by reference. The exercise prints it.
- *"How would you do persisted queries?"* Have the compiler emit an id per query, send the id
  instead of the text, and have the server map ids to text. `server-network.ts` already has the
  error for a missing text.

## How it was built here

- Compiler: `relay.config.json` points at `schema/schema.graphql` and `src/__generated__`. Open
  `src/__generated__/ChapterPageQuery.graphql.ts` and find the three parts: `params.text`,
  `operation` (the normalization instructions), the exported types.
- The pagination fragment in `ChapterPage.tsx`:

  ```graphql
  fragment ChapterPage_letters on Section
  @refetchable(queryName: "ChapterPageLettersPaginationQuery")
  @argumentDefinitions(first: { type: "Int!" }, after: { type: "String" }) {
    letters(first: $first, after: $after) @connection(key: "ChapterPage_letters") { edges { node { ... } } }
  }
  ```

- `src/relay/environment.ts` builds the Environment from a fetch function: `createServerFetch`
  (in `server-network.ts`) executes the schema in-process; `httpFetch` (browser) POSTs to
  `/graphql`. `readServerRecords` reads the embedded store on the client.
- `packages/ssr/src/vite-relay.ts`: 70 lines, `enforce: 'pre'`, regex + magic-string. Artifacts are
  committed because CI typechecks before it builds and the page types import them.

Two sharp edges worth knowing, because an interviewer who has used Relay will ask about tooling:

- The plugin is a regex over source text; it does not know a comment from code, so the word
  `graphql` directly followed by a backtick anywhere in `src/` is rewritten. The exercise files are
  written around that.
- The `graphql` npm package ships CommonJS and ESM builds with no `exports` map. Node picks CJS,
  Vite picks ESM, and graphql-js refuses to mix instances ("another module or realm"). That is why
  `vitest.learn.config.ts` aliases the package to one file.

## Try it

```sh
cd apps/letters
pnpm relay --validate        # compiler as CI runs it
pnpm relay                   # rewrite artifacts
```

Change a field name in `ChapterPage.tsx`'s fragment to something that does not exist and run
`pnpm relay`: the compiler error is the first line of defence. Put it back.

With `pnpm dev` running, open a chapter page with the devtools Network tab filtered to `graphql`.
Click "Show more letters": one POST, `operationName: ChapterPageLettersPaginationQuery`, with
`after` set. Reload: no GraphQL request at all, because the store was embedded (lesson 5).

## Exercise

`pnpm learn 04`. 4a: predict the plugin's output.

4b: declare an operation, compile it, run it through an Environment, and look at the normalized
store. Replace the empty export in `src/learn/LearnLetter.tsx` with:

```ts
import { graphql } from 'react-relay';
export const LearnLetterQuery = graphql`query LearnLetterQuery($key: String!) { letter(key: $key) { id number pageCount } }`;
```

Run `pnpm relay` and open the artifact it writes. Then replace the body of test 4b with:

```ts
import { fetchQuery } from 'react-relay';                       // these three go at the top of the file
import { LearnLetterQuery } from './LearnLetter.tsx';
import type { LearnLetterQuery as LearnLetterQueryType } from '../__generated__/LearnLetterQuery.graphql.ts';

it('4b: fetchQuery fills the store with one record per Node', async () => {
  const environment = createEnvironment(createServerFetch(ctx));
  const data = await fetchQuery<LearnLetterQueryType>(environment, LearnLetterQuery, { key: '440' }).toPromise();
  expect(data?.letter).toMatchObject({ number: 440, pageCount: 4 });
  const records = environment.getStore().getSource().toJSON();
  expect(Object.keys(records)).toContain('<the global id of letter 440, from lesson 3>');
  expect(records['client:root']).toHaveProperty('<the root field key: the field name plus its arguments>');
});
```

When it passes, print `records` in full (`console.log(JSON.stringify(records, null, 1))`): one
record per Node keyed by global id, and `client:root` pointing at them by reference. That picture
is the normalized store; keep it in your head for the interview.

## Say it out loud, without notes

- What is Relay? Name its three distinguishing features.
- What is a fragment? What is colocation? What is masking?
- What does the compiler produce, and what does the runtime do with it?
- Walk through "Show more letters" from the click to the new `<li>`s.
- Why was a Vite plugin needed, and what does it do?
