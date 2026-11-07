import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import type { RenderResult } from '@portfolio/ssr';
import type { Context } from '../server/schema.ts';
import { App } from './App.tsx';
import { pageTitle } from './components/Title.tsx';
import { createEnvironment, serializeRecords } from './relay/environment.ts';
import { createServerFetch } from './relay/server-network.ts';
import { matchRoute, preloadRoute } from './routes.tsx';

// The book's own tagline, from the original landing page.
const DESCRIPTION =
  'The book tells the story of a generation of German men, women and children who were forced by an evil government to go to war and once in that war, they had to fight to the end to try to save their families from the vengeance of both Adolf Hitler and Joseph Stalin.';

export async function render(url: string, options: RenderToPipeableStreamOptions, ctx: unknown): Promise<RenderResult> {
  const environment = createEnvironment(createServerFetch(ctx as Context));
  const pathname = url.split('?')[0] ?? '/';
  await preloadRoute(environment, pathname);

  const found = lookup(environment, pathname);
  const title = pageTitle(found.title);
  const status = found.status;
  const head = `<title>${escape(title)}</title>\n<meta name="description" content="${escape(DESCRIPTION)}" />`;

  const { pipe, abort } = renderToPipeableStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App environment={environment} />
      </StaticRouter>
    </StrictMode>,
    // React defers ("outlines") a finished Suspense boundary bigger than
    // progressiveChunkSize (12.8 kB by default) behind an inline script, which
    // leaves the long home page blank without JavaScript. Every route's data is
    // preloaded before rendering, so nothing is gained by chunking: send it whole.
    { ...options, progressiveChunkSize: Number.POSITIVE_INFINITY },
  );
  return { head, tail: serializeRecords(environment), status, pipe, abort };
}

/**
 * Reads the preloaded store for what the route resolved to, without a second
 * query: the <title> for the page, and 404 when the route matched but the
 * archive has no such chapter or letter (the root field preloaded as null).
 */
function lookup(environment: ReturnType<typeof createEnvironment>, pathname: string): { title: string | undefined; status: number } {
  const matched = matchRoute(pathname) !== undefined;
  const source = environment.getStore().getSource();
  const root = source.get('client:root') as Record<string, { __ref?: string } | null> | null | undefined;
  if (root) {
    for (const [field, value] of Object.entries(root)) {
      const isSection = field.startsWith('section(');
      const isLetter = field.startsWith('letter(');
      if (!isSection && !isLetter) continue;
      if (value === null) return { title: undefined, status: 404 };
      const rec = value?.__ref ? (source.get(value.__ref) as Record<string, unknown> | null | undefined) : undefined;
      if (!rec) continue;
      if (isSection) {
        const chapter = rec['chapter'];
        return { title: chapter == null ? String(rec['title']) : `Chapter ${chapter}: ${rec['title']}`, status: 200 };
      }
      return { title: `Letter ${rec['number']}${rec['variant'] ?? ''}`, status: 200 };
    }
  }
  return { title: pathname === '/letters' ? 'Letters' : undefined, status: matched ? 200 : 404 };
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
