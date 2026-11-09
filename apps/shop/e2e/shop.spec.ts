import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// The shop renders from the live store. Without credentials (a fork, a checkout without .env) there is nothing to test.
test.skip(!process.env['SHOPIFY_STORE_DOMAIN'], 'no SHOPIFY_STORE_DOMAIN: the shop cannot reach a store');

/** The one product that is live in the store today; the rest are drafts until Megan prices them. */
const PRODUCT = process.env['E2E_PRODUCT'] ?? 'starstuff';
const PRODUCT_TITLE = process.env['E2E_PRODUCT_TITLE'] ?? 'Starstuff';

/** WCAG 2.2 AA on every route. */
async function expectNoA11yViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`)).toEqual([]);
}

test.describe('server-rendered routes', () => {
  for (const [path, title] of [
    ['/', 'Maller Art — Paintings, Prints & Trinkets'],
    ['/collections/originals', 'Paintings — Maller Art'],
    [`/products/${PRODUCT}`, `${PRODUCT_TITLE} — Maller Art`],
    ['/search?q=star', 'Search: star — Maller Art'],
    ['/cart', 'Your cart — Maller Art'],
  ] as const) {
    test(`${path} renders with its title and passes axe`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole('main')).toBeVisible();
      await expectNoA11yViolations(page);
    });
  }

  test('unknown product and page answer 404', async ({ page }) => {
    expect((await page.goto('/products/nope'))?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('No such piece');
    expect((await page.goto('/nowhere'))?.status()).toBe(404);
  });

  test('home page follows the mockup: wordmark, three collections, hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maller Art');
    const nav = page.getByRole('navigation', { name: 'Collections' });
    await expect(nav.getByRole('link')).toHaveText(['Paintings', 'Prints', 'Trinkets']);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Paintings', 'Prints', 'Trinkets']);
    await expect(page.locator('.hero__media')).toHaveAttribute('fetchpriority', 'high');
    // Paintings is a mosaic of the first eight pieces; which eight depends on the store, so check the tiles, not a title.
    const tiles = page.locator('#originals .mosaic .card');
    await expect(tiles.first()).toBeVisible();
    await expect(tiles.first()).toHaveAttribute('style', /--m3-rs:\s*\d+/);
  });

  test('product page carries JSON-LD and a real add-to-cart form', async ({ page }) => {
    await page.goto(`/products/${PRODUCT}`);
    // the primary button keeps the design system's colours: not ink on ink
    const colours = await page.getByRole('button', { name: 'Add to cart' }).evaluate((el) => {
      const cs = getComputedStyle(el);
      return [cs.color, cs.backgroundColor];
    });
    expect(colours[0]).not.toBe(colours[1]);
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(ld ?? '{}') as { '@type'?: string; offers?: unknown[] };
    expect(data['@type']).toBe('Product');
    expect(data.offers?.length).toBeGreaterThan(0);
    const form = page.locator('form[action="/cart/add"]');
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form.locator('input[name="id"]')).toHaveValue(/gid:\/\/shopify\/ProductVariant\//);
  });
});

test.describe('cart with JavaScript', () => {
  test('keyboard: add to cart opens the drawer, Escape closes it and returns focus', async ({ page }) => {
    await page.goto(`/products/${PRODUCT}`);
    const add = page.getByRole('button', { name: 'Add to cart' });
    await add.focus();
    const dialog = page.getByRole('dialog', { name: 'Your cart' });
    // Keep pressing Enter until the hydrated handler opens the drawer (a pre-hydration submit navigates instead).
    await expect(async () => {
      await page.keyboard.press('Enter');
      await expect(dialog).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
    await expect(dialog.getByRole('list', { name: 'Items in your cart' }).getByRole('listitem')).toHaveCount(1);
    // Shopify's hosted checkout for this cart lives under /cart/c/<id> on the store domain.
    await expect(dialog.getByRole('link', { name: 'Check out' })).toHaveAttribute('href', /myshopify\.com\/cart\/c\//);
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();
    // Accessible name is "Cart, 1 item" (the visible "(1)" is aria-hidden); browsers may pad inline boundaries with spaces.
    await expect(page.getByRole('link', { name: /^Cart\s*,\s*1 item/ })).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test('search suggestions appear while typing and submit navigates', async ({ page }) => {
    await page.goto('/');
    const box = page.getByRole('searchbox', { name: 'Search artwork' });
    await box.click();
    await box.pressSequentially(PRODUCT.slice(0, 4), { delay: 50 });
    await expect(page.getByRole('list', { name: 'Suggestions' })).toBeVisible({ timeout: 10_000 });
    await box.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Results for');
    await expect(page.getByRole('main')).toBeFocused();
  });
});

test.describe('product gallery', () => {
  test('hovering a shot magnifies and pans; clicking opens the gallery at native size', async ({ page }) => {
    await page.goto(`/products/${PRODUCT}`);
    await page.waitForLoadState('networkidle');
    const shot = page.locator('.shot').first();
    const box = (await shot.boundingBox()) as { x: number; y: number; width: number; height: number };
    // The hero is taller than the viewport; stay inside the part that is on screen.
    const seen = Math.min(box.height, (page.viewportSize()?.height ?? 720) - box.y);
    const lens = page.getByTestId('lens').first();
    // Keep nudging the mouse until the hydrated handler shows the lens (it also waits for the large image).
    await expect(async () => {
      await page.mouse.move(box.x + box.width * 0.2, box.y + seen * 0.2);
      await page.mouse.move(box.x + box.width * 0.25, box.y + seen * 0.25);
      await expect(lens).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 20_000 });
    const before = await lens.evaluate((el) => el.style.backgroundPosition);
    await page.mouse.move(box.x + box.width * 0.75, box.y + seen * 0.75);
    const after = await lens.evaluate((el) => el.style.backgroundPosition);
    expect(after).not.toBe(before);
    await page.mouse.move(0, 0);
    await expect(lens).toBeHidden();

    await shot.click();
    const dialog = page.getByRole('dialog', { name: `${PRODUCT_TITLE} gallery` });
    await expect(dialog).toBeVisible();
    const count = dialog.locator('.lightbox__count');
    await expect(count).toHaveText(/^1 of \d+$/);
    // the gallery shows the uploaded file itself, not a resized rendition
    expect(await dialog.locator('.lightbox__image').getAttribute('src')).not.toMatch(/[?&]width=/);
    // nothing but the two arrows (and the image) to interact with
    await expect(dialog.getByRole('button')).toHaveCount(2);
    await page.keyboard.press('ArrowRight');
    await expect(count).toHaveText(/^2 of \d+$/);
    await dialog.getByRole('button', { name: 'Previous image' }).click();
    await expect(count).toHaveText(/^1 of \d+$/);
    await expectNoA11yViolations(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(shot).toBeFocused();
    // a click anywhere off the image also leaves
    await shot.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });

  test('moving to another page focuses main with the header still in view', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.getByRole('navigation', { name: 'Collections' }).getByRole('link', { name: 'Paintings' }).click();
    await expect(page).toHaveURL(/\/collections\/originals$/);
    await expect(page.getByRole('main')).toBeFocused();
    await expect(page.locator('.site-header')).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe('cart without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the forms add, update and remove through the server', async ({ page }) => {
    await page.goto(`/products/${PRODUCT}`);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page).toHaveURL(/\/cart$/);
    const items = page.getByRole('list', { name: 'Items in your cart' }).getByRole('listitem');
    await expect(items).toHaveCount(1);
    // An original is one of a kind, so Shopify holds the quantity at 1; the round trip is what is under test.
    await items.first().getByLabel('Qty').fill('1');
    await items.first().getByRole('button', { name: 'Update' }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(items).toHaveCount(1);
    await expect(items.first().getByLabel('Qty')).toHaveValue('1');
    await items.first().getByRole('button', { name: /^Remove/ }).click();
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
    // axe needs scripting; the same server-rendered markup is scanned in the JavaScript tests above.
  });
});
