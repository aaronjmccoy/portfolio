# Learn the portfolio: a course on the code behind each resume claim

Every line in the application that says "I built X" has a lesson here. The goal is not to have
read the code; it is to be able to answer "What is SSR?" or "Why Relay?" in an interview, from
memory, in your own words, and then back the answer with something specific from this repo.

**What is assumed:** HTML, CSS, JavaScript, React components, and having called a REST API with
`fetch`. Nothing else. Every other term is defined before it is used.

## How each lesson is laid out

1. **The words.** Every term the lesson needs, defined from zero, with the problem it solves.
2. **The interview answer.** Scripted spoken answers to "What is it?" and "How did you use it?",
   plus the follow-ups an interviewer is likely to ask. Read them aloud; then rewrite them in your
   own voice.
3. **How it was built here.** The decisions and the mistakes, with file names.
4. **Trace it / Try it.** Something to do with the running app so the words attach to a picture.
5. **Exercise.** A test that fails until you do it.
6. **Say it out loud, without notes.** The check. When you can answer those and the test passes,
   you own the claim.

Start with [lesson 0, the glossary](00-glossary.md). Skim it once, then use it as a reference.
Do the rest in order; each takes 45 to 90 minutes.

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
Lesson 7's exercise is a Playwright spec and runs separately. Lesson 9 has no test.

## Lessons

| # | Lesson | Resume claim it backs | Exercise |
| --- | --- | --- | --- |
| 0 | [The words](00-glossary.md) | every term, in interview form | none |
| 1 | [The archive index](01-archive-index.md) | "an archive of 1,836 scanned letters" | predict, write |
| 2 | [The GraphQL schema](02-graphql-schema.md) | "Designed a Relay-spec GraphQL API (Pothos + GraphQL Yoga)" | change |
| 3 | [The Relay server spec](03-relay-spec.md) | "Node interface, connections, pagination" | write |
| 4 | [Relay on the client](04-relay-client.md) | "React 19 + Relay reader", "Relay queries load per route" | predict, write |
| 5 | [SSR and hydration](05-ssr-hydration.md) | "streaming SSR", "the record store is serialized and hydrated" | predict, change |
| 6 | [The image pipeline](06-image-pipeline.md) | "5,511 responsive WebP renditions with sharp" | predict |
| 7 | [Accessibility, end to end](07-accessibility-e2e.md) | "axe reports zero violations on every route", "works without JavaScript" | write (Playwright) |
| 8 | [The component library](08-ui-library.md) | "Shared React primitives ... Storybook with the accessibility addon" | write |
| 9 | [Shipping it](09-shipping.md) | "Docker image built and smoke-tested in GitHub Actions, deployed behind Caddy" | hands-on, no test |
| 10 | [Talking about it](10-interview.md) | the whole application | definitions round + design questions |

## Progress

- [ ] 0 Glossary skimmed
- [ ] 1 Archive index
- [ ] 2 GraphQL schema
- [ ] 3 Relay server spec
- [ ] 4 Relay client
- [ ] 5 SSR and hydration
- [ ] 6 Image pipeline
- [ ] 7 Accessibility e2e
- [ ] 8 Component library
- [ ] 9 Shipping
- [ ] 10 Both rounds answered without notes

## Ground rules

- Say the answers out loud. Reading an answer and recognising it is not the same as producing it.
- Read the file before the lesson's explanation of it. The explanation should confirm what you saw.
- When a test fails, read the failure before touching code. The message tells you what the code does.
- `git diff` after every exercise that changes the app. If a change would be wrong to ship, revert it
  (`git checkout -- <file>`); the exercises in lessons 2 and 5 are small enough to keep.
- The shop lessons (Storefront API, Cart API, the importer, the growth experiment) are written when that code exists.
