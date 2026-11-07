import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createYoga } from 'graphql-yoga';
import type { Plugin } from 'graphql-yoga';
import { serveStatic, startSsrServer } from '@portfolio/ssr';
import { createMetrics, startMetricsServer } from '@portfolio/ssr/metrics';
import { buildArchiveIndex } from './archive-index.ts';
import { loadDimensions } from './dimensions.ts';
import { loadTranscriptions } from './transcriptions.ts';
import { schema } from './schema.ts';
import type { Context } from './schema.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metrics = createMetrics('letters');

/**
 * The archive lives on the host (LETTERS_SCANS_DIR). Anywhere else — a
 * workstation, CI — the committed listing of its filenames stands in, so the
 * API and the UI work without the 6.8 GB of scans.
 */
async function listArchive(): Promise<string[]> {
  const dir = process.env['LETTERS_SCANS_DIR'];
  if (dir) return readdir(dir);
  const listing = await readFile(resolve(root, 'data/listing.txt'), 'utf8');
  return listing.split(/\r?\n/).filter(Boolean);
}

const transcriptions = await loadTranscriptions(resolve(root, 'transcriptions'));
const index = buildArchiveIndex(await listArchive(), transcriptions);
const dimensions = await loadDimensions(process.env['LETTERS_DATA_DIR']);
console.log(
  `letters: ${index.sections.length} sections, ${index.letters.length} letters, ${transcriptions.size} transcriptions, ${dimensions.size} derived images`,
);

const graphqlRequests = metrics.counter('graphql_requests_total', 'GraphQL requests by operation', ['operation']);
const countOperations: Plugin<Context> = {
  onExecute({ args }) {
    graphqlRequests.inc({ operation: args.operationName ?? 'anonymous' });
  },
};
const yoga = createYoga<Context>({
  schema,
  context: () => ({ index, dimensions }),
  graphqlEndpoint: '/graphql',
  graphiql: process.env['NODE_ENV'] !== 'production',
  landingPage: false,
  logging: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info',
  plugins: [countOperations],
});

await startSsrServer({
  root,
  name: 'letters',
  port: Number(process.env['PORT'] ?? 3001),
  httpRequests: metrics.httpRequests,
  renderContext: () => ({ index, dimensions }),
  configure(app) {
    app.on(['GET', 'POST', 'OPTIONS'], '/graphql', (c) => yoga.fetch(c.req.raw, {}));
    // In production Caddy serves these directly; locally the Node server does.
    const scans = process.env['LETTERS_SCANS_DIR'];
    const derived = process.env['LETTERS_DATA_DIR'];
    if (scans) app.use('/scans/*', serveStatic({ root: scans, rewriteRequestPath: (p) => p.replace(/^\/scans/, '') }));
    if (derived) app.use('/img/*', serveStatic({ root: resolve(derived, 'img'), rewriteRequestPath: (p) => p.replace(/^\/img/, '') }));
    if (derived) app.use('/photos/*', serveStatic({ root: resolve(derived, 'photos'), rewriteRequestPath: (p) => p.replace(/^\/photos/, '') }));
  },
});
startMetricsServer(metrics.registry, { port: 9465 });
