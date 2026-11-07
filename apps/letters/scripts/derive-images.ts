/**
 * Derives responsive WebP renditions (320/800/1600 px wide) of every scan in
 * the archive, plus a manifest of the originals' pixel sizes:
 *
 *   <out>/img/<derivedName>-<width>.webp
 *   <out>/img/manifest.json          { "<page id>": { width, height } }
 *
 * With --photos, it does the same for the old site's landing-page photos
 * (a flat folder of JPEG/PNG/WebP), named after the file: `<out>/photos/<name>-<width>.webp`.
 * Their sizes are fixed in src/photos.ts, so no manifest is written for them.
 *
 * Runs on the host that has the archive (VM 104), where the originals stay
 * untouched and keep being served by Caddy under /scans/. The renditions are
 * assets once written: a rendition that exists is never rebuilt (whatever the
 * timestamps say), so a re-run only writes renditions for scans added since,
 * and only --force rebuilds everything. Smaller originals are never upscaled.
 *
 *   node scripts/derive-images.ts --scans /srv/www/germanwarletters.com/public --out /srv/letters-data
 *   node scripts/derive-images.ts --scans /archive --photos /photos --out /data
 *   node scripts/derive-images.ts --dry-run          (LETTERS_SCANS_DIR / LETTERS_PHOTOS_DIR / LETTERS_DATA_DIR from the env)
 */
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import sharp from 'sharp';
import { buildArchiveIndex, derivedName, IMAGE_EXT, WIDTHS } from '../server/archive-index.ts';
import type { ArchiveIndex, Page } from '../server/archive-index.ts';
import { manifestPath } from '../server/dimensions.ts';
import type { Manifest } from '../server/dimensions.ts';

export type DeriveOptions = {
  scans: string;
  out: string;
  dryRun?: boolean;
  /** Rebuild every rendition even when it is newer than its source */
  force?: boolean;
  concurrency?: number;
  log?: (line: string) => void;
};

export type DeriveResult = {
  /** Image pages found in the archive */
  pages: number;
  /** Renditions written (or, with dryRun, that would be) */
  written: number;
  /** Pages whose renditions were all up to date */
  skipped: number;
  failed: { page: string; error: string }[];
  manifest: Manifest;
};

/** Every page the UI shows as an image: letter pages and section-level loose images. */
export function imagePages(index: ArchiveIndex): Page[] {
  const pages = index.letters.flatMap((l) => l.pages);
  for (const s of index.sections) pages.push(...s.loose);
  return pages.filter((p) => IMAGE_EXT.has(p.ext));
}

export async function deriveImages(opts: DeriveOptions): Promise<DeriveResult> {
  const log = opts.log ?? (() => {});
  const index = buildArchiveIndex(await readdir(opts.scans));
  const pages = imagePages(index);
  const imgDir = join(opts.out, 'img');
  if (!opts.dryRun) await mkdir(imgDir, { recursive: true });
  const manifest = await readManifest(manifestPath(opts.out));
  const result: DeriveResult = { pages: pages.length, written: 0, skipped: 0, failed: [], manifest };

  await pool(pages, opts.concurrency ?? Math.max(1, availableParallelism() - 1), async (page) => {
    const src = join(opts.scans, page.file);
    try {
      const targets: { w: number; path: string }[] = [];
      for (const w of WIDTHS) {
        const path = join(imgDir, `${derivedName(page)}-${w}.webp`);
        if (opts.force || !(await exists(path))) targets.push({ w, path });
      }
      if (targets.length === 0 && manifest[page.id]) {
        result.skipped++;
        return;
      }
      if (opts.dryRun) {
        log(`would write ${targets.length} rendition(s) for ${page.id}`);
        result.written += targets.length;
        return;
      }
      // rotate() with no angle applies the EXIF orientation, so the stored
      // size is what the viewer sees, not the sensor's.
      const image = sharp(src, { failOn: 'none' }).rotate();
      const meta = await image.metadata();
      const swap = (meta.orientation ?? 1) >= 5;
      manifest[page.id] = { width: swap ? meta.height : meta.width, height: swap ? meta.width : meta.height };
      for (const t of targets) {
        await image.clone().resize({ width: t.w, withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(t.path);
        result.written++;
      }
      log(`${page.id}: ${targets.length} rendition(s)`);
    } catch (err) {
      result.failed.push({ page: page.id, error: (err as Error).message });
      log(`FAIL ${page.id}: ${(err as Error).message}`);
    }
  });

  if (!opts.dryRun) {
    const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
    await writeFile(manifestPath(opts.out), `${JSON.stringify(sorted, null, 1)}\n`);
  }
  return result;
}

export type PhotoOptions = Pick<DeriveOptions, 'out' | 'dryRun' | 'force' | 'log'> & { photos: string };

/** Renditions of the landing-page photos. Returns how many files were (or would be) written. */
export async function derivePhotos(opts: PhotoOptions): Promise<{ photos: number; written: number; failed: { page: string; error: string }[] }> {
  const log = opts.log ?? (() => {});
  const files = (await readdir(opts.photos)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const outDir = join(opts.out, 'photos');
  if (!opts.dryRun) await mkdir(outDir, { recursive: true });
  const result = { photos: files.length, written: 0, failed: [] as { page: string; error: string }[] };
  for (const file of files) {
    const name = file.replace(/\.[^.]+$/, '');
    const src = join(opts.photos, file);
    try {
      const targets: { w: number; path: string }[] = [];
      for (const w of WIDTHS) {
        const path = join(outDir, `${name}-${w}.webp`);
        if (opts.force || !(await exists(path))) targets.push({ w, path });
      }
      if (opts.dryRun) {
        result.written += targets.length;
        continue;
      }
      const image = sharp(src, { failOn: 'none' }).rotate();
      for (const t of targets) {
        await image.clone().resize({ width: t.w, withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toFile(t.path);
        result.written++;
      }
      if (targets.length) log(`photo ${name}: ${targets.length} rendition(s)`);
    } catch (err) {
      result.failed.push({ page: file, error: (err as Error).message });
      log(`FAIL photo ${file}: ${(err as Error).message}`);
    }
  }
  return result;
}

async function readManifest(path: string): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as Manifest;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function pool<T>(items: readonly T[], size: number, work: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await work(items[next++]!);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      scans: { type: 'string', default: process.env['LETTERS_SCANS_DIR'] },
      photos: { type: 'string', default: process.env['LETTERS_PHOTOS_DIR'] },
      out: { type: 'string', default: process.env['LETTERS_DATA_DIR'] },
      'dry-run': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
      concurrency: { type: 'string' },
      quiet: { type: 'boolean', default: false },
    },
  });
  if (!values.scans || !values.out) {
    console.error('usage: derive-images --scans <archive dir> --out <data dir> [--photos <photo dir>] [--dry-run] [--force] [--concurrency N]');
    process.exit(2);
  }
  const started = Date.now();
  const result = await deriveImages({
    scans: resolve(values.scans),
    out: resolve(values.out),
    dryRun: values['dry-run'],
    force: values.force,
    ...(values.concurrency ? { concurrency: Number(values.concurrency) } : {}),
    ...(values.quiet ? {} : { log: (line: string) => console.log(line) }),
  });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const verb = values['dry-run'] ? 'to write' : 'written';
  console.log(
    `${values['dry-run'] ? 'dry run: ' : ''}${result.pages} image pages, ${result.written} renditions ${verb}, ${result.skipped} up to date, ${result.failed.length} failed, ${secs}s`,
  );
  let failed = result.failed.length;
  if (values.photos) {
    const photos = await derivePhotos({
      photos: resolve(values.photos),
      out: resolve(values.out),
      dryRun: values['dry-run'],
      force: values.force,
      ...(values.quiet ? {} : { log: (line: string) => console.log(line) }),
    });
    console.log(`${photos.photos} photos, ${photos.written} renditions ${verb}, ${photos.failed.length} failed`);
    failed += photos.failed.length;
  }
  if (failed) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
