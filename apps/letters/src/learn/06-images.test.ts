// @vitest-environment node
/**
 * Lesson 6 exercises: the image pipeline.
 * Read docs/learn/06-image-pipeline.md first. Run: pnpm learn 06
 */
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { derivedName } from '../../server/archive-index.ts';
import type { Context } from '../../server/schema.ts';
import { deriveImages } from '../../scripts/derive-images.ts';
import { gql, loadContext } from './helpers.ts';

// libvips keeps read files mapped while cached, which blocks deleting them on Windows.
sharp.cache(false);

/* Exercise 6a: what file name does each page id get on disk? See derivedName. */
const NAMES: Record<string, string> = {
  '441a/pfr100318': '',
  'ch10/Map # 1': '',
};

/* Exercise 6b: the srcset the API hands the <img> for the first page of letter 440. */
const SRCSET = '';

/* Exercise 6c: a dry run over two new scans reports how many renditions? */
const PREDICTED_WRITTEN = 0;

describe('lesson 6: the image pipeline', () => {
  let ctx: Context;
  let scans: string;
  beforeAll(async () => {
    ctx = await loadContext();
    scans = join(await mkdtemp(join(tmpdir(), 'letters-learn-')), 'scans');
    await mkdir(scans);
    const make = (w: number, h: number) => sharp({ create: { width: w, height: h, channels: 3, background: '#777' } });
    await make(1200, 900).png().toFile(join(scans, 'Chapter 1  Test%2FLetter # 1%2FA.png'));
    await make(400, 300).jpeg().toFile(join(scans, 'Chapter 1  Test%2FLetter # 1%2FB.jpg'));
  }, 30_000);
  afterAll(() => rm(dirname(scans), { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }).catch(() => undefined));

  it('6a: derived names are safe for URLs and for two different path decoders', () => {
    for (const [id, expected] of Object.entries(NAMES)) expect(derivedName({ id })).toBe(expected);
  });

  it('6b: Image.srcset is built from the derived name and the three widths', async () => {
    const r = await gql<{ letter: { pages: { image: { srcset: string } }[] } }>(ctx, '{ letter(key: "440") { pages { image { srcset } } } }');
    expect(r.errors).toBeUndefined();
    expect(r.data?.letter.pages[0]?.image.srcset).toBe(SRCSET);
  });

  it('6c: a dry run plans every rendition and writes nothing', async () => {
    const out = join(dirname(scans), 'data');
    const r = await deriveImages({ scans, out, dryRun: true });
    expect(r.failed).toEqual([]);
    expect(r.written).toBe(PREDICTED_WRITTEN);
    // Then say out loud: after a real run, what makes a second run write nothing, and what `--force` changes.
  });
});
