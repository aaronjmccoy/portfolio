import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { App } from './App.tsx';

export type RenderResult = {
  head: string;
  pipe: ReturnType<typeof renderToPipeableStream>['pipe'];
  abort: ReturnType<typeof renderToPipeableStream>['abort'];
};

/**
 * Called by the Hono server for every HTML request. Returns the <head> bits
 * the page needs and a stream of the body markup. Relay data loading will sit
 * here once the Storefront environment exists.
 */
export function render(url: string, options: RenderToPipeableStreamOptions): RenderResult {
  const title = 'Maller Art — Paintings, Prints & Trinkets';
  const head = `<title>${title}</title>\n<meta name="description" content="Original watercolour paintings, fine art prints and small pretty things by Megan Maller McCoy." />`;
  const { pipe, abort } = renderToPipeableStream(
    <StrictMode>
      <App url={url} />
    </StrictMode>,
    options,
  );
  return { head, pipe, abort };
}
