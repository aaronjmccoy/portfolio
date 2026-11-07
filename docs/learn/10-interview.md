# Lesson 10: talking about it

No code. Two rounds of questions. Round one is definitions: short, from memory, the kind an
interviewer uses to find out whether the resume is yours. Round two is design: the two-minute
answers, with a file name or a number where one exists. If an answer will not come, the lesson
number beside it is where to go back to.

## Round one: definitions (30 seconds each)

Say each one out loud. Lesson 0 has a model answer for every term; yours should be shorter.

| Question | Lesson |
| --- | --- |
| What is server-side rendering? What is client-side rendering? | 5 |
| What is hydration? What is a hydration mismatch? | 5 |
| What is streaming SSR? | 5 |
| What is GraphQL, and how is it different from REST? | 2 |
| What is a schema? A resolver? Context? | 2 |
| What does code-first mean? | 2 |
| What is Relay? How is it different from Apollo? | 4 |
| What is a fragment? What is colocation? What is fragment masking? | 4 |
| What is a normalized store? | 4 |
| What does the Relay compiler produce? | 4 |
| What makes a GraphQL server "Relay-spec"? | 3 |
| What is a connection? An edge? A cursor? | 3 |
| What is a global id, and why must it be global? | 3 |
| Cursor versus offset pagination? | 3 |
| What is `srcset`? What is `sizes`? | 6 |
| What is CLS? What is LCP? | 6 |
| What is idempotent? | 6 |
| What is WCAG 2.2 AA? | 7 |
| What is an accessible name? A role? A live region? | 7 |
| What does axe find, and what does it miss? | 7 |
| What is an end-to-end test? | 7 |
| What is a design token? What is a primitive? | 8 |
| What is a multi-stage Docker build? | 9 |
| What is a smoke test? | 9 |
| What is a reverse proxy? | 9 |

## The two-minute tour

"I rebuilt a static archive of 1,836 scanned WWII letters as a server-rendered React app. The
filenames were the only metadata, so a parser builds an in-memory model at startup, a Pothos
schema exposes it as a Relay-spec GraphQL API, and the pages are Relay components with colocated
fragments. Each route declares its query, the server preloads it by executing the schema
in-process, streams the HTML, and embeds the Relay store so the client hydrates without a request.
Every page works without JavaScript. Playwright plus axe check every route for WCAG 2.2 AA, and
the thing ships as a Docker image that CI boots and renders a page from before pushing."

Practise until it is yours, not this text. Every noun in it is in round one.

## Round two: design (two minutes each)

1. Why GraphQL for a read-only archive? What would REST have cost and saved? (2)
2. Why Relay rather than Apollo or TanStack Query? One real advantage, one real cost. (4)
3. Where is the N+1 problem in this schema, and why does it not matter here? Where would it? (2)
4. How does SSR know the status code to send? (5)
5. What is in the serialized store, and what could go wrong if it held user-specific data? (5)
6. Why is GraphQL executed in-process on the server? (5)
7. The home page was blank without JavaScript. Why, and what fixed it? (5, 7)
8. How do you avoid a hydration mismatch when the server and client could see different data? (5)
9. A scan is a picture of handwriting. What is its accessible equivalent, and what does the page do when there is none? (7)
10. Why does focus move to `<main>` after navigation? (7)
11. When is `disabled` wrong? The two examples from the component library. (8)
12. Three WebP widths, `srcset`, `sizes`, `width`/`height`, `fetchPriority="high"` on the first scan, `loading="lazy"` on thumbnails: what does each buy, and which metric does it move? (6)
13. Where would you look first if a letter page's LCP were 4 seconds? (6)
14. Walk through the Dockerfile stages and why `pnpm deploy` was not used. (9)
15. What does CI prove about the image before it pushes? (9)
16. How does an update go out, and what is never rebuilt? (6, 9)

## Mapping to GN's stack

- Jabra Enhance runs Next.js (pages router) on a headless Shopify backend with a GraphQL layer in
  front of Payload CMS. Be fluent in: `getServerSideProps` versus this repo's `routes.tsx`
  preload; Next's `__NEXT_DATA__` versus `__RELAY_DATA__`; `next/image` versus the `Image`
  primitive; Relay as the data layer on top of either.
- Shopify's Storefront API is Relay-spec: `products(first:, after:)`, global ids, `Cart` mutations
  with `input` and payloads. Lessons 3 and 4 are the preparation; the shop app is the practice.
- Growth tooling there is Segment and Amplitude. Describe the experiment in those words: an event
  per funnel step, a user property for the variant, a cohort per variant.

## Claims not yet backed by code

From the application's "Before sending" checklist: the headless storefront, the Cart API work, the
importer, the Liquid templates, the growth experiment, and portfolio.aaronjmccoy.com. Lessons for
those are written as they are built. Until then, do not claim them in a conversation.
