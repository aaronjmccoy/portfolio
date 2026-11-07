// @vitest-environment node
import { mkdir, mkdtemp, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { deriveImages, derivePhotos } from './derive-images.ts';

const LETTER = 'Chapter 1          Test%2FLetter # 1%2F';

// libvips keeps read files mapped while cached, which blocks deleting them on Windows.
sharp.cache(false);

describe('deriveImages', () => {
  let scans: string;
  let out: string;
  beforeAll(async () => {
    const dir = await mkdtemp(join(tmpdir(), 'letters-derive-'));
    scans = join(dir, 'scans');
    out = join(dir, 'data');
    await mkdir(scans);
    const make = (w: number, h: number) => sharp({ create: { width: w, height: h, channels: 3, background: '#777' } });
    await make(1200, 900).png().toFile(join(scans, `${LETTER}A.png`));
    await make(400, 300).jpeg().toFile(join(scans, `${LETTER}B.jpg`));
    await make(640, 480).png().toFile(join(scans, 'Introduction%2Fmap.png'));
    await writeFile(join(scans, `${LETTER}Letter # 1.docx`), 'not an image');
  }, 30_000);
  afterAll(() => rm(dirname(scans), { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }).catch(() => undefined));

  it('writes three renditions per image page, never upscaling, and records sizes', async () => {
    const r = await deriveImages({ scans, out, concurrency: 2 });
    expect(r.failed).toEqual([]);
    expect(r.pages).toBe(3);
    expect(r.written).toBe(9);
    const files = (await readdir(join(out, 'img'))).sort();
    expect(files).toEqual([
      '1-A-1600.webp',
      '1-A-320.webp',
      '1-A-800.webp',
      '1-B-1600.webp',
      '1-B-320.webp',
      '1-B-800.webp',
      'introduction-map-1600.webp',
      'introduction-map-320.webp',
      'introduction-map-800.webp',
      'manifest.json',
    ]);
    expect((await sharp(join(out, 'img', '1-A-1600.webp')).metadata()).width).toBe(1200);
    expect((await sharp(join(out, 'img', '1-A-320.webp')).metadata()).width).toBe(320);
    expect((await sharp(join(out, 'img', '1-B-800.webp')).metadata()).width).toBe(400);
    expect(r.manifest).toEqual({
      '1/A': { width: 1200, height: 900 },
      '1/B': { width: 400, height: 300 },
      'introduction/map': { width: 640, height: 480 },
    });
  }, 30_000);

  it('treats existing renditions as assets: a second run writes nothing even when a source is touched', async () => {
    const touched = join(scans, `${LETTER}A.png`);
    const later = new Date(Date.now() + 60_000);
    await utimes(touched, later, later);
    const r = await deriveImages({ scans, out });
    expect(r.written).toBe(0);
    expect(r.skipped).toBe(3);
  });

  it('writes renditions only for scans added since', async () => {
    await sharp({ create: { width: 500, height: 700, channels: 3, background: '#777' } }).png().toFile(join(scans, `${LETTER}C.png`));
    const r = await deriveImages({ scans, out });
    expect(r.written).toBe(3);
    expect(r.skipped).toBe(3);
    expect(r.manifest['1/C']).toEqual({ width: 500, height: 700 });
  }, 30_000);

  it('dry run with --force reports the work without doing it', async () => {
    const before = (await readdir(join(out, 'img'))).length;
    const r = await deriveImages({ scans, out, dryRun: true, force: true });
    expect(r.written).toBe(12);
    expect((await readdir(join(out, 'img'))).length).toBe(before);
  });
});

describe('derivePhotos', () => {
  let photos: string;
  let out: string;
  beforeAll(async () => {
    const dir = await mkdtemp(join(tmpdir(), 'letters-photos-'));
    photos = join(dir, 'img');
    out = join(dir, 'data');
    await mkdir(photos);
    const make = (w: number, h: number) => sharp({ create: { width: w, height: h, channels: 3, background: '#777' } });
    await make(2000, 1400).png().toFile(join(photos, 'letters.png'));
    await make(824, 545).jpeg().toFile(join(photos, 'image17.jpg'));
    await writeFile(join(photos, 'notes.txt'), 'not an image');
  }, 30_000);
  afterAll(() => rm(dirname(photos), { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }).catch(() => undefined));

  it('writes three renditions per photo, named after the file, never upscaling', async () => {
    const r = await derivePhotos({ photos, out });
    expect(r).toEqual({ photos: 2, written: 6, failed: [] });
    expect((await readdir(join(out, 'photos'))).sort()).toEqual([
      'image17-1600.webp',
      'image17-320.webp',
      'image17-800.webp',
      'letters-1600.webp',
      'letters-320.webp',
      'letters-800.webp',
    ]);
    expect((await sharp(join(out, 'photos', 'image17-1600.webp')).metadata()).width).toBe(824);
    expect((await sharp(join(out, 'photos', 'letters-1600.webp')).metadata()).width).toBe(1600);
  }, 30_000);

  it('is idempotent', async () => {
    expect((await derivePhotos({ photos, out })).written).toBe(0);
  });
});
