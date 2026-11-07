import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import type { RenderResult } from '@portfolio/ssr';
import { App } from './App.tsx';

export function render(url: string, options: RenderToPipeableStreamOptions): RenderResult {
  const head = `<title>German War Letters, 1939–1945</title>\n<meta name="description" content="Letters home from German soldiers, 1939–1945, with the scans and the author's commentary." />`;
  const { pipe, abort } = renderToPipeableStream(
    <StrictMode>
      <App url={url} />
    </StrictMode>,
    options,
  );
  return { head, pipe, abort };
}
