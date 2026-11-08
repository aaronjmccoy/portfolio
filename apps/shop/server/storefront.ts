/**
 * Server-side access to the Shopify Storefront API with the Headless channel's
 * private token. Used by SSR (through the Relay network) and by the no-JS cart
 * form routes. The browser never sees this token: it talks to /graphql on this
 * server, which forwards with the same credentials.
 */
import type { GraphQLResponse } from 'relay-runtime';

export type StorefrontConfig = { domain: string; token: string; isPrivate: boolean; version: string };

export function storefrontConfig(env: NodeJS.ProcessEnv = process.env): StorefrontConfig {
  const domain = env['SHOPIFY_STORE_DOMAIN'];
  const privateToken = env['SHOPIFY_STOREFRONT_PRIVATE_TOKEN'];
  const publicToken = env['SHOPIFY_STOREFRONT_TOKEN'];
  const token = privateToken || publicToken;
  if (!domain || !token) {
    throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_TOKEN (or SHOPIFY_STOREFRONT_TOKEN) are required');
  }
  return { domain, token, isPrivate: !!privateToken, version: env['SHOPIFY_STOREFRONT_API_VERSION'] ?? '2026-10' };
}

export type StorefrontRequest = { query: string; variables?: Record<string, unknown>; operationName?: string | undefined };

/** POSTs one operation to Shopify. `buyerIp` attributes the request to the visitor for Shopify's rate limiting. */
export async function storefrontFetch(cfg: StorefrontConfig, body: StorefrontRequest, buyerIp?: string): Promise<GraphQLResponse> {
  const headers: Record<string, string> = { 'content-type': 'application/json', accept: 'application/json' };
  if (cfg.isPrivate) headers['Shopify-Storefront-Private-Token'] = cfg.token;
  else headers['X-Shopify-Storefront-Access-Token'] = cfg.token;
  if (buyerIp) headers['Shopify-Storefront-Buyer-IP'] = buyerIp;
  const res = await fetch(`https://${cfg.domain}/api/${cfg.version}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Storefront API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as GraphQLResponse;
}

/** The cart fields the server needs after a form post: the id to keep and whether the mutation succeeded. */
type CartPayload = { cart: { id: string; totalQuantity: number } | null; userErrors: Array<{ field?: string[] | null; message: string }> };

const CART_CREATE = /* GraphQL */ `
  mutation ServerCartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) { cart { id totalQuantity } userErrors { field message } }
  }`;
const CART_LINES_ADD = /* GraphQL */ `
  mutation ServerCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id totalQuantity } userErrors { field message } }
  }`;
const CART_LINES_UPDATE = /* GraphQL */ `
  mutation ServerCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id totalQuantity } userErrors { field message } }
  }`;
const CART_LINES_REMOVE = /* GraphQL */ `
  mutation ServerCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id totalQuantity } userErrors { field message } }
  }`;

function unwrap(name: string, res: GraphQLResponse): CartPayload['cart'] {
  const data = (res as { data?: Record<string, CartPayload> }).data;
  const payload = data?.[name];
  if (!payload) throw new Error(`${name}: ${JSON.stringify((res as { errors?: unknown }).errors ?? 'no data')}`);
  if (payload.userErrors.length) throw new Error(`${name}: ${payload.userErrors.map((e) => e.message).join('; ')}`);
  return payload.cart;
}

/** The no-JS cart operations. Each returns the cart id to store in the cookie, or null when the cart is gone. */
export const serverCart = {
  async add(cfg: StorefrontConfig, cartId: string | undefined, merchandiseId: string, quantity: number, buyerIp?: string) {
    const lines = [{ merchandiseId, quantity }];
    if (!cartId) return unwrap('cartCreate', await storefrontFetch(cfg, { query: CART_CREATE, variables: { lines } }, buyerIp));
    return unwrap('cartLinesAdd', await storefrontFetch(cfg, { query: CART_LINES_ADD, variables: { cartId, lines } }, buyerIp));
  },
  async update(cfg: StorefrontConfig, cartId: string, lineId: string, quantity: number, buyerIp?: string) {
    if (quantity <= 0) return serverCart.remove(cfg, cartId, lineId, buyerIp);
    const lines = [{ id: lineId, quantity }];
    return unwrap('cartLinesUpdate', await storefrontFetch(cfg, { query: CART_LINES_UPDATE, variables: { cartId, lines } }, buyerIp));
  },
  async remove(cfg: StorefrontConfig, cartId: string, lineId: string, buyerIp?: string) {
    return unwrap('cartLinesRemove', await storefrontFetch(cfg, { query: CART_LINES_REMOVE, variables: { cartId, lineIds: [lineId] } }, buyerIp));
  },
};
