# Lesson 5: SSR and hydration

**Claim:** "streaming SSR (Hono, Vite, `renderToPipeableStream`)", "the record store is serialized into
the page and hydrated on the client", "every page reads with JavaScript disabled".

**Files:** `packages/ssr/src/index.ts`, `apps/letters/src/entry-server.tsx`, `src/entry-client.tsx`,
`src/relay/environment.ts`, `src/relay/server-network.ts`, `apps/letters/index.html`.

## One request, start to finish

`GET /letter/440` arrives at Hono (`createSsrApp`):

1. The catch-all route calls `streamHtml`. It loads `dist/client/index.html` (the template Vite
   built, with the hashed client script) and the server bundle's `render`.
2. `render(url, options, ctx)` in `entry-server.tsx`:
   - makes a Relay Environment whose network **executes the schema in-process**
     (`createServerFetch`): no HTTP to itself, no serialization, the same `index` object as context;
   - `preloadRoute` matches the URL to a route and runs its query, filling the store;
   - `lookup` reads the store (not a second query) for the `<title>` and the status: the root
     field preloaded as `null` means 404;
   - calls `renderToPipeableStream(<StaticRouter><App/></StaticRouter>)` and returns the head,
     the serialized store as `tail`, the status, and `pipe`/`abort`.
3. `streamHtml` writes the template's head, pipes React's output into the response body, and when
   React finishes, appends the tail and the rest of the template.
4. The browser runs `entry-client.tsx`: it reads `#__RELAY_DATA__`, seeds a new Store with those
   records, and `hydrateRoot`s. Pages read with `store-or-network`, find everything in the store,
   and render identically. No request, no flash.

## The details that took work

- **The shell race.** `onShellReady` can fire synchronously inside `render()` for a page with no
  Suspense boundary, before `render`'s result is assigned. Both sides call `flush()` and whichever
  runs second does the work. Read the comment in `streamHtml`.
- **Who closes the stream.** React ends whatever it pipes into. So the HTML after the app (tail,
  closing tags) is written by a custom `Writable`'s `final`, not by an `onAllReady` callback that
  would race the pipe.
- **Serializing safely.** `serializeRecords` JSON-encodes the store and escapes `<` as `<`
  so data can never close the `<script>` tag.
- **No-JS home page.** React "outlines" a finished Suspense boundary larger than
  `progressiveChunkSize` (12.8 kB) behind an inline script, so a long page shows blank without
  JavaScript. Since every route's data is preloaded, there is nothing to stream progressively, and
  `progressiveChunkSize: Infinity` sends it whole. Found by the no-JS e2e test (lesson 7).
- **Status from the store.** `/letter/nope` first returned 200 because the route matched. The fix
  reads the preloaded root field: `null` means the archive has no such letter.
- **Dev mode.** Without a build, Vite runs in middleware mode inside Hono: it transforms
  `index.html` and loads `entry-server.tsx` per request, so HMR works and SSR still happens.

## Compare with Next.js (what GN runs)

| Here | Next.js pages router |
| --- | --- |
| `routes.tsx` declares each page's query and variables | `getServerSideProps` returns props per request |
| Relay store serialized into `#__RELAY_DATA__` | props serialized into `__NEXT_DATA__` |
| `hydrateRoot` with the seeded store | Next hydrates with the props |
| Hono + `renderToPipeableStream` | Next's server, same React API underneath |

The concepts transfer one to one; the framework decides the file layout.

## Try it

```sh
cd apps/letters && pnpm build && NODE_ENV=production node server/index.ts
curl -s http://localhost:3001/letter/440 | head -c 1500
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/letter/nope
curl -s http://localhost:3001/letter/440 | grep -o '__RELAY_DATA__' | wc -l
```

Then in the browser with JavaScript disabled (devtools → Settings → Debugger → Disable JavaScript),
load `/`, `/letters`, `/letter/440`. Everything readable; links work; only paging needs JS.

## Exercise

`pnpm learn 05`. 5a: predict the 404 case. 5b: find letter 440 in the serialized store. 5c: add
an `og:title` meta to the head in `entry-server.tsx` (a real, keepable change).

## Say it out loud

- What is a hydration mismatch, and what in this design prevents one?
- Why execute GraphQL in-process on the server instead of fetching `/graphql`?
- What does streaming buy when all data is preloaded? When would you let React stream a boundary late?
- Where would a per-user cookie (the shop's cart id) enter this flow?
