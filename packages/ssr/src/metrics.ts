/**
 * Prometheus metrics on a separate listener bound to a LAN/loopback address
 * (METRICS_BIND, default 127.0.0.1) so the edge proxy never exposes them.
 * Prometheus on the monitoring VM scrapes http://<host>:<METRICS_PORT>/metrics.
 */
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { Counter, Registry, collectDefaultMetrics } from '@prometheus-io/client';

export type Metrics = {
  registry: Registry;
  httpRequests: Counter<'route' | 'status'>;
  counter: <L extends string>(name: string, help: string, labelNames: readonly L[]) => Counter<L>;
};

export function createMetrics(prefix: string): Metrics {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry, prefix: `${prefix}_` });
  const counter = <L extends string>(name: string, help: string, labelNames: readonly L[]) =>
    new Counter<L>({ name: `${prefix}_${name}`, help, labelNames: [...labelNames], registers: [registry] });
  return {
    registry,
    httpRequests: counter('http_requests_total', 'HTML responses by route and status', ['route', 'status']),
    counter,
  };
}

export function startMetricsServer(registry: Registry, defaults: { port: number }): Server {
  const host = process.env['METRICS_BIND'] ?? '127.0.0.1';
  const port = Number(process.env['METRICS_PORT'] ?? defaults.port);
  const server = createServer(async (req, res) => {
    if (req.url !== '/metrics') {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': registry.contentType });
    res.end(await registry.metrics());
  });
  server.listen(port, host, () => console.log(`metrics on http://${host}:${port}/metrics`));
  return server;
}
