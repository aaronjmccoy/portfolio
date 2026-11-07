import { fetchQuery } from 'react-relay';
import { matchPath } from 'react-router';
import type { Environment, GraphQLTaggedNode, OperationType } from 'relay-runtime';
import { SectionsPage, SectionsPageQuery } from './pages/SectionsPage.tsx';
import { ChapterPage, ChapterPageQuery } from './pages/ChapterPage.tsx';
import { LetterPage, LetterPageQuery } from './pages/LetterPage.tsx';

export type RouteDef = {
  path: string;
  Component: () => React.JSX.Element;
  query: GraphQLTaggedNode;
  variables: (params: Record<string, string | undefined>) => OperationType['variables'];
};

/**
 * Each route names the query its page renders so the server can fill the
 * Relay store before React starts streaming. Pages read with
 * `fetchPolicy: 'store-only'` on the server and 'store-or-network' on the
 * client, where a navigation simply suspends until the data arrives.
 */
export const routes: RouteDef[] = [
  { path: '/', Component: SectionsPage, query: SectionsPageQuery, variables: () => ({}) },
  { path: '/chapter/:key', Component: ChapterPage, query: ChapterPageQuery, variables: (p) => ({ key: p['key'] ?? '', first: 50 }) },
  { path: '/letter/:key', Component: LetterPage, query: LetterPageQuery, variables: (p) => ({ key: p['key'] ?? '' }) },
];

export function matchRoute(pathname: string): { route: RouteDef; params: Record<string, string | undefined> } | undefined {
  for (const route of routes) {
    const m = matchPath(route.path, pathname);
    if (m) return { route, params: m.params };
  }
  return undefined;
}

/** Fills the environment's store for the matched route. Resolves even on a miss. */
export async function preloadRoute(environment: Environment, pathname: string): Promise<void> {
  const match = matchRoute(pathname);
  if (!match) return;
  await fetchQuery(environment, match.route.query, match.route.variables(match.params)).toPromise();
}

export const fetchPolicy = typeof window === 'undefined' ? ('store-only' as const) : ('store-or-network' as const);
