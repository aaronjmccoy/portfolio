# Lesson 4: Relay on the client

**Claim:** "React 19 + Relay reader", "Relay queries load per route", "paginated connections".

**Files:** `apps/letters/src/pages/ChapterPage.tsx` (query + pagination fragment),
`src/pages/LetterPage.tsx`, `src/routes.tsx`, `src/relay/environment.ts`, `relay.config.json`,
`src/__generated__/*.graphql.ts`, and `packages/ssr/src/vite-relay.ts`.

## The model

Relay is a compiler plus a runtime.

- **Compiler.** `relay-compiler` reads every `graphql\`...\`` tag in `src/`, validates it against
  `schema/schema.graphql`, and writes an artifact per operation or fragment into `src/__generated__/`:
  the query text, a normalized "selection" tree the runtime uses to read and write the store, and
  TypeScript types for the data. Open `src/__generated__/ChapterPageQuery.graphql.ts` now.
- **Runtime.** An `Environment` = a `Network` (how to send an operation) + a `Store` (a flat map of
  records keyed by global id, from lesson 3). `useLazyLoadQuery` sends the query, writes the
  response into the store, and returns a *masked* view: a component sees only the fields its own
  fragment selected.
- **Fragments are colocated.** `ChapterPage_letters` lives in `ChapterPage.tsx` beside the component
  that reads it. The page's query spreads it. A component's data needs travel with the component.

## Pagination, concretely

In `ChapterPage.tsx`:

```graphql
fragment ChapterPage_letters on Section
@refetchable(queryName: "ChapterPageLettersPaginationQuery")
@argumentDefinitions(first: { type: "Int!" }, after: { type: "String" }) {
  letters(first: $first, after: $after) @connection(key: "ChapterPage_letters") { edges { node { ... } } }
}
```

- `@connection` tells the runtime to keep the edges under one key and **append** new pages.
- `@refetchable` makes the compiler generate a second query (look in `__generated__`) that fetches
  just this fragment with new variables.
- `usePaginationFragment` returns `data`, `hasNext`, `loadNext`. "Show more letters" calls
  `loadNext(50)`; the runtime reads `pageInfo.endCursor` and sends it as `after`.

## The problem that was solved: there was no Babel

Relay normally relies on `babel-plugin-relay` to turn each `graphql\`...\`` tag into a `require`
of its artifact. This repo uses `@vitejs/plugin-react` 6, which has no `babel` option at all. The
first run died with Relay's invariant: "graphql: Unexpected invocation at runtime", meaning the
tag was being *called* instead of replaced.

The fix is `packages/ssr/src/vite-relay.ts`, a 70-line Vite plugin: a regex finds each tag, reads
the operation name, and `magic-string` rewrites the tag to an identifier plus a default import of
`<artifactDirectory>/<Name>.graphql.ts`, with a source map. `enforce: 'pre'` runs it before the
React plugin. Because it is a Vite plugin it applies in dev, build, SSR and Vitest alike, which
Babel config would not. The exact mapping works because relay-compiler already requires operation
names to be unique and to start with the module name.

Artifacts are committed because CI typechecks before it builds, and the page types import them.

Two sharp edges worth knowing, because an interviewer who has used Relay will ask about tooling:

- The plugin is a regex over source text. It does not know a comment or a string from code, so the
  word `graphql` directly followed by a backtick anywhere in a `src/` file is rewritten. The
  exercise files are written around that.
- The `graphql` npm package ships both a CommonJS and an ESM build with no `exports` map. Node
  picks the CommonJS one; Vite picks ESM. graphql-js refuses to mix instances ("another module or
  realm"), which is why `vitest.learn.config.ts` aliases the package to one file. Production never
  hits it because everything there runs under plain Node.

## Per-route loading

`src/routes.tsx` is the piece that makes SSR possible: each route declares the query its page
renders and how to make variables from the URL. `preloadRoute` runs that query into an
environment *before* React renders. Pages then read with `fetchPolicy: 'store-only'` on the server
(never go to the network during render) and `'store-or-network'` on the client (use what the
server embedded; fetch on navigation). Lesson 5 continues here.

## Try it

```sh
cd apps/letters
pnpm relay --validate        # compiler as CI runs it
pnpm relay                   # rewrite artifacts
```

Change a field name in `ChapterPage.tsx`'s fragment to something that does not exist and run
`pnpm relay`: the compiler error is the first line of defence. Put it back.

With `pnpm dev` running, open a chapter page with the browser devtools Network tab filtered to
`graphql`. Click "Show more letters": one POST, `operationName: ChapterPageLettersPaginationQuery`,
with `after` set. Reload: no GraphQL request at all, because the store was embedded (lesson 5).

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

When it passes, look at `records` in full (`console.log(JSON.stringify(records, null, 1))`): one
record per Node keyed by global id, and `client:root` pointing at them by reference.

## Say it out loud

- Why does Relay need a compile step and Apollo does not? What does the client gain from it?
- What is fragment masking, and what bug does it prevent in a large team?
- Walk through what happens on "Show more letters", from the click to the new `<li>`s.
- What would you have to change to use persisted queries (send an id instead of the query text)? Find the error message in `server-network.ts` that mentions them.
