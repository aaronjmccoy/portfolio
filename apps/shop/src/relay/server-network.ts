import type { FetchFunction } from 'relay-runtime';
import { storefrontConfig, storefrontFetch } from '../../server/storefront.ts';

/** What the server knows about the request before rendering it. */
export type RenderContext = { cartId?: string | undefined; buyerIp?: string | undefined };

/** Server-side Relay network: straight to Shopify with the private token, no round trip through this server. */
export function createServerFetch(ctx: RenderContext): FetchFunction {
  const cfg = storefrontConfig();
  return async (request, variables) => {
    if (!request.text) throw new Error(`operation ${request.name} has no text; persisted queries are not configured`);
    return storefrontFetch(cfg, { query: request.text, variables, operationName: request.name }, ctx.buyerIp);
  };
}
