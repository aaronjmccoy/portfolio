# Lesson 7: accessibility, end to end

**Claim:** "Scans get accessible equivalents", "keyboard paging", "a reader that works without JavaScript",
"Playwright and axe end-to-end checks on every route", "focus moves to the heading on route change".

**Files:** `apps/letters/e2e/reader.spec.ts`, `playwright.config.ts`, `src/App.tsx` (`Main`, `SiteNav`),
`src/pages/LetterPage.tsx`, `packages/ui/src/SkipLink.tsx`.

## What "accessible" means in this app, concretely

| Need | Where | How |
| --- | --- | --- |
| A scan is an image of text | `LetterPage` | The transcription beside it is the equivalent; the `alt` says whether one exists; `<figure>`/`<figcaption>` per page |
| Paging by keyboard | `LetterPage` key handler | Arrows turn pages anywhere on the page except in form fields; buttons and thumbnails also work; `aria-current` marks the current thumbnail |
| Route change in a SPA is silent | `App.tsx` `Main` | After navigation, focus moves to `<main tabIndex={-1}>` so screen readers and keyboard users land on the new page |
| Where am I | `SiteNav` | `aria-current="page"` on the exact tab, `"true"` on the section |
| Skip the header | `SkipLink` | First focusable element, visible on focus |
| JavaScript off | SSR (lesson 5) | Every route is complete HTML; links are links |
| Status messages | `Loading…` with `role="status"` | Announced, not just shown |

## The test suite

`reader.spec.ts` runs against the **production build** on its own ports (`playwright.config.ts`
boots `node server/index.ts` with `NODE_ENV=production`). Each test does one thing a user does:

- SSR checks assert the `<title>` and status come from the server (`page.goto` response).
- `expectNoA11yViolations` runs axe with the WCAG 2.0/2.1/2.2 A and AA tags plus best practices.
  Zero violations is the bar on every route, including after interaction (open lightbox, loaded
  more letters).
- `turnPageWhenHydrated` is the pattern worth remembering: the server HTML is interactive-looking
  before React has hydrated, so the test presses a key until the caption changes, with a timeout.
  Polling for hydration beats sleeping.
- Two tests run with `javaScriptEnabled: false`.
- The 404 test checks both the status and that the page offers a way back.

## What the tests found

- The home page rendered blank without JavaScript (the Suspense outlining in lesson 5).
- `/letter/nope` returned 200.
- Accessible names: a `<VisuallyHidden>` that began with a space produced "11×14 , sold out" in
  the accessibility tree; the fix was to put the comma inside the hidden span.

## Try it

```sh
cd apps/letters
pnpm build
pnpm e2e                      # all specs, headless
pnpm e2e --headed reader      # watch it
pnpm exec playwright show-report
```

Then test by hand, which no tool replaces: Tab through `/letter/440` from the top. Open NVDA
(free) and read the same page. Note what is announced for a thumbnail, the caption, the
transcription heading.

## Exercise

`e2e/learn-07.spec.ts`: write step 2 of the test, then run it with `LEARN=1` as the file says.

## Say it out loud

- What does axe catch, and what does it not catch? Name two things only a human finds.
- Why move focus to `<main>` after navigation and not to the `<h1>`? What are the trade-offs?
- Why run e2e against the production build rather than the dev server?
- What is the accessible name of the "Page 3" thumbnail, and where does it come from?
