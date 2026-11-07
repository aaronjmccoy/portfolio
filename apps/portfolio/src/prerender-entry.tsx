/**
 * Built by `vite build --ssr` into dist/ssr/prerender-entry.js so that Node
 * can run it: Node strips types from .ts files natively but cannot load .tsx
 * or the CSS that @portfolio/ui imports, so the markup is produced from a
 * bundle rather than from source.
 */
import { renderToString } from 'react-dom/server';
import { App } from './App.tsx';

export function render(): string {
  return renderToString(<App />);
}
