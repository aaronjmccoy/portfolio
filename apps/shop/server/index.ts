import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startSsrServer } from '@portfolio/ssr';
import { createMetrics, startMetricsServer } from '@portfolio/ssr/metrics';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metrics = createMetrics('shop');

/** Growth funnel events by step and experiment variant (phase 5). */
export const funnelEvents = metrics.counter('funnel_events_total', 'Funnel events by step and variant', [
  'step',
  'variant',
]);

await startSsrServer({ root, name: 'shop', httpRequests: metrics.httpRequests });
startMetricsServer(metrics.registry, { port: 9464 });
