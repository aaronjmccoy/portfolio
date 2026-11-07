// @vitest-environment node
/**
 * Lesson 5 exercises: streaming SSR, the serialized Relay store, hydration.
 * Read docs/learn/05-ssr-hydration.md first. Run: pnpm learn 05
 */
import { Writable } from 'node:stream';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Context } from '../../server/schema.ts';
import { render } from '../entry-server.tsx';
import { RELAY_DATA_ID } from '../relay/environment.ts';
import { loadContext } from './helpers.ts';

/* Exercise 5a: predict what the server answers for a chapter that does not
 * exist. Read `lookup` in src/entry-server.tsx and `pageTitle` in
 * src/components/Title.tsx. */
const NOT_FOUND = { status: 0, title: '' };

/* Exercise 5b: the key under `client:root` that holds letter 440 in the
 * serialized store. (Relay keys root fields by name and arguments.) */
const ROOT_FIELD = '';

/** Renders a URL the way packages/ssr does, collecting the stream into a string. */
async function renderToString(url: string, ctx: Context) {
  const result = await render(url, {}, ctx);
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const sink = new Writable({
      write(chunk: Buffer, _enc, cb) {
        chunks.push(chunk);
        cb();
      },
    });
    sink.on('finish', resolve).on('error', reject);
    result.pipe(sink);
  });
  return { ...result, html: Buffer.concat(chunks).toString() };
}

describe('lesson 5: SSR and hydration', () => {
  let ctx: Context;
  beforeAll(async () => {
    ctx = await loadContext();
  });

  it('5a: a letter page streams with its title, status and first scan', async () => {
    // The first half passes today; trace it: preloadRoute → lookup →
    // renderToPipeableStream. Then fill in NOT_FOUND for the second half.
    const r = await renderToString('/letter/440', ctx);
    expect(r.status).toBe(200);
    expect(r.head).toContain('<title>Letter 440 — German War Letters</title>');
    expect(r.html).toContain('Page 1 of 4');

    const nope = await renderToString('/chapter/nope', ctx);
    expect(nope.status).toBe(NOT_FOUND.status);
    expect(nope.head).toContain(`<title>${NOT_FOUND.title}</title>`);
  });

  it('5b: the tail carries the Relay store the client hydrates from', async () => {
    const r = await renderToString('/letter/440', ctx);
    const json = /<script id="(\w+)" type="application\/json">(.*?)<\/script>/.exec(r.tail ?? '');
    expect(json?.[1]).toBe(RELAY_DATA_ID);
    const records = JSON.parse(json?.[2] ?? '{}') as Record<string, Record<string, unknown>>;
    expect(records['client:root']).toHaveProperty(ROOT_FIELD);
    // Every Node is one flat record; which key holds letter 440? (Lesson 3 told you.)
    expect(records['TGV0dGVyOjQ0MA==']).toMatchObject({ __typename: 'Letter', number: 440 });
  });

  it('5c: add an Open Graph title to the head in entry-server.tsx', async () => {
    const r = await renderToString('/letter/440', ctx);
    expect(r.head).toContain('property="og:title"');
    expect(r.head).toContain('content="Letter 440 — German War Letters"');
  });
});
