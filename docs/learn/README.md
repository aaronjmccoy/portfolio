# Learn the portfolio: a course on the code behind each resume claim

Every line in the application that says "I built X" has a lesson here that walks the real
code, explains the decisions and the mistakes along the way, and ends with an exercise checked
by a test. Do the lessons in order; each one takes 45 to 90 minutes. When a lesson's tests pass
and you can answer its "Say it out loud" questions without notes, you own that claim.

## Setup (once)

```sh
pnpm install
pnpm exec playwright install chromium      # lesson 7 only
cd apps/letters
pnpm build                                  # prints the schema, compiles Relay, builds client + server
pnpm dev                                    # http://localhost:3001, GraphiQL at /graphql
```

Open the repo in VS Code with `apps/letters` as the working folder. Keep three things open while
you study: the lesson, the file it points at, and GraphiQL in the browser.

## Running the exercises

Exercises live in `apps/letters/src/learn/` and run with their own Vitest config, so they never
touch `pnpm test` or CI. They fail until you do them; that is the point.

```sh
cd apps/letters
pnpm learn            # every lesson
pnpm learn 03         # one lesson, by its number
```

Each exercise is one of three kinds: **predict** (read the code, fill in what it will produce),
**write** (add a field, a query or an assertion), or **change** (make a small real change to the app).
Lesson 7's exercise is a Playwright spec and runs separately (see the lesson). Lesson 9 has no test.

## Lessons

| # | Lesson | Resume claim it backs | Exercise |
| --- | --- | --- | --- |
| 1 | [The archive index](01-archive-index.md) | "an archive of 1,836 scanned letters" | predict, write |
| 2 | [The GraphQL schema](02-graphql-schema.md) | "Designed a Relay-spec GraphQL API (Pothos + GraphQL Yoga)" | change |
| 3 | [The Relay server spec](03-relay-spec.md) | "Node interface, connections, pagination" | write |
| 4 | [Relay on the client](04-relay-client.md) | "React 19 + Relay reader", "Relay queries load per route" | predict, write |
| 5 | [SSR and hydration](05-ssr-hydration.md) | "streaming SSR", "the record store is serialized and hydrated" | predict, change |
| 6 | [The image pipeline](06-image-pipeline.md) | "5,511 responsive WebP renditions with sharp" | predict |
| 7 | [Accessibility, end to end](07-accessibility-e2e.md) | "axe reports zero violations on every route", "works without JavaScript" | write (Playwright) |
| 8 | [The component library](08-ui-library.md) | "Shared React primitives ... Storybook with the accessibility addon" | write |
| 9 | [Shipping it](09-shipping.md) | "Docker image built and smoke-tested in GitHub Actions, deployed behind Caddy" | hands-on, no test |
| 10 | [Talking about it](10-interview.md) | the whole application | questions |

## Progress

- [ ] 1 Archive index
- [ ] 2 GraphQL schema
- [ ] 3 Relay server spec
- [ ] 4 Relay client
- [ ] 5 SSR and hydration
- [ ] 6 Image pipeline
- [ ] 7 Accessibility e2e
- [ ] 8 Component library
- [ ] 9 Shipping
- [ ] 10 Interview questions answered without notes

## Ground rules

- Read the file before the lesson's explanation of it. The explanation should confirm what you saw, not replace seeing it.
- When a test fails, read the failure before touching code. The exercises are written so the message tells you what the code does.
- `git diff` after every exercise that changes the app. If a change would be wrong to ship, revert it (`git checkout -- <file>`); the exercises in lessons 2 and 5 are small enough to keep.
- The shop lessons (Storefront API, Cart API, the importer, the growth experiment) are written when that code exists.
