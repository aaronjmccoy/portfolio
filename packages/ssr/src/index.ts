/**
 * Shared streaming SSR server for the Vite + React apps (shop, letters).
 *
 *   development: Vite runs in middleware mode and transforms index.html and
 *                the server entry on each request, so HMR works.
 *   production:  serves dist/client as static files and renders with the
 *                prebuilt dist/server/entry-server.js.
 *
 * React's renderToPipeableStream writes into a PassThrough that Hono returns
 * as the response body, so the shell flushes before slow sections resolve.
 * The app's entry-server exports `render(url, options)` returning the <head>
 * markup plus the stream's pipe/abort.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PassThrough, Readable, Writable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import type { ViteDevServer } from 'vite';
import type { Counter } from '@prometheus-io/client';

export { serveStatic };

export type RenderResult = {
  /** Markup for <head>: title, meta, preloads */
  head: string;
  /** Markup appended after the app, before the template's closing tags (serialized data) */
  tail?: string;
  status?: number;
  pipe: (destination: NodeJS.WritableStream) => unknown;
  abort: () => void;
};

/**
 * Exported by each app's entry-server. May be async so a route can preload
 * its data before React starts streaming. `ctx` is whatever the server's
 * `renderContext` returns for this request (e.g. an in-memory data index).
 */
export type RenderFn = (
  url: string,
  options: RenderToPipeableStreamOptions,
  ctx: unknown,
) => RenderResult | Promise<RenderResult>;

export type SsrOptions = {
  /** App directory containing index.html and dist/ */
  root: string;
  /** Label for logs */
  name: string;
  port?: number;
  /** Server entry, as Vite resolves it in dev */
  entry?: string;
  /** Add routes before the HTML catch-all: APIs, extra static mounts */
  configure?: (app: Hono) => void | Promise<void>;
  /** Counter labelled {route, status}; optional */
  httpRequests?: Counter<'route' | 'status'>;
  /** Per-request context handed to the app's render function; receives the Hono context (cookies, headers) */
  renderContext?: (c: Context) => unknown;
  /** Give up streaming after this long */
  abortMs?: number;
};

type Renderer = (url: string) => Promise<{ template: string; render: RenderFn }>;

export async function createSsrApp(opts: SsrOptions): Promise<Hono> {
  const isProd = process.env['NODE_ENV'] === 'production';
  const entry = opts.entry ?? '/src/entry-server.tsx';
  const app = new Hono();
  let renderer: Renderer;

  if (isProd) {
    const template = await readFile(resolve(opts.root, 'dist/client/index.html'), 'utf8');
    const built = pathToFileURL(resolve(opts.root, 'dist/server/entry-server.js')).href;
    const mod = (await import(built)) as { render: RenderFn };
    app.use('/assets/*', serveStatic({ root: resolve(opts.root, 'dist/client') }));
    renderer = async () => ({ template, render: mod.render });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ root: opts.root, server: { middlewareMode: true }, appType: 'custom' });
    // Hand non-HTML requests (modules, HMR, assets) to Vite's connect middleware.
    app.use('*', async (c, next) => {
      if (c.req.header('accept')?.includes('text/html')) return next();
      const res = await viteHandle(vite.middlewares, c.req.raw);
      return res ?? next();
    });
    renderer = async (url) => {
      const raw = await readFile(resolve(opts.root, 'index.html'), 'utf8');
      const template = await vite.transformIndexHtml(url, raw);
      const mod = (await vite.ssrLoadModule(entry)) as { render: RenderFn };
      return { template, render: mod.render };
    };
  }

  app.get('/healthz', (c) => c.text('ok'));
  await opts.configure?.(app);
  app.get('*', (c) => streamHtml(c, renderer, opts));
  return app;
}

export async function startSsrServer(opts: SsrOptions): Promise<void> {
  const app = await createSsrApp(opts);
  const port = opts.port ?? Number(process.env['PORT'] ?? 3000);
  serve({ fetch: app.fetch, port }, (info) => {
    const mode = process.env['NODE_ENV'] === 'production' ? 'prod' : 'dev';
    console.log(`${opts.name} ${mode} listening on http://localhost:${info.port}`);
  });
}

async function streamHtml(c: Context, renderer: Renderer, opts: SsrOptions): Promise<Response> {
  const q = c.req.url.indexOf('?');
  const url = c.req.path + (q >= 0 ? c.req.url.slice(q) : '');
  const { template, render } = await renderer(url);
  const [before, after] = template.split('<!--app-html-->');
  const body = new PassThrough();
  // React ends whatever it pipes into once rendering completes, so the HTML
  // that follows the app (closing tags, the client script) is appended by this
  // sink's `final` rather than by an onAllReady callback racing the pipe.
  let tail = '';
  const sink = new Writable({
    write(chunk: Buffer, _enc, cb) {
      body.write(chunk, cb);
    },
    final(cb) {
      body.end(tail + (after ?? ''), cb);
    },
  });
  let status = 200;
  // onShellReady can fire synchronously inside render() for a shell with no
  // suspense, before `result` is assigned, so both sides call flush() and
  // whichever comes second does the work.
  let shellReady = false;
  let flushed = false;
  let current: RenderResult | undefined = undefined;
  const flush = () => {
    if (flushed || !shellReady || !current) return;
    flushed = true;
    body.write((before ?? '').replace('<!--app-head-->', current.head));
    current.pipe(sink);
  };
  const result = await render(
    url,
    {
      onShellReady() {
        shellReady = true;
        flush();
      },
    onShellError(err: unknown) {
      status = 500;
      console.error(err);
      body.end('<!doctype html><title>Error</title><p>Something went wrong.</p>');
    },
      onError(err: unknown) {
        console.error(err);
      },
    },
    opts.renderContext?.(c),
  );
  current = result;
  tail = result.tail ?? '';
  if (result.status) status = result.status;
  flush();
  setTimeout(result.abort, opts.abortMs ?? 10_000).unref();
  opts.httpRequests?.inc({ route: 'html', status: String(status) });
  return new Response(Readable.toWeb(body) as ReadableStream, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

/** Adapts Vite's connect-style middleware to a fetch Response. */
function viteHandle(
  middlewares: ViteDevServer['middlewares'],
  request: Request,
): Promise<Response | undefined> {
  return new Promise((resolveResponse, reject) => {
    const url = new URL(request.url);
    const chunks: Buffer[] = [];
    const headers: Record<string, string> = {};
    let status = 200;
    let handled = false;
    const req = Object.assign(Readable.from([]), {
      url: url.pathname + url.search,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    });
    const res = {
      statusCode: 200,
      setHeader(k: string, v: string) {
        headers[k.toLowerCase()] = String(v);
      },
      getHeader(k: string) {
        return headers[k.toLowerCase()];
      },
      removeHeader(k: string) {
        delete headers[k.toLowerCase()];
      },
      writeHead(code: number, h?: Record<string, string>) {
        status = code;
        for (const [k, v] of Object.entries(h ?? {})) headers[k.toLowerCase()] = String(v);
      },
      write(chunk: string | Buffer) {
        handled = true;
        chunks.push(Buffer.from(chunk));
        return true;
      },
      end(chunk?: string | Buffer) {
        handled = true;
        if (chunk) chunks.push(Buffer.from(chunk));
        resolveResponse(new Response(Buffer.concat(chunks), { status: status || res.statusCode, headers }));
      },
      on() {
        return res;
      },
      once() {
        return res;
      },
      emit() {
        return false;
      },
    };
    middlewares(req as never, res as never, (err?: unknown) => {
      if (err) reject(err);
      else if (!handled) resolveResponse(undefined);
    });
  });
}
