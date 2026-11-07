# Lesson 0: the words

Read this before anything else, and come back to it whenever a lesson uses a term you cannot
define out loud. Each entry is written the way you would say it in an interview: what the thing
*is*, what problem it solves, and where it shows up in this repo. Nothing here assumes more than
HTML, CSS, JavaScript, React components and having called a REST API with `fetch`.

The entries are grouped the way the lessons are, not alphabetically, because each group is one
idea seen from a few angles.

## Where code runs

**Client.** The user's browser. Everything React does by default happens here, after the
JavaScript downloads.

**Server.** A program on a machine you control that answers HTTP requests. In this repo it is a
Node process (`server/index.ts`) running on VM 104, behind Caddy.

**Rendering.** Turning components plus data into HTML. The question "where does rendering
happen?" is the whole SSR topic.

**Client-side rendering (CSR).** The server sends a nearly empty HTML file and a script; the
browser downloads the script, runs React, fetches data, and only then draws the page. It is what
a plain Vite React app or create-react-app does. Cost: a blank page until the script runs, and
search engines or users with JavaScript off see nothing.

**Server-side rendering (SSR).** The server runs the same React components *on the server*,
produces the finished HTML, and sends it. The browser shows a complete page immediately. Then the
script downloads and React takes over the page that is already there (see hydration). Everything
in this repo is SSR. Not to be confused with Relay: SSR is about *where rendering happens*, Relay
is about *how data is fetched*.

**Streaming SSR.** Instead of building the whole HTML string and then sending it, the server
starts sending the top of the page while React is still working on the rest. React's API for it
is `renderToPipeableStream`. Benefit: the browser can begin parsing and loading CSS before the
server has finished.

**Hydration.** After SSR, the browser has HTML but no React state or event handlers. Hydration is
React attaching itself to that existing HTML: it renders the components once more in memory,
checks the result matches what the server sent, and wires up the handlers. React's call is
`hydrateRoot`. After hydration the page behaves like a normal React app.

**Hydration mismatch.** When the client's first render produces different HTML from the server's.
React warns and may redraw the page. Classic causes: the server and client fetched different
data, or a component rendered `Date.now()`. The fix in this repo is that the client starts from
the exact data the server used (the serialized store).

**Serialization.** Turning in-memory data into a string, here JSON, so it can travel inside the
HTML. The server puts its data into a `<script type="application/json">` tag; the client reads it
back. Next.js calls its tag `__NEXT_DATA__`; this repo calls it `__RELAY_DATA__`.

**Single-page application (SPA).** After the first load, clicking a link does not reload the
page; JavaScript swaps the content and changes the URL. This repo is an SPA *after* hydration and
plain HTML pages before it, so links work either way.

**Route.** A URL pattern mapped to a page component, such as `/letter/:key` → `LetterPage`.
react-router does the matching. In this repo each route also declares which data query it needs
(`src/routes.tsx`), which is what lets the server fetch data before rendering.

## Talking to the server for data

**API.** An agreed way for one program to ask another for data. A web API is a set of URLs and
request/response shapes.

**REST.** The common API style: one URL per resource (`/letters/440`, `/sections/ch3/letters`), the
server decides what fields come back. Simple; but a page that needs several resources makes
several round trips, and every client gets every field whether it needs it or not.

**GraphQL.** An API style with one URL (`/graphql`) where the *client* sends a description of
exactly the data it wants, shaped like the result it wants back, and the server fills it in. One
request can fetch a letter, its section and its neighbours. The server publishes a typed
**schema** so the client knows what it can ask for.

**Schema.** The typed contract of a GraphQL API: which types exist (`Letter`, `Section`), which
fields each has (`number: Int!`), and what you can ask for at the top (`Query.letter(key:)`).
Written in GraphQL's schema language (SDL) or generated from code. `apps/letters/schema/schema.graphql`
is this repo's; it is generated from TypeScript.

**Type, field, argument.** `Letter` is a type. `pageCount` is a field on it. `letter(key: "440")`
is a field with an argument. `Int!` means an integer that is never null; `Int` without the `!`
may be null.

**Query vs mutation.** A query reads. A mutation writes (add to cart). The letters API has only
queries; the shop will have mutations.

**Resolver.** The function that produces one field's value. GraphQL execution is: for each field
the client asked for, call its resolver with the parent object, the arguments and a shared
`context`. Resolvers nest: `letter` runs, then `previous` runs with that letter as its parent.

**Context.** An object every resolver receives. Here it carries the in-memory archive index, so
resolvers are map lookups and never do I/O.

**Code-first vs schema-first.** Schema-first: write the SDL by hand, then write resolvers that
hopefully match. Code-first: write typed code and *generate* the SDL from it, so a mismatch is a
compile error. This repo is code-first with **Pothos**, a TypeScript schema builder.

**GraphQL Yoga.** The HTTP server for GraphQL used here: it parses the incoming request, validates
it against the schema, runs the resolvers, and returns JSON. It is mounted on the web framework at
`/graphql`.

**GraphiQL.** A browser UI for writing queries against a running GraphQL server. On at
`http://localhost:3001/graphql` in development.

**Hono.** The small web framework (like Express) that routes HTTP requests in this repo: `/graphql`
to Yoga, `/healthz`, and everything else to the React renderer.

**N+1 problem.** A list resolver returns 50 letters, then a nested resolver runs once per letter
and each does a database query: 1 + 50 queries. Solved with batching (DataLoader). Not an issue
here because the data is in memory.

## Relay

**Relay.** Facebook's GraphQL *client* library for React. Where Apollo or TanStack Query let you
fetch however you like, Relay has opinions: components declare their data needs as fragments, a
compiler checks every query against the schema before the app runs, and all fetched data lives in
one normalized store. In this repo the React pages (`src/pages/*.tsx`) are Relay components.
There is no such thing as a "render Relay"; Relay fetches, React renders.

**Relay-spec (server side).** A set of conventions a GraphQL server follows so Relay's client can
make assumptions: every refetchable object has a globally unique `id` and implements `Node`;
paginated lists are **connections**; mutations take one `input`. Shopify's Storefront API follows
the same spec, which is why learning it here transfers to the shop.

**Node interface and global id.** `interface Node { id: ID! }`. The `id` must be unique across
*all* types, not just within `Letter`, so the client can keep one record per object. Pothos builds
it as base64 of `Letter:440`, giving `TGV0dGVyOjQ0MA==`. `Query.node(id:)` fetches any Node by id.

**Connection, edge, cursor, pageInfo.** The Relay shape for a paginated list. `letters(first: 50,
after: "<cursor>")` returns `{ edges: [{ cursor, node }], pageInfo: { hasNextPage, endCursor } }`.
A cursor is an opaque string that marks a position; you send the last one back as `after` to get
the next page. Compared with `offset`/`limit`, cursors stay correct when items are inserted while
you page.

**Fragment.** A named, reusable piece of a query, attached to a type: `fragment ChapterPage_letters
on Section { ... }`. In Relay a component owns a fragment describing exactly the fields it renders,
and the page's query spreads the fragments of the components it contains. This is **colocation**:
data needs live beside the UI that uses them.

**Fragment masking.** A component only sees the fields its own fragment asked for, even though the
query fetched more. It prevents one component silently depending on a field another component
requested; delete that other component and nothing breaks.

**Relay compiler and artifacts.** `relay-compiler` reads every `graphql` tag in `src/`, validates
it against the schema, and writes a generated file per query or fragment into `src/__generated__/`:
the query text, instructions for reading and writing the store, and TypeScript types. Errors show
up at compile time, not in the browser.

**Environment, Network, Store.** The three Relay runtime objects. The Store holds records; the
Network knows how to send an operation (here, `fetch` to `/graphql` on the client, and a direct
in-process call to the schema on the server); the Environment ties them together and is what
hooks like `useLazyLoadQuery` use.

**Normalized store.** Responses are not kept as nested blobs. Each object with an `id` becomes one
flat record keyed by its global id, and other records point to it by reference. Two queries that
both return letter 440 share one record, so an update in one place shows everywhere.

**fetchPolicy.** Tells a query whether to use the store, the network, or both. `store-only` on the
server (the data was preloaded; never fetch during render); `store-or-network` on the client (use
what the server embedded; fetch only on navigation).

**`@connection`, `@refetchable`, `usePaginationFragment`.** The Relay pieces for "Show more": the
directive marks a connection field so new pages append; the compiler generates a refetch query;
the hook gives `loadNext`.

## Build and test tooling

**Vite.** The dev server and bundler. In development it serves source files transformed on the
fly; for production it bundles. A **Vite plugin** can rewrite source as it passes through; this
repo has one that replaces each `graphql` tag with an import of its compiled artifact.

**Vitest.** The unit test runner (Jest-compatible API, runs on Vite).

**Playwright.** Drives a real browser from a script. Used for end-to-end tests: load the page,
click, assert what a user would see.

**End-to-end (e2e) test.** A test that runs the whole system (server, browser, real HTML) rather
than one function. Slower, catches what unit tests cannot (a page blank without JavaScript).

**Testing Library.** Helpers for testing React components by what a user perceives: find things
by role and accessible name, not by CSS class.

**Storybook.** A separate app that renders each UI component in isolation, one "story" per state.
With the accessibility addon, each story is checked by axe.

**Monorepo / pnpm workspace.** One git repo holding several packages (`apps/letters`,
`packages/ui`, `packages/ssr`) that depend on each other by name. pnpm links them.

## Images and performance

**Rendition.** A resized copy of an original image. Here three WebP widths per scan.

**Responsive images, `srcset`, `sizes`.** `<img srcset="a-320.webp 320w, a-800.webp 800w, ..."
sizes="(max-width: 600px) 100vw, 800px">` lets the browser pick the smallest file that fills the
slot at the current viewport and pixel density. The server lists the candidates; the browser
chooses.

**WebP.** An image format about 30% smaller than JPEG at the same quality.

**sharp.** The Node image library used to resize and convert. Fast because it wraps libvips.

**CLS (Cumulative Layout Shift).** A Core Web Vital: how much the page jumps while loading.
Putting `width` and `height` on `<img>` lets the browser reserve the box before the file arrives,
so nothing jumps.

**LCP (Largest Contentful Paint).** A Core Web Vital: when the biggest visible element finished
rendering. For a letter page that is the first scan; `fetchPriority="high"` on it helps.

**Idempotent.** Running it again changes nothing. The image script is idempotent: existing
renditions are left alone.

## Accessibility

**Accessibility (a11y).** Making the page usable by people who navigate by keyboard, screen
reader, magnification or voice. In practice: correct HTML semantics, names on controls, visible
focus, no information carried by colour alone.

**WCAG 2.2 AA.** The Web Content Accessibility Guidelines, version 2.2, conformance level AA. The
standard most legal requirements and audits cite. "Zero axe violations at AA" is the bar in this
repo's tests.

**axe.** An automated accessibility checker (by Deque). Finds roughly a third of issues: missing
names, bad contrast, wrong ARIA. It cannot judge whether an `alt` text is *good* or whether the
tab order makes sense; a person does that.

**Accessible name.** What a screen reader says for a control: from its text, its `<label>`,
`aria-label`, or `aria-labelledby`. A button with only an icon has no name unless you give it one.

**Role.** What kind of thing an element is to assistive technology: button, link, radio, status.
Native elements have the right role built in; `<div onClick>` has none.

**ARIA.** Attributes that add semantics when HTML lacks them: `aria-current`, `aria-live`,
`aria-busy`. Rule one of ARIA: use the native element instead if one exists.

**Live region.** An element with `aria-live` (or `role="status"`) whose text changes are announced
by screen readers without moving focus. Used for "Page 3 of 4" and "Added to cart".

**Focus management.** Deciding where keyboard focus goes after something changes. In an SPA a route
change is silent unless you move focus to the new content.

**Skip link.** The first link on the page, visible when focused, that jumps past the header to
`<main>`.

## Shipping

**Docker image / container.** An image is a frozen filesystem with your app and its runtime; a
container is that image running. The same image runs on your laptop, in CI and on the VM.

**Dockerfile and multi-stage build.** The recipe for an image. Multi-stage means several `FROM`
sections: one installs and builds with all the dev tools, the last copies only the built output
into a clean small image.

**Docker Compose.** A YAML file describing how to run one or more containers (ports, volumes,
limits) with one command.

**CI (continuous integration).** Automated checks on every push, here GitHub Actions: lint,
typecheck, tests, builds, e2e, then build the Docker image, boot it, and push it to a registry.

**Smoke test.** The cheapest test that proves the thing is alive: boot it and load one page.

**Registry (GHCR).** Where built images are stored and pulled from. GitHub Container Registry
here.

**Reverse proxy.** A server in front of your app that terminates HTTPS and forwards requests.
Caddy here: it also serves the scans and renditions as static files and gets certificates
automatically.

**Loopback vs LAN address.** `127.0.0.1` is reachable only from the same machine; `192.168.88.5`
from the local network. The app listens on loopback (only Caddy talks to it); metrics listen on
the LAN address (only the monitoring VM, enforced by a firewall rule).

**Prometheus metrics.** A `/metrics` text endpoint with counters and histograms (requests, GraphQL
operations) that a Prometheus server scrapes on a schedule.

**Pinning by digest.** Referring to an image by its content hash rather than the `latest` tag, so
a deploy is reproducible.
