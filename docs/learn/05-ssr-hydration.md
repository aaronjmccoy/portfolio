# Lesson 5: SSR and hydration

**Claim on the resume:** "streaming SSR (Hono, Vite, `renderToPipeableStream`)", "the record store is
serialized into the page and hydrated on the client", "every page reads with JavaScript disabled".

**Files:** `packages/ssr/src/index.ts`, `apps/letters/src/entry-server.tsx`, `src/entry-client.tsx`,
`src/relay/environment.ts`, `src/relay/server-network.ts`, `apps/letters/index.html`.

## The words

**Client-side rendering, the default.** A plain React app ships an `index.html` that is almost
empty plus a JavaScript bundle. The browser downloads the bundle, runs React, React fetches data,
and only then does the user see content. Until then: a blank page or a spinner. Search engines and
anyone with JavaScript off see nothing.

**Server-side rendering (SSR).** The server runs the *same* React components itself, with the data
already loaded, and sends the finished HTML. The browser paints a complete page on arrival.
React's server API for this is `renderToString`, or its newer streaming form.

**Streaming.** `renderToPipeableStream` writes HTML to the response as React produces it instead of
building one big string first. The browser starts parsing, and starts downloading CSS and the
script, before the server has finished the body. With React Suspense a slow section can even be
sent later and slotted in. In this repo all data is preloaded, so there is nothing slow to defer,
but the streaming API is still what runs.

**Hydration.** The HTML from the server is inert: no event handlers, no React state. When the
script loads, `hydrateRoot` renders the components in memory, walks the existing DOM, checks it
matches, and attaches handlers to the nodes that are already there. After that it is an ordinary
React app. Hydration is not a re-render of the page; it is React adopting the page.

**Hydration mismatch.** If the client's first render differs from the server's HTML, React logs a
warning and patches or redraws. The usual cause is the server and client rendering from different
data. The cure is to give the client the exact data the server used.

**Serializing the store.** That is what this repo does: after rendering, the server JSON-encodes the
Relay store's records and writes them into `<script id="__RELAY_DATA__" type="application/json">`
at the end of the page. The client reads that tag, seeds a new Store from it, and hydrates. The
first render finds every field already in the store, so there is no request and no mismatch.
Next.js does the same thing with page props under `__NEXT_DATA__`.

**Preloading per route.** For the server to render with data, it needs to know what data before
React runs. `src/routes.tsx` maps each URL pattern to its page's query and a function from URL
params to variables. `preloadRoute` runs that query into the Environment first. The same table is
used on the client for navigation.

**Executing in-process.** On the server the Relay Network does not `fetch('/graphql')`. It calls
GraphQL's `execute` directly with the schema and the index as context, in the same process. No
socket, no JSON round trip, no way for the server to deadlock waiting on itself.

**Status codes.** SSR has to decide `200` or `404` before the first byte. The route for
`/letter/:key` matches `/letter/nope`, so the match cannot decide. The preloaded store can: the
root field `letter(key:"nope")` resolved to `null`, so the server sends 404 and the not-found page.

## The interview answer

**"What is SSR, and why did you use it?"**

> Server-side rendering means the server runs the React components and sends finished HTML,
> instead of sending an empty shell and letting the browser build the page. The user sees content
> on the first paint, crawlers see real pages, and the site works with JavaScript off. The browser
> then loads the script and React hydrates: it attaches itself to the HTML that is already there
> rather than rebuilding it. For an archive of letters, which is content people search for and
> read, that was the right default. I used React's streaming renderer behind a small Hono server,
> with Vite in middleware mode in development so hot reload and SSR coexist.

**"What is hydration, and what is a hydration mismatch?"**

> Hydration is React taking ownership of server-rendered HTML: it renders once in memory, confirms
> the DOM matches, and wires up event handlers without recreating the nodes. A mismatch is when
> that in-memory render disagrees with the HTML, usually because the client had different data or
> something nondeterministic was rendered. React warns and may redraw, which costs time and can
> flash. In my app the server serializes the Relay store into the page and the client seeds its
> store from it, so the first client render reads exactly the data the server rendered. The e2e
> suite asserts there are no hydration errors in the console.

**"How does the data get from server to client?"**

> Each route declares its GraphQL query. The server runs it before rendering, executing the schema
> in-process rather than over HTTP, then renders with a store-only fetch policy so nothing fetches
> during render. After the HTML, it appends a JSON script tag with the store's records. The client
> reads that tag, builds its Relay environment from those records, and hydrates. On navigation the
> client's store-or-network policy fetches from `/graphql` like any SPA.

**Likely follow-ups**

- *"What does streaming buy if everything is preloaded?"* Little today beyond earlier CSS and
  script discovery. It matters when a route has a slow data dependency you want to send late
  inside a Suspense boundary, as a product page's reviews might.
- *"How does the server know to return 404?"* From the store, not the router: the preloaded root
  field is `null`.
- *"Where would a per-user cookie enter?"* In the request context: read the cart id from the
  cookie, put it in the GraphQL context, and never serialize anything user-specific into a page
  that could be cached.
- *"How does this map to Next.js?"* `routes.tsx` is `getServerSideProps`; `__RELAY_DATA__` is
  `__NEXT_DATA__`; `hydrateRoot` is the same call. Next decides the file layout and runs the same
  React APIs underneath.

## How it was built here

`GET /letter/440` arrives at Hono (`createSsrApp`):

1. The catch-all route calls `streamHtml`. It loads `dist/client/index.html` (the template Vite
   built, with the hashed client script) and the server bundle's `render`.
2. `render(url, options, ctx)` in `entry-server.tsx`:
   - makes a Relay Environment whose Network executes the schema in-process (`createServerFetch`);
   - `preloadRoute` matches the URL to a route and runs its query, filling the store;
   - `lookup` reads the store for the `<title>` and the status;
   - calls `renderToPipeableStream(<StaticRouter><App/></StaticRouter>)` and returns the head, the
     serialized store as `tail`, the status, and `pipe`/`abort`.
3. `streamHtml` writes the template's head, pipes React's output into the response, and when React
   finishes, appends the tail and the rest of the template.
4. The browser runs `entry-client.tsx`: reads `#__RELAY_DATA__`, seeds a Store, `hydrateRoot`s.

The details that took work, each a good interview story:

- **The shell race.** `onShellReady` can fire synchronously inside `render()` for a page with no
  Suspense boundary, before `render`'s result is assigned. Both sides call `flush()` and whichever
  runs second does the work. Read the comment in `streamHtml`.
- **Who closes the stream.** React ends whatever it pipes into. So the HTML after the app is
  written by a custom `Writable`'s `final`, not by an `onAllReady` callback that would race the pipe.
- **Serializing safely.** `serializeRecords` escapes `<` as `<` so data can never close the
  `<script>` tag.
- **No-JS home page.** React "outlines" a finished Suspense boundary larger than
  `progressiveChunkSize` (12.8 kB) behind an inline script, so a long page showed blank without
  JavaScript. Since all data is preloaded, `progressiveChunkSize: Infinity` sends it whole. Found by
  the no-JS e2e test (lesson 7).
- **Status from the store.** `/letter/nope` first returned 200 because the route matched.

## Compare with Next.js (what GN runs)

| Here | Next.js pages router |
| --- | --- |
| `routes.tsx` declares each page's query and variables | `getServerSideProps` returns props per request |
| Relay store serialized into `#__RELAY_DATA__` | props serialized into `__NEXT_DATA__` |
| `hydrateRoot` with the seeded store | Next hydrates with the props |
| Hono + `renderToPipeableStream` | Next's server, same React API underneath |

## Try it

```sh
cd apps/letters && pnpm build && NODE_ENV=production node server/index.ts
curl -s http://localhost:3001/letter/440 | head -c 1500          # real HTML, not an empty div
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/letter/nope
curl -s http://localhost:3001/letter/440 | grep -o '__RELAY_DATA__' | wc -l
```

Then in the browser with JavaScript disabled (devtools → Settings → Debugger → Disable JavaScript),
load `/`, `/letters`, `/letter/440`. Everything readable; links work; only paging needs JS. Turn JS
back on, reload, open the Network tab: no `/graphql` request on load. That absence is hydration
from the serialized store.

## Exercise

`pnpm learn 05`. 5a: predict the 404 case. 5b: find letter 440 in the serialized store. 5c: add
an `og:title` meta to the head in `entry-server.tsx` (a real, keepable change).

## Say it out loud, without notes

- What is SSR? What is CSR? Name one thing each gives up.
- What is hydration? What is a mismatch, and what in this design prevents one?
- What is streaming SSR, and what does it buy when all data is preloaded?
- Why execute GraphQL in-process on the server instead of fetching `/graphql`?
- How does the server pick the status code?
