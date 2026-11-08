import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import type { RenderResult } from '@portfolio/ssr';
import { App } from './App.tsx';
import { createEnvironment, serializeRecords } from './relay/environment.ts';
import { createServerFetch } from './relay/server-network.ts';
import type { RenderContext } from './relay/server-network.ts';
import { matchRoute, preloadRoute } from './routes.tsx';
import { DESCRIPTION, pageTitle } from './site.ts';

export async function render(url: string, options: RenderToPipeableStreamOptions, rawCtx: unknown): Promise<RenderResult> {
  const ctx = (rawCtx ?? {}) as RenderContext;
  const environment = createEnvironment(createServerFetch(ctx));
  await preloadRoute(environment, url, { cartId: ctx.cartId });

  const [pathname = '/', search = ''] = url.split('?');
  const found = lookup(environment, pathname, new URLSearchParams(search));
  const head = `<title>${escape(pageTitle(found.title))}</title>\n<meta name="description" content="${escape(DESCRIPTION)}" />`;

  const { pipe, abort } = renderToPipeableStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App environment={environment} cartId={ctx.cartId} />
      </StaticRouter>
    </StrictMode>,
    // Every route's data is preloaded, so there is nothing to gain from chunking;
    // send the page whole so it reads without JavaScript.
    { ...options, progressiveChunkSize: Number.POSITIVE_INFINITY },
  );
  return { head, tail: serializeRecords(environment), status: found.status, pipe, abort };
}

/**
 * Reads the preloaded store for the <title> and the status: 404 when the route
 * matched but Shopify has no such product or collection (root field null).
 */
function lookup(environment: ReturnType<typeof createEnvironment>, pathname: string, search: URLSearchParams): { title: string | undefined; status: number } {
  const match = matchRoute(pathname);
  if (!match) return { title: 'Not found', status: 404 };
  if (match.route.path === '/search') {
    const q = (search.get('q') ?? '').trim();
    return { title: q ? `Search: ${q}` : 'Search', status: 200 };
  }
  if (match.route.path === '/cart') return { title: 'Your cart', status: 200 };
  if (match.route.path === '/') return { title: undefined, status: 200 };

  const source = environment.getStore().getSource();
  const root = source.get('client:root') as Record<string, { __ref?: string } | null> | null | undefined;
  const field = match.route.path.startsWith('/products') ? 'product(' : 'collection(';
  for (const [key, value] of Object.entries(root ?? {})) {
    if (!key.startsWith(field)) continue;
    if (value === null) return { title: 'Not found', status: 404 };
    const rec = value?.__ref ? (source.get(value.__ref) as Record<string, unknown> | null | undefined) : undefined;
    if (rec && typeof rec['title'] === 'string') return { title: rec['title'], status: 200 };
  }
  return { title: undefined, status: 200 };
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
