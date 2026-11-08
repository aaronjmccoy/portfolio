import { fetchQuery } from 'react-relay';
import { matchPath } from 'react-router';
import type { Environment, GraphQLTaggedNode, OperationType } from 'relay-runtime';
import { CartPage, CartPageQuery } from './pages/CartPage.tsx';
import { CollectionPage, CollectionPageQuery, COLLECTION_PAGE_SIZE } from './pages/CollectionPage.tsx';
import { HomePage, HomePageQuery } from './pages/HomePage.tsx';
import { ProductPage, ProductPageQuery } from './pages/ProductPage.tsx';
import { SearchPage, SearchPageQuery, SEARCH_PAGE_SIZE } from './pages/SearchPage.tsx';

export type RouteContext = { cartId?: string | undefined };
export type Params = Record<string, string | undefined>;

export type RouteDef = {
  path: string;
  Component: () => React.JSX.Element;
  /** What the page reads, for the server to preload */
  query?: GraphQLTaggedNode;
  /** Variables from the URL; `undefined` means there is nothing to load (no cart yet, empty search) */
  variables?: (params: Params, search: URLSearchParams, ctx: RouteContext) => OperationType['variables'] | undefined;
};

/**
 * Each route names the query its page renders so the server can fill the
 * Relay store before React starts streaming. Pages read with
 * `fetchPolicy: 'store-only'` on the server and 'store-or-network' on the
 * client, where a navigation suspends until the data arrives.
 */
export const routes: RouteDef[] = [
  { path: '/', Component: HomePage, query: HomePageQuery, variables: () => ({}) },
  {
    path: '/collections/:handle',
    Component: CollectionPage,
    query: CollectionPageQuery,
    variables: (p) => ({ handle: p['handle'] ?? '', first: COLLECTION_PAGE_SIZE }),
  },
  { path: '/products/:handle', Component: ProductPage, query: ProductPageQuery, variables: (p) => ({ handle: p['handle'] ?? '' }) },
  {
    path: '/search',
    Component: SearchPage,
    query: SearchPageQuery,
    variables: (_p, search) => {
      const q = (search.get('q') ?? '').trim();
      return q ? { q, first: SEARCH_PAGE_SIZE } : undefined;
    },
  },
  { path: '/cart', Component: CartPage, query: CartPageQuery, variables: (_p, _s, ctx) => (ctx.cartId ? { id: ctx.cartId } : undefined) },
];

export function matchRoute(pathname: string): { route: RouteDef; params: Params } | undefined {
  for (const route of routes) {
    const m = matchPath(route.path, pathname);
    if (m) return { route, params: m.params };
  }
  return undefined;
}

/** Fills the environment's store for the matched route. Resolves even on a miss. */
export async function preloadRoute(environment: Environment, url: string, ctx: RouteContext): Promise<void> {
  const [pathname = '/', query = ''] = url.split('?');
  const match = matchRoute(pathname);
  if (!match?.route.query) return;
  const variables = match.route.variables?.(match.params, new URLSearchParams(query), ctx);
  if (!variables) return;
  await fetchQuery(environment, match.route.query, variables).toPromise();
}
