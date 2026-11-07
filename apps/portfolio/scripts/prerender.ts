/**
 * Prerenders the portfolio into static HTML after the two Vite builds:
 *
 *   vite build                                   → dist/index.html + assets
 *   vite build --ssr src/prerender-entry.tsx     → dist/ssr/prerender-entry.js
 *   node scripts/prerender.ts                    → fills #root in dist/index.html
 *
 * The page is then complete before any JavaScript runs; main.tsx hydrates it.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const file = resolve(dist, 'index.html');
const entry = pathToFileURL(resolve(dist, 'ssr/prerender-entry.js')).href;

const { render } = (await import(entry)) as { render: () => string };
const html = await readFile(file, 'utf8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error(`${file} has no empty #root to fill`);
const markup = render();
await writeFile(file, html.replace(marker, `<div id="root">${markup}</div>`));
console.log(`prerendered ${file} (${markup.length.toLocaleString()} chars of markup)`);
