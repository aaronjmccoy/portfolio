# Lesson 8: the component library

**Claim on the resume:** "Shared React primitives (Button, Dialog and Drawer on native `<dialog>`, Disclosure,
VariantPicker with radio-group semantics, Price, responsive Image, LiveRegion, SkipLink) with design
tokens, unit tests, and Storybook with the accessibility addon."

**Files:** `packages/ui/src/*.tsx`, `components.test.tsx`, `*.stories.tsx`, `tokens.css`,
`components.css`, `.storybook/`.

## The words

**Primitive.** A small, general component that a product component is built from: Button, Dialog,
Disclosure. It knows about behaviour and semantics, not about products or letters. A **component
library** is a package of primitives shared across apps; here `packages/ui`, used by letters, shop
and portfolio.

**Design tokens.** Named values for colour, spacing, type and radius (`--color-text`, `--space-3`)
defined once as CSS custom properties in `tokens.css`. Components use tokens, never raw values, so
a theme change is one file and light/dark is a swap of token values.

**Native first.** Start from the HTML element that already has the right semantics and keyboard
behaviour, then add only what is missing. `<dialog>` with `showModal()` gives focus trapping, Esc,
`inert` background and the right role for free; a `<div role="dialog">` has to reimplement all of
that and usually gets some of it wrong. `<details>`/`<summary>` is a disclosure. A radio group in a
`<fieldset>` with a `<legend>` is a single-choice picker. Relying on the platform is also what
makes the primitives work before hydration.

**`disabled` versus `aria-disabled`/`aria-busy`.** A `disabled` control is removed from the tab
order and often not announced, so the user cannot find out *why* it is unavailable. A busy button
or a sold-out variant should stay focusable and explain itself. That is the pattern to defend:
use `disabled` almost never for something the user needs to know about.

**Testing Library.** Tests that query the DOM the way assistive technology does:
`getByRole('radio', { name: '11×14, sold out' })`. If the test can find it that way, a screen reader
can. It does not look at class names or component internals.

**Storybook.** A separate app that renders each primitive in isolation, one "story" per state
(default, busy, sold out, open). Designers and reviewers can see every state without clicking
through the product. The **accessibility addon** runs axe on each story; set to `error`, a story
with a violation fails.

**Radix, for comparison.** The headless component library GN's sites use. It provides the
behaviour and ARIA for complex widgets (menus, comboboxes, tooltips) that HTML has no native
element for. Native first and Radix are complementary: use the element where one exists, Radix
where one does not.

## The interview answer

**"Tell me about the component library."**

> It is a small package of primitives shared by the three apps, built native first: Dialog and
> Drawer on the `<dialog>` element with `showModal`, Disclosure on `<details>`, the variant picker
> as a real radio group in a fieldset, Button on `<button>`. Each adds only what HTML lacks, like a
> controlled `open` prop or a `placement` for the drawer. Styling comes from design tokens as CSS
> custom properties. Every primitive has Testing Library tests that query by role and accessible
> name, and a Storybook story per state with the accessibility addon set to fail on any axe
> violation, so a regression shows up in review before it reaches a product page.

**"What is a decision in it you would defend?"**

> Not using `disabled` for state the user needs to know about. A busy button sets `aria-busy` and
> `aria-disabled` and keeps focus, because `disabled` would throw focus back to the top of the
> document mid-submit. A sold-out size stays a focusable radio whose name says "sold out", so a
> screen-reader user hears why instead of finding a gap. Both are tested through the accessible
> name, which is how I caught a leading space producing "11×14 , sold out".

**Likely follow-ups**

- *"Why native `<dialog>`?"* Focus trap, Esc, backdrop, `inert` outside, correct role, works
  before hydration; the component adds backdrop-click close and mounts children only when open.
- *"When is `disabled` right?"* When the control is irrelevant rather than unavailable, such as a
  "Next" button on the last page where there is nothing to explain.
- *"What makes a live region speak?"* A change in its text content while it is already in the DOM.
  The provider keeps the region mounted and clears then sets after 50 ms so the same message twice
  is still announced.
- *"How does this relate to Radix?"* Same goals; Radix covers widgets HTML lacks. I would use it
  for a combobox or a menu, and keep native elements for dialog and disclosure.

## How it was built here

| Primitive | Native element | What the component adds |
| --- | --- | --- |
| `Disclosure` | `<details>`/`<summary>` | controlled `open` and `onToggle` |
| `Dialog` | `<dialog>` + `showModal()` | Esc via `onCancel`, backdrop click, mount children only when open, `placement` for the drawer |
| `VariantPicker` | radio groups in `<fieldset>`/`<legend>` | chip styling; sold-out spoken through `VisuallyHidden`, not `disabled` |
| `Button` | `<button type="button">` | `busy` keeps focus (`aria-busy`, `aria-disabled`) |
| `Image` | `<img srcset sizes>` | Shopify CDN width URLs, never upscaled, lazy unless `priority` |
| `Price` | text | `Intl.NumberFormat`, a sale spoken as "was X, now Y" |
| `LiveRegionProvider` | `aria-live` regions | always mounted; cleared then set after 50 ms |
| `SkipLink` | `<a href="#main">` | visible on focus |

Testing Library did not clean up between tests because Vitest's globals are off, so
`vitest.setup.ts` registers `afterEach(cleanup)`. `formatMoney` is tested in `de-DE` as well as
`en-US`; the expected string contains a non-breaking space.

## Try it

```sh
pnpm --filter @portfolio/ui test
pnpm --filter @portfolio/ui storybook       # http://localhost:6006; open the Accessibility tab on any story
```

Change `Button`'s busy branch to set `disabled` and watch which test fails and why. Put it back.
In Storybook, open the Dialog story, press Tab repeatedly: focus never leaves the dialog. That is
the platform, not the component.

## Exercise

`pnpm learn 08`, in `apps/letters/src/learn/08-ui.test.tsx`: write two tests, for the sold-out
variant and for repeated announcements.

## Say it out loud, without notes

- What is a primitive? What are design tokens?
- What does "native first" mean, and what did `<dialog>` give you for free?
- When is `disabled` wrong, with the two examples?
- What does Testing Library query by, and why?
- What does Storybook's accessibility addon do in this repo?
