import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/** WCAG 2.2 AA, the bar the plan sets for every route. */
async function expectNoA11yViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`)).toEqual([]);
}

/** Presses a key until the caption leaves page 1, which proves React has hydrated. */
async function turnPageWhenHydrated(page: Page): Promise<void> {
  const caption = page.locator('.scan__caption');
  await expect(async () => {
    await page.keyboard.press('ArrowRight');
    await expect(caption).not.toHaveText(/^Page 1 of/, { timeout: 300 });
  }).toPass({ timeout: 10_000 });
}

test("home page keeps the book's landing content and is accessible", async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle('German War Letters, 1939–1945');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Memories of a Lost Generation/);
  await expect(page.getByRole('banner').getByText('German War Letters, 1939–1945', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByText('German War Letters, 1939–1945', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'support@koifrog.com' })).toHaveAttribute('href', 'mailto:support@koifrog.com');
  for (const name of [
    'The soldiers speak for themselves',
    'Excerpt from the Dedication',
    'Maps and Photos',
    'Documents and Letters',
    'Why use Letters to Tell the Story of the War?',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
  }
  await expect(page.getByRole('list', { name: 'Maps and photos' }).getByRole('link')).toHaveCount(8);
  await expect(page.getByRole('list', { name: 'Documents and letters' }).getByRole('link')).toHaveCount(4);
  const nav = page.getByRole('navigation', { name: 'Site' });
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await expectNoA11yViolations(page);
});

test('gallery opens a lightbox that pages and closes', async ({ page }) => {
  await page.goto('/');
  const first = page.getByRole('list', { name: 'Maps and photos' }).getByRole('link').first();
  const dialog = page.getByRole('dialog');
  await expect(async () => {
    await first.click();
    await expect(dialog).toBeVisible({ timeout: 300 });
  }).toPass({ timeout: 10_000 });
  await expect(dialog.getByRole('heading')).toHaveText('Heinrich on a mail and supply run');
  await expect(dialog).toContainText('1 of 8');
  await dialog.getByRole('button', { name: 'Next' }).click();
  await expect(dialog.getByRole('heading')).toHaveText(/Eastern Wall/);
  await page.keyboard.press('ArrowLeft');
  await expect(dialog).toContainText('1 of 8');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('letters tab is server-rendered and accessible', async ({ page }) => {
  const res = await page.goto('/letters');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/^Letters/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letter Scans');
  await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Letters' })).toHaveAttribute('aria-current', 'page');
  expect(await page.getByRole('list', { name: 'Chapters' }).getByRole('listitem').count()).toBeGreaterThanOrEqual(10);
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
  await expectNoA11yViolations(page);
});

test('chapter page paginates and moves focus to main after navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Letters' }).click();
  await expect(page).toHaveURL(/\/letters$/);
  await page.getByRole('link', { name: /Chapter 3\b/ }).click();
  await expect(page).toHaveURL(/\/chapter\/ch3$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Chapter 3:/);
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');

  const letters = page.getByRole('list', { name: 'Letters in this chapter' }).getByRole('listitem');
  await expect(letters).toHaveCount(50);
  await page.getByRole('button', { name: 'Show more letters' }).click();
  await expect(letters).toHaveCount(100);
  await expectNoA11yViolations(page);
});

test('chapter page is server-rendered with its title', async ({ page }) => {
  const res = await page.goto('/chapter/ch3');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/^Chapter 3:/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Chapter 3:/);
});

test('letter page shows scans with keyboard paging and thumbnails', async ({ page }) => {
  const res = await page.goto('/letter/440');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/^Letter 440/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letter 440');
  const caption = page.locator('.scan__caption');
  await expect(caption).toHaveText(/^Page 1 of \d+$/);

  await turnPageWhenHydrated(page);
  await page.getByRole('button', { name: 'Page 1' }).click();
  await expect(caption).toHaveText(/^Page 1 of/);
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'true');
  const transcript = page.getByRole('region', { name: 'Transcription' });
  await expect(transcript.getByRole('heading', { level: 2 })).toHaveText('Transcription');
  // The author's typed translation is shown as text, and its scan is dropped from the pages.
  await expect(transcript).toContainText('Dear Heinz!');
  await expect(transcript.locator('.transcript__source')).toContainText('The author’s English translation');
  await expect(page.locator('img[src*="pfr100313"]')).toHaveCount(0);
  // ...but the disclaimer links the English scan so readers can check the text.
  await expect(transcript.locator('.transcript__source a')).toHaveAttribute('href', /pfr100313\.jpg$/);
  await expectNoA11yViolations(page);
});

test("a letter with the author's Word document credits it in the disclaimer", async ({ page }) => {
  await page.goto('/letter/445');
  const source = page.getByRole('region', { name: 'Transcription' }).locator('.transcript__source');
  await expect(source).toContainText('from his Word document');
  await expect(source.getByRole('link', { name: 'Letter # 445.docx' })).toHaveAttribute('href', /445\.docx$/);
  await expect(page.locator('.transcript__files')).toHaveCount(0);
});

test('letter page hydrates without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    // Derived images are absent in this environment; a missing /img file is not an app error.
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(m.text());
  });
  await page.goto('/letter/440');
  await turnPageWhenHydrated(page);
  expect(errors).toEqual([]);
});

test('letter page is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/letter/440');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Letter 440');
  await expect(page.locator('.scan__caption')).toHaveText(/^Page 1 of/);
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Letters' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Letters' })).toHaveAttribute('aria-current', 'true');
  await context.close();
});

test('home page is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Memories of a Lost Generation/);
  await expect(page.getByRole('heading', { level: 2, name: 'Why use Letters to Tell the Story of the War?' })).toBeVisible();
  await expect(page.getByText('Loading…')).toBeHidden();
  await context.close();
});

test('unknown letter is a 404 with a way back', async ({ page }) => {
  const res = await page.goto('/letter/nope');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('No such letter');
  await expect(page.getByRole('link', { name: 'Back to the letters' })).toBeVisible();
  await expectNoA11yViolations(page);
});
