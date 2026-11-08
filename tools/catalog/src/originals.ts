/**
 * The originals command: draft products from a folder of photographs.
 *
 * Photos are named by handle: `the-bishop.jpg` is the main shot of "The Bishop",
 * `the-bishop-closeup.jpg` and `the-bishop-edge.jpg` are its details. A set with
 * no bare file (`starstuff-full.jpg`, `starstuff-head.jpg`, …) groups by its
 * shared stem. Each handle becomes one DRAFT product in the originals
 * collection with every shot attached, published to the storefront channel but
 * invisible until Megan prices it and sets it active in the admin. Handles that
 * already exist are left alone, so re-running is safe.
 */
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { AdminClient } from './admin.ts';
import { loadConfig } from './derive.ts';
import { ensureCollections, fetchByHandles, fetchPublicationId, productSet, publish, stageUpload } from './shopify.ts';

const MIME: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

export type PhotoSet = { handle: string; title: string; files: string[] };

/** Title Case from a handle: "three-brothers" → "Three Brothers", "the-bishop" → "The Bishop". */
export function titleFromHandle(handle: string): string {
  return handle
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Groups image file names into sets. A name belongs to the longest other name
 * that prefixes it at a dash; names left over that share a stem with at least
 * one sibling (and have no bare parent) group under that stem. The main shot
 * sorts first: the bare name, then `-full`, then the rest alphabetically.
 */
export function groupPhotos(fileNames: readonly string[], skip: ReadonlySet<string> = new Set()): PhotoSet[] {
  const stems = fileNames
    .filter((f) => MIME[extname(f).toLowerCase()])
    .map((f) => ({ file: f, stem: basename(f, extname(f)) }))
    .filter(({ stem }) => !skip.has(stem));
  const names = new Set(stems.map((s) => s.stem));
  const rootOf = (stem: string): string => {
    let best: string | undefined;
    for (const n of names) if (n !== stem && stem.startsWith(`${n}-`) && (!best || n.length > best.length)) best = n;
    return best ? rootOf(best) : stem;
  };
  const groups = new Map<string, string[]>();
  for (const { file, stem } of stems) {
    const root = rootOf(stem);
    groups.set(root, [...(groups.get(root) ?? []), file]);
  }
  // Orphans: single-file groups whose stem minus its last segment is shared with another orphan.
  const orphans = [...groups.entries()].filter(([, files]) => files.length === 1).map(([root]) => root);
  const byParent = new Map<string, string[]>();
  for (const o of orphans) {
    const cut = o.lastIndexOf('-');
    if (cut > 0) byParent.set(o.slice(0, cut), [...(byParent.get(o.slice(0, cut)) ?? []), o]);
  }
  for (const [parent, members] of byParent) {
    if (members.length < 2 || names.has(parent)) continue;
    const files = members.flatMap((m) => groups.get(m) ?? []);
    for (const m of members) groups.delete(m);
    groups.set(parent, files);
  }
  const rank = (handle: string, file: string) => {
    const stem = basename(file, extname(file));
    return stem === handle ? 0 : stem === `${handle}-full` ? 1 : 2;
  };
  return [...groups.entries()]
    .map(([handle, files]) => ({
      handle,
      title: titleFromHandle(handle),
      files: [...files].sort((a, b) => rank(handle, a) - rank(handle, b) || a.localeCompare(b)),
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

export type OriginalsOptions = { dir: string; configPath: string; dryRun: boolean; only?: string | undefined; skip: readonly string[] };

export async function originals(opts: OriginalsOptions, env: NodeJS.ProcessEnv = process.env, log = console.log): Promise<PhotoSet[]> {
  const config = await loadConfig(opts.configPath);
  const sets = groupPhotos(await readdir(opts.dir), new Set(opts.skip)).filter((s) => !opts.only || s.handle === opts.only);
  if (sets.length === 0) {
    log(`no photo sets in ${opts.dir}`);
    return [];
  }
  const client = new AdminClient(env);
  const publicationId = await fetchPublicationId(client, config.publication);
  const [existing, collectionIds] = await Promise.all([
    fetchByHandles(client, sets.map((s) => s.handle)),
    ensureCollections(client, [config.originals.collection], opts.dryRun, publicationId),
  ]);
  const have = new Set(existing.map((e) => e.handle));
  const collectionId = collectionIds.get(config.originals.collection);
  if (!collectionId) throw new Error('originals collection missing');

  for (const s of sets) {
    const state = have.has(s.handle) ? 'exists' : 'create';
    log(`  ${state.padEnd(7)} ${s.handle.padEnd(28)} "${s.title}"  ${s.files.length} photo(s): ${s.files.join(', ')}`);
  }
  const work = sets.filter((s) => !have.has(s.handle));
  if (opts.dryRun) {
    log(`dry run: ${work.length} draft original(s) would be created`);
    return sets;
  }
  for (const s of work) {
    const files = [];
    for (const f of s.files) {
      const path = join(opts.dir, f);
      const bytes = new Uint8Array(await readFile(path));
      const url = await stageUpload(client, f, MIME[extname(f).toLowerCase()] ?? 'image/jpeg', bytes);
      files.push({ originalSource: url, alt: `${s.title}${f === s.files[0] ? '' : ', detail'}`, contentType: 'IMAGE' as const, duplicateResolutionMode: 'APPEND_UUID' as const });
    }
    const id = await productSet(client, {
      handle: s.handle,
      title: s.title,
      descriptionHtml: '',
      vendor: 'Maller Art',
      productType: 'Original',
      status: 'DRAFT',
      tags: ['original'],
      collections: [collectionId],
      files,
      productOptions: [{ name: 'Title', position: 1, values: [{ name: 'Default Title' }] }],
      variants: [
        {
          optionValues: [{ optionName: 'Title', name: 'Default Title' }],
          price: '0.00',
          inventoryPolicy: 'DENY',
          inventoryItem: { tracked: false, requiresShipping: true, measurement: { weight: { value: 16, unit: 'OUNCES' } } },
        },
      ],
    });
    await publish(client, id, publicationId);
    log(`  wrote   ${s.handle}  ${id}`);
  }
  log(`done: ${work.length} draft original(s) created; set price, description and status in the Shopify admin`);
  return sets;
}
