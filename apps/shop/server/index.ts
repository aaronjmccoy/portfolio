import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';
import { startSsrServer } from '@portfolio/ssr';
import { createMetrics, startMetricsServer } from '@portfolio/ssr/metrics';
import { CART_COOKIE } from '../src/cart/cookie.ts';
import type { RenderContext } from '../src/relay/server-network.ts';
import { serverCart, storefrontConfig, storefrontFetch } from './storefront.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metrics = createMetrics('shop');
const cfg = storefrontConfig();

/** Growth funnel events by step and experiment variant. */
export const funnelEvents = metrics.counter('funnel_events_total', 'Funnel events by step and variant', ['step', 'variant']);
const storefrontOps = metrics.counter('storefront_operations_total', 'Storefront API operations forwarded for the browser', ['operation']);

const buyerIp = (c: Context) => c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
const cookieOptions = { path: '/', sameSite: 'Lax' as const, maxAge: 60 * 60 * 24 * 14, secure: process.env['NODE_ENV'] === 'production' };

function rememberCart(c: Context, cart: { id: string } | null): void {
  if (cart) setCookie(c, CART_COOKIE, cart.id, cookieOptions);
  else setCookie(c, CART_COOKIE, '', { ...cookieOptions, maxAge: 0 });
}

/** Where a form post sends the visitor afterwards: back where they came from on this site, else the cart page. */
function back(c: Context, fallback = '/cart'): string {
  const to = c.req.header('referer');
  if (!to) return fallback;
  try {
    const u = new URL(to);
    return u.origin === new URL(c.req.url).origin ? u.pathname + u.search : fallback;
  } catch {
    return fallback;
  }
}

await startSsrServer({
  root,
  name: 'shop',
  port: Number(process.env['PORT'] ?? 3000),
  httpRequests: metrics.httpRequests,
  renderContext: (c): RenderContext => ({ cartId: getCookie(c, CART_COOKIE) || undefined, buyerIp: buyerIp(c) }),
  configure(app) {
    // The browser's Relay network. Same credentials as SSR, so Shopify sees one client and the token never ships.
    app.post('/graphql', async (c) => {
      const body = (await c.req.json()) as { query?: string; variables?: Record<string, unknown>; operationName?: string };
      if (typeof body.query !== 'string') return c.json({ errors: [{ message: 'query is required' }] }, 400);
      storefrontOps.inc({ operation: body.operationName ?? 'anonymous' });
      const res = await storefrontFetch(cfg, { query: body.query, variables: body.variables ?? {}, operationName: body.operationName }, buyerIp(c));
      return c.json(res);
    });

    // Plain-HTML cart: the forms on product and cart pages post here when JavaScript is off
    // (or before it loads). Each handler updates the cart, refreshes the cookie and redirects.
    app.post('/cart/add', async (c) => {
      const form = await c.req.parseBody();
      const id = String(form['id'] ?? '');
      const quantity = Math.max(1, Number(form['quantity'] ?? 1) || 1);
      if (!id) return c.text('id is required', 400);
      const cart = await serverCart.add(cfg, getCookie(c, CART_COOKIE) || undefined, id, quantity, buyerIp(c));
      rememberCart(c, cart);
      funnelEvents.inc({ step: 'add_to_cart', variant: 'none' });
      return c.redirect('/cart', 303);
    });
    app.post('/cart/update', async (c) => {
      const form = await c.req.parseBody();
      const cartId = getCookie(c, CART_COOKIE);
      const lineId = String(form['line'] ?? '');
      if (!cartId || !lineId) return c.redirect('/cart', 303);
      const quantity = form['remove'] !== undefined ? 0 : Math.max(0, Number(form['quantity'] ?? 1) || 0);
      rememberCart(c, await serverCart.update(cfg, cartId, lineId, quantity, buyerIp(c)));
      return c.redirect(back(c), 303);
    });
  },
});
startMetricsServer(metrics.registry, { port: 9464 });
