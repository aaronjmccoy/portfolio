/** The derive command: originals in, print and sticker products out. */
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { AdminClient } from './admin.ts';
import { parseConfig, type DeriveConfig } from './config.ts';
import { plan, type Action, type StickerArt } from './plan.ts';
import {
  ensureCollections,
  fetchByHandles,
  fetchExistingDerived,
  fetchOriginals,
  fetchPublicationId,
  productSet,
  publish,
  stageUpload,
} from './shopify.ts';

export type DeriveOptions = { configPath: string; stickerDir: string; dryRun: boolean; only?: string | undefined };

const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

/** stickers/<original-handle>.(png|jpg|webp): the artwork for that original's sticker. */
async function listStickerArt(dir: string): Promise<Map<string, { file: string; mime: string }>> {
  const out = new Map<string, { file: string; mime: string }>();
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    const mime = MIME[extname(name).toLowerCase()];
    if (mime) out.set(name.slice(0, -extname(name).length), { file: join(dir, name), mime });
  }
  return out;
}

export async function loadConfig(path: string): Promise<DeriveConfig> {
  return parseConfig(JSON.parse(await readFile(path, 'utf8')));
}

export async function derive(opts: DeriveOptions, env: NodeJS.ProcessEnv = process.env, log = console.log): Promise<Action[]> {
  const config = await loadConfig(opts.configPath);
  const client = new AdminClient(env);
  const [originals, tagged, publicationId, collectionIds] = await Promise.all([
    fetchOriginals(client, config.originals.collection),
    fetchExistingDerived(client),
    fetchPublicationId(client, config.publication),
    ensureCollections(client, [config.prints.collection, config.stickers.collection], opts.dryRun),
  ]);
  // Direct handle lookups are consistent; the tag search (for orphans) may lag behind recent writes.
  const expected = originals.flatMap((o) => [`${o.handle}-print`, `${o.handle}-sticker`]);
  const byHandle = await fetchByHandles(client, expected);
  const seen = new Set(byHandle.map((e) => e.handle));
  const existing = [...byHandle, ...tagged.filter((e) => !seen.has(e.handle))];
  log(`${originals.length} originals in "${config.originals.collection}", ${existing.length} derived products already in the store`);
  if (originals.length === 0) {
    log(`nothing to do: add originals to the "${config.originals.collection}" collection in the Shopify admin first`);
    return [];
  }

  // Sticker artwork is uploaded only for originals that need a create or update, and only when not a dry run.
  const artFiles = await listStickerArt(opts.stickerDir);
  const stickerArt = new Map<string, StickerArt>();
  for (const o of originals) {
    const f = artFiles.get(o.handle);
    if (f) stickerArt.set(o.handle, { originalHandle: o.handle, originalSource: `file:${f.file}`, alt: `${o.title} sticker` });
  }

  const { actions } = plan({ originals, existing, config, collectionIds, stickerArt, only: opts.only });
  for (const a of actions) {
    if (a.kind === 'skip') log(`  skip    ${a.handle}  (${a.reason})`);
    else if (a.kind === 'orphan') log(`  orphan  ${a.handle}  original "${a.source}" is no longer in the collection; archive it in the admin`);
    else log(`  ${a.kind.padEnd(7)} ${a.handle}  from ${a.source}${a.input.files ? `, ${a.input.files.length} image(s)` : ''}`);
  }
  const work = actions.filter((a): a is Extract<Action, { kind: 'create' | 'update' }> => a.kind === 'create' || a.kind === 'update');
  if (opts.dryRun) {
    log(`dry run: ${work.length} product(s) would be written`);
    return actions;
  }

  for (const a of work) {
    const input = { ...a.input };
    if (input.files) {
      input.files = await Promise.all(
        input.files.map(async (f) => {
          if (!f.originalSource.startsWith('file:')) return f;
          const path = f.originalSource.slice('file:'.length);
          const bytes = new Uint8Array(await readFile(path));
          const url = await stageUpload(client, basename(path), MIME[extname(path).toLowerCase()] ?? 'image/png', bytes);
          return { ...f, originalSource: url };
        }),
      );
    }
    const id = await productSet(client, input);
    await publish(client, id, publicationId);
    log(`  wrote   ${a.handle}  ${id}`);
  }
  log(`done: ${work.length} product(s) written and published to "${config.publication}"`);
  return actions;
}
