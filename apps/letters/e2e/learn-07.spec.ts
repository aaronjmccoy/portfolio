/**
 * Lesson 7 exercise: accessibility checks end to end.
 * Read docs/learn/07-accessibility-e2e.md first. Needs a build, then:
 *
 *   bash:        LEARN=1 pnpm e2e learn-07
 *   PowerShell:  $env:LEARN = '1'; pnpm e2e learn-07
 *
 * Skipped without LEARN so CI never runs an unfinished exercise.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.skip(!process.env['LEARN'], 'lesson 7 exercise: set LEARN=1 to run it');

test('7a: thumbnails are named buttons, paging updates the caption, and the page stays accessible', async ({ page }) => {
  await page.goto('/letter/440');

  // Step 1 (given): the pager is a group named "Pages" holding one button per scan.
  const pager = page.getByRole('group', { name: 'Pages' });
  await expect(pager.getByRole('button', { name: /^Page \d$/ })).toHaveCount(4);

  // Step 2 (yours): click the button named "Page 3". Expect the caption
  // (`.scan__caption`) to read "Page 3 of 4" and that button to carry
  // aria-current="true". Hydration may not be done on the first click; see
  // turnPageWhenHydrated in reader.spec.ts for the retry pattern.
  throw new Error('exercise 7a: write step 2, then delete this line');

  // Step 3 (given): no WCAG 2.2 AA violations in this state.
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
