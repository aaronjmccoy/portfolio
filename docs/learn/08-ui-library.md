# Lesson 8: the component library

**Claim:** "Shared React primitives (Button, Dialog and Drawer on native `<dialog>`, Disclosure,
VariantPicker with radio-group semantics, Price, responsive Image, LiveRegion, SkipLink) with design
tokens, unit tests, and Storybook with the accessibility addon."

**Files:** `packages/ui/src/*.tsx`, `components.test.tsx`, `*.stories.tsx`, `tokens.css`,
`components.css`, `.storybook/`.

## The principle: native first

Every primitive starts from the HTML element that already has the semantics, and adds only what
HTML lacks:

| Primitive | Native element | What the component adds |
| --- | --- | --- |
| `Disclosure` | `<details>`/`<summary>` | a controlled `open` prop and an `onToggle` callback |
| `Dialog` | `<dialog>` + `showModal()` | Esc via `onCancel`, backdrop click, mount children only when open, `placement` for the drawer |
| `VariantPicker` | radio groups in `<fieldset>`/`<legend>` | chip styling; sold-out spoken through `VisuallyHidden`, not `disabled` |
| `Button` | `<button type="button">` | a `busy` state that keeps focus (`aria-busy`, `aria-disabled`) instead of `disabled`, which would drop focus |
| `Image` | `<img srcset sizes>` | Shopify CDN width URLs, never upscaled, lazy unless `priority` |
| `Price` | text | `Intl.NumberFormat`, a sale spoken as "was X, now Y" |
| `LiveRegionProvider` | `aria-live` regions | always mounted, so announcements are heard; cleared then set after 50 ms so repeats are spoken |
| `SkipLink` | `<a href="#main">` | visible on focus |

The pattern to be able to defend: **use `disabled` almost never on something the user needs to
know about.** A disabled control is skipped by Tab and often unannounced. Busy buttons and sold-out
variants stay focusable and explain themselves.

## Tests and stories

- `components.test.tsx` uses Testing Library through roles and accessible names only
  (`getByRole('radio', { name: '11×14, sold out' })`): if the test can find it that way, a screen
  reader can.
- Testing Library did not clean up between tests because Vitest's globals are off, so
  `vitest.setup.ts` registers `afterEach(cleanup)` explicitly.
- Storybook 10 with `addon-a11y` set to `test: 'error'`: a story with an axe violation fails. Each
  primitive has a story per state. `pnpm --filter @portfolio/ui build-storybook` makes the static
  site that will be served at `portfolio.aaronjmccoy.com/ui/`.
- `formatMoney` is tested in `de-DE` as well as `en-US`; the expected string contains a non-breaking
  space, which is the kind of detail a test catches and a glance does not.

## Try it

```sh
pnpm --filter @portfolio/ui test
pnpm --filter @portfolio/ui storybook       # http://localhost:6006; open the Accessibility tab on any story
```

Change `Button`'s busy branch to set `disabled` and watch the test fail, and why. Put it back.

## Exercise

`pnpm learn 08`, in `apps/letters/src/learn/08-ui.test.tsx`: write two tests, for the sold-out
variant and for repeated announcements.

## Say it out loud

- Why native `<dialog>` instead of a div with `role="dialog"`? What did you get for free?
- When is `disabled` right?
- What makes a live region speak, and why does an unchanged message stay silent?
- How does a design system on Radix (what the GN audio sites use) relate to this? What does Radix give that native elements do not?
