/**
 * The pure half: given the originals in the store, the derived products that already
 * exist, and the config, decide what to create, update, or leave alone. Nothing here
 * talks to Shopify, so it is unit-tested with fixtures.
 */
import { createHash } from 'node:crypto';
import type { DeriveConfig } from './config.ts';
import type { Existing, FileInput, Original, ProductSetInput } from './shopify.ts';

export const TAG_DERIVED = 'derived';
export const tagSource = (handle: string) => `source:${handle}`;
export const tagFingerprint = (fp: string) => `fp:${fp}`;

export type StickerArt = { originalHandle: string; originalSource: string; alt: string };

export type Action =
  | { kind: 'create'; handle: string; input: ProductSetInput; source: string; sourceId: string }
  | { kind: 'update'; handle: string; input: ProductSetInput; source: string; sourceId: string; id: string }
  | { kind: 'skip'; handle: string; source: string; reason: string }
  | { kind: 'orphan'; handle: string; id: string; source: string };

export type Plan = { actions: Action[]; collections: string[] };

/** Stable hash of everything productSet would send, so an unchanged product is a no-op. */
export function fingerprint(input: ProductSetInput): string {
  const { tags, ...rest } = input;
  const body = JSON.stringify({ ...rest, tags: tags.filter((t) => !t.startsWith('fp:')).sort() });
  return createHash('sha1').update(body).digest('hex').slice(0, 12);
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fill = (html: string, title: string) => html.replaceAll('{title}', escapeHtml(title));
const weight = (oz: number) => ({ weight: { value: oz, unit: 'OUNCES' as const } });
const imageFiles = (images: Original['images'], alt: string): FileInput[] =>
  images.map((img) => ({
    originalSource: img.url,
    alt: img.altText ?? alt,
    contentType: 'IMAGE',
    duplicateResolutionMode: 'APPEND_UUID',
  }));

export function printInput(o: Original, cfg: DeriveConfig, collectionId: string): ProductSetInput {
  const option = cfg.prints.option;
  return {
    handle: `${o.handle}-print`,
    title: `${o.title} ${cfg.prints.titleSuffix}`,
    descriptionHtml: fill(cfg.prints.descriptionHtml, o.title),
    vendor: o.vendor,
    productType: cfg.prints.titleSuffix,
    status: o.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
    tags: [TAG_DERIVED, 'print', tagSource(o.handle)],
    collections: [collectionId],
    files: imageFiles(o.images, `${o.title}, print`),
    productOptions: [{ name: option, position: 1, values: cfg.prints.sizes.map((s) => ({ name: s.name })) }],
    variants: cfg.prints.sizes.map((s) => ({
      optionValues: [{ optionName: option, name: s.name }],
      price: s.price,
      inventoryPolicy: 'CONTINUE',
      inventoryItem: { tracked: false, requiresShipping: true, measurement: weight(s.weightOz) },
    })),
  };
}

export function stickerInput(o: Original, cfg: DeriveConfig, collectionId: string, art: StickerArt): ProductSetInput {
  return {
    handle: `${o.handle}-sticker`,
    title: `${o.title} ${cfg.stickers.titleSuffix}`,
    descriptionHtml: fill(cfg.stickers.descriptionHtml, o.title),
    vendor: o.vendor,
    productType: cfg.stickers.titleSuffix,
    status: o.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
    tags: [TAG_DERIVED, 'sticker', tagSource(o.handle)],
    collections: [collectionId],
    files: [{ originalSource: art.originalSource, alt: art.alt, contentType: 'IMAGE', duplicateResolutionMode: 'APPEND_UUID' }],
    productOptions: [{ name: 'Title', position: 1, values: [{ name: 'Default Title' }] }],
    variants: [
      {
        optionValues: [{ optionName: 'Title', name: 'Default Title' }],
        price: cfg.stickers.price,
        inventoryPolicy: 'CONTINUE',
        inventoryItem: { tracked: false, requiresShipping: true, measurement: weight(cfg.stickers.weightOz) },
      },
    ],
  };
}

export type PlanInput = {
  originals: Original[];
  existing: Existing[];
  config: DeriveConfig;
  collectionIds: Map<string, string>;
  /** Sticker artwork available on disk, keyed by original handle. */
  stickerArt: Map<string, StickerArt>;
  only?: string | undefined;
};

export function plan({ originals, existing, config, collectionIds, stickerArt, only }: PlanInput): Plan {
  const printsId = collectionIds.get(config.prints.collection);
  const stickersId = collectionIds.get(config.stickers.collection);
  if (!printsId || !stickersId) throw new Error('plan: collection ids missing');
  const byHandle = new Map(existing.map((e) => [e.handle, e] as const));
  const actions: Action[] = [];
  const wanted = new Set<string>();

  const decide = (o: Original, input: ProductSetInput) => {
    wanted.add(input.handle);
    const fp = fingerprint(input);
    const tagged: ProductSetInput = { ...input, tags: [...input.tags, tagFingerprint(fp)] };
    const prev = byHandle.get(input.handle);
    if (!prev) {
      actions.push({ kind: 'create', handle: input.handle, input: tagged, source: o.handle, sourceId: o.id });
      return;
    }
    if (prev.tags.includes(tagFingerprint(fp))) {
      actions.push({ kind: 'skip', handle: input.handle, source: o.handle, reason: 'unchanged' });
      return;
    }
    // productSet replaces the media set; re-sending the same images would duplicate them.
    const withoutFiles: ProductSetInput = { ...tagged };
    delete withoutFiles.files;
    const update = prev.mediaCount > 0 ? withoutFiles : tagged;
    actions.push({ kind: 'update', handle: input.handle, input: update, source: o.handle, sourceId: o.id, id: prev.id });
  };

  for (const o of originals) {
    if (only && o.handle !== only) continue;
    if (o.images.length === 0) {
      actions.push({ kind: 'skip', handle: `${o.handle}-print`, source: o.handle, reason: 'original has no images yet' });
    } else {
      decide(o, printInput(o, config, printsId));
    }
    const art = stickerArt.get(o.handle);
    if (art) decide(o, stickerInput(o, config, stickersId, art));
    else actions.push({ kind: 'skip', handle: `${o.handle}-sticker`, source: o.handle, reason: 'no sticker artwork on disk' });
  }

  if (!only) {
    const sources = new Set(originals.map((o) => o.handle));
    for (const e of existing) {
      const src = e.tags.find((t) => t.startsWith('source:'))?.slice('source:'.length) ?? '?';
      if (!sources.has(src) && !wanted.has(e.handle)) actions.push({ kind: 'orphan', handle: e.handle, id: e.id, source: src });
    }
  }

  return { actions, collections: [config.prints.collection, config.stickers.collection] };
}
