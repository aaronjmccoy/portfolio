# Lesson 7: accessibility, end to end

**Claim on the resume:** "Scans get accessible equivalents", "keyboard paging", "a reader that works without
JavaScript", "Playwright and axe end-to-end checks on every route", "focus moves to the heading on route change".

**Files:** `apps/letters/e2e/reader.spec.ts`, `playwright.config.ts`, `src/App.tsx` (`Main`, `SiteNav`),
`src/pages/LetterPage.tsx`, `packages/ui/src/SkipLink.tsx`.

## The words

**Accessibility (a11y).** Building so that people who use a keyboard only, a screen reader,
magnification, voice control or reduced motion can use the page. Most of it is using HTML for
what it means: a button is a `<button>`, a heading is an `<h2>`, an image has `alt`.

**WCAG 2.2 AA.** The Web Content Accessibility Guidelines, the standard audits and laws cite.
Level A is the floor, AA is what organisations commit to, AAA is aspirational. 2.2 is the current
version (2023). "WCAG 2.2 AA" is the phrase to use.

**Accessible name and role.** Every control has a *role* (button, link, radio, group) and a *name*
(what a screen reader says). Native elements get the role free; the name comes from the text
content, a `<label>`, `aria-label` or `aria-labelledby`. A thumbnail button whose content is an
image needs a name like "Page 3". Testing by role and name is testing what assistive technology
sees.

**ARIA.** Attributes that add semantics HTML lacks. `aria-current="page"` marks the current nav
item; `aria-live` or `role="status"` makes text changes announced; `aria-busy` marks a control that
is working. First rule: if a native element does the job, use it instead of ARIA.

**Live region.** An element whose text changes are read aloud without moving focus. "Page 3 of 4"
after a key press, "Loading…" during a fetch.

**Focus management.** In a single-page app, clicking a link swaps the content but focus stays on
the link that was clicked, so a screen-reader user hears nothing. After navigation this app moves
focus to `<main>` so the new page is announced and the next Tab lands inside it.

**Skip link.** A visually hidden link, first in the tab order, shown on focus, that jumps to
`<main>`. Saves keyboard users tabbing through the header on every page.

**Accessible equivalent.** For an image of text, the text. A scan's equivalent is its
transcription, shown beside it. The `alt` says whether one exists.

**axe.** Deque's automated checker. It finds about a third of real issues deterministically:
missing names, contrast, invalid ARIA, missing landmarks. It cannot judge whether an `alt` is
useful, whether the reading order makes sense, or whether focus went somewhere sensible.

**Playwright and end-to-end tests.** Playwright drives a real Chromium from a script. An e2e test
boots the production server, loads a page, acts like a user, and asserts what the user would see.
It catches whole-system bugs unit tests cannot, such as a page that renders blank without
JavaScript. `@axe-core/playwright` runs axe inside those tests.

## The interview answer

**"How do you approach accessibility?"**

> Native HTML first, then ARIA only for what HTML cannot say, then test it two ways. On the letters
> reader that meant a `<figure>` per scan with its transcription as the accessible equivalent,
> real buttons for paging with names like "Page 3" and `aria-current` on the active one, arrow-key
> paging, a live region that announces "Page 3 of 4", a skip link, and focus moved to `<main>` after
> every route change because a client-side navigation is otherwise silent. Then automated checks:
> Playwright drives the production build on every route, including after interactions like opening
> the lightbox, and axe asserts zero WCAG 2.2 AA violations. And a manual pass with a keyboard and
> NVDA, because axe cannot tell you whether what it announces makes sense.

**"What does your e2e suite cover?"**

> It runs against the production build, not the dev server, so it tests what ships. It checks that
> titles and status codes come from the server, that pagination and keyboard paging work, that
> focus lands in `main` after navigation, that there are no hydration errors in the console, that
> the pages are readable with JavaScript disabled, that the 404 page offers a way back, and axe on
> every route. The useful pattern was polling for hydration: server HTML looks interactive before
> React has attached handlers, so the test presses a key until the caption changes instead of
> sleeping.

**"What did the tests find?"**

> Three things I would not have seen by hand. The home page rendered blank without JavaScript
> because React hides a large Suspense boundary behind an inline script; a route that matched but
> had no data returned 200 instead of 404; and a visually hidden span that began with a space gave a
> radio the name "11×14 , sold out" with a floating comma.

**Likely follow-ups**

- *"What does axe not catch?"* Meaningless alt text, confusing focus order, a live region that
  says the wrong thing, a modal that traps nothing. People catch those.
- *"Why focus `<main>` rather than the `<h1>`?"* `<main>` is always there and announces the
  landmark; the heading is sometimes visually hidden or absent. Either is defensible; the point is
  that focus moves.
- *"Why test the production build?"* Dev mode differs: no minification, Vite's module graph, extra
  React checks. Bugs in the no-JS path only exist in the built HTML.

## How it was built here

| Need | Where | How |
| --- | --- | --- |
| A scan is an image of text | `LetterPage` | Transcription beside it; `alt` says whether one exists; `<figure>`/`<figcaption>` per page |
| Paging by keyboard | `LetterPage` key handler | Arrows turn pages except in form fields; buttons and thumbnails too; `aria-current` on the current thumbnail |
| Route change in a SPA is silent | `App.tsx` `Main` | After navigation, focus moves to `<main tabIndex={-1}>` |
| Where am I | `SiteNav` | `aria-current="page"` on the exact tab, `"true"` on the section |
| Skip the header | `SkipLink` | First focusable element, visible on focus |
| JavaScript off | SSR (lesson 5) | Every route is complete HTML; links are links |
| Status messages | `Loading…` with `role="status"` | Announced, not just shown |

`reader.spec.ts` runs against the production build on its own ports (`playwright.config.ts` boots
`node server/index.ts` with `NODE_ENV=production`). `expectNoA11yViolations` runs axe with the
WCAG 2.0/2.1/2.2 A and AA tags plus best practices. `turnPageWhenHydrated` is the polling
pattern. Two tests run with `javaScriptEnabled: false`.

## Try it

```sh
cd apps/letters
pnpm build
pnpm e2e                      # all specs, headless
pnpm e2e --headed reader      # watch it
pnpm exec playwright show-report
```

Then by hand, which no tool replaces: Tab through `/letter/440` from the top; note where focus
goes and whether you can always see it. Install NVDA (free) and read the same page: what is
announced for a thumbnail, the caption, the transcription heading. Then open the devtools
Accessibility panel on the "Page 3" button and read its computed name and role.

## Exercise

`e2e/learn-07.spec.ts`: write step 2 of the test, then run it with `LEARN=1` as the file says.

## Say it out loud, without notes

- What is WCAG 2.2 AA? What is an accessible name? What is a live region?
- What does axe catch, and what does it not? Name two things only a human finds.
- Why move focus after navigation, and where?
- Why run e2e against the production build rather than the dev server?
- What is the accessible name of the "Page 3" thumbnail, and where does it come from?
