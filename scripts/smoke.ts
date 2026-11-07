/**
 * Boots each SSR app from its production build and checks that it answers:
 * /healthz, a server-rendered page with hydration markup, and (letters) a
 * GraphQL query. Run after `pnpm build`. Exits non-zero on any failure.
 */
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { resolve } from 'node:path';

type Check = { name: string; dir: string; port: number; metricsPort: number; run: (base: string) => Promise<void> };

const root = resolve(import.meta.dirname, '..');

async function expectText(res: Response, needle: string, label: string): Promise<string> {
  const text = await res.text();
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  if (!text.includes(needle)) throw new Error(`${label}: missing "${needle}" in:\n${text.slice(0, 400)}`);
  return text;
}

const checks: Check[] = [
  {
    name: 'shop',
    dir: 'apps/shop',
    port: 3900,
    metricsPort: 9900,
    async run(base) {
      await expectText(await fetch(`${base}/`), '<main id="main"', 'shop /');
      await expectText(await fetch(`${base}/`), '/assets/', 'shop / asset tags');
    },
  },
  {
    name: 'letters',
    dir: 'apps/letters',
    port: 3901,
    metricsPort: 9901,
    async run(base) {
      const home = await expectText(await fetch(`${base}/`), '<main id="main"', 'letters /');
      if (!home.includes('Memories of a Lost Generation')) throw new Error('letters /: home page not server-rendered');
      if (home.includes('<template id="B:')) throw new Error('letters /: home page outlined behind a script (blank without JS)');
      const contents = await expectText(await fetch(`${base}/letters`), '<main id="main"', 'letters /letters');
      if (!contents.includes('Chapter 3')) throw new Error('letters /letters: contents not server-rendered');
      const letter = await expectText(await fetch(`${base}/letter/440`), '<h1 class="letter__title">Letter 440</h1>', 'letters /letter/440');
      if (!letter.includes('id="__RELAY_DATA__"')) throw new Error('letters /letter/440: Relay store not embedded');
      if (!letter.includes('<title>Letter 440')) throw new Error('letters /letter/440: title not derived from the store');
      const missing = await fetch(`${base}/letter/nope`);
      if (missing.status !== 404) throw new Error(`letters /letter/nope: expected 404, got ${missing.status}`);
      const res = await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: '{ sections { key title letterCount } letter(key: "440") { number pageCount section { title } } }',
        }),
      });
      const json = (await res.json()) as { data?: { sections: unknown[]; letter: { pageCount: number } }; errors?: unknown };
      if (json.errors) throw new Error(`letters graphql errors: ${JSON.stringify(json.errors)}`);
      if (!json.data || json.data.sections.length < 10) throw new Error(`letters graphql: expected 12 sections, got ${JSON.stringify(json.data).slice(0, 200)}`);
      if (json.data.letter.pageCount < 1) throw new Error('letters graphql: letter 440 has no pages');
      const metrics = await (await fetch(`http://127.0.0.1:${this.metricsPort}/metrics`)).text();
      if (!metrics.includes('letters_graphql_requests_total')) throw new Error('letters metrics missing graphql counter');
    },
  },
];

async function waitFor(url: string, child: ChildProcess, ms = 15_000): Promise<void> {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if (child.exitCode !== null) throw new Error(`server exited early with ${child.exitCode}`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`timed out waiting for ${url}`);
}

let failed = false;
for (const check of checks) {
  const child = spawn(process.execPath, ['server/index.ts'], {
    cwd: resolve(root, check.dir),
    env: { ...process.env, NODE_ENV: 'production', PORT: String(check.port), METRICS_PORT: String(check.metricsPort), METRICS_BIND: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout?.on('data', (d: Buffer) => (output += d));
  child.stderr?.on('data', (d: Buffer) => (output += d));
  const base = `http://127.0.0.1:${check.port}`;
  try {
    await waitFor(`${base}/healthz`, child);
    await check.run(base);
    console.log(`ok   ${check.name}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${check.name}: ${(err as Error).message}\n--- server output ---\n${output}`);
  } finally {
    // Wait for the child to actually exit; exiting while its handles are still
    // closing trips a libuv assertion on Windows.
    const exited = new Promise<void>((r) => child.once('exit', () => r()));
    child.kill();
    await exited;
  }
}
process.exit(failed ? 1 : 0);
