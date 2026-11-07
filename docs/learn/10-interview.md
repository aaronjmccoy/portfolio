# Lesson 10: talking about it

No code. This is the set of questions to be able to answer from memory, with a file name or a
number where one exists. Answer each out loud in under two minutes. If you cannot, go back to
that lesson.

## The two-minute tour

"I rebuilt a static archive of 1,836 scanned WWII letters as a server-rendered React app. The
filenames were the only metadata, so a parser builds an in-memory model at startup, a Pothos
schema exposes it as a Relay-spec GraphQL API, and the pages are Relay components with colocated
fragments. Each route declares its query, the server preloads it by executing the schema
in-process, streams the HTML, and embeds the Relay store so the client hydrates without a request.
Every page works without JavaScript. Playwright plus axe check every route for WCAG 2.2 AA, and
the thing ships as a Docker image that CI boots and renders a page from before pushing."

Practise until it is yours, not this text.

## Design questions

1. Why GraphQL for a read-only archive? What would REST have cost and saved?
2. Why Relay rather than Apollo or TanStack Query? Give one real advantage and one real cost.
3. Where is the N+1 problem in this schema, and why does it not matter here? Where would it matter?
4. How does SSR know the status code to send?
5. What is in the serialized store, and what could go wrong if it held user-specific data?
6. Why is the GraphQL endpoint executed in-process on the server?
7. The home page was blank without JavaScript. Why, and what fixed it?
8. What is hydration, what is a mismatch, and how do you avoid one when the server and client see different data?

## Accessibility questions

9. A scan is a picture of handwriting. What is its accessible equivalent, and what does the page do when there is none?
10. Why does focus move to `<main>` after navigation?
11. When is `disabled` wrong? Give the two examples from the component library.
12. What does axe not catch?

## Performance questions

13. Three WebP widths, `srcset`, `sizes`, `width`/`height`, `fetchPriority="high"` on the first scan, `loading="lazy"` on thumbnails: what does each one buy, and which metric does it move?
14. Where would you look first if a letter page's LCP were 4 seconds?
15. Lighthouse CI budgets: what are they, and what happens when a build misses one? (The shop wires this; say what you would wire.)

## Shipping questions

16. Walk through the Dockerfile stages and why `pnpm deploy` was not used.
17. What does CI prove about the image before it pushes?
18. How does an update go out, and what is never rebuilt?

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
