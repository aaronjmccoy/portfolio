import { describe, expect, it } from 'vitest';
import type { DeriveConfig } from './config.ts';
import { fingerprint, plan, printInput, tagFingerprint } from './plan.ts';
import type { Existing, Original } from './shopify.ts';

const config: DeriveConfig = {
  originals: { collection: 'originals' },
  publication: 'Headless',
  prints: {
    collection: 'prints',
    titleSuffix: 'Print',
    option: 'Size',
    sizes: [
      { name: '8 x 10 in', price: '35.00', weightOz: 6 },
      { name: '11 x 14 in', price: '55.00', weightOz: 10 },
    ],
    descriptionHtml: '<p>Print of <em>{title}</em>.</p>',
  },
  stickers: { collection: 'stickers', titleSuffix: 'Sticker', price: '5.00', weightOz: 0.5, descriptionHtml: '<p>{title}</p>' },
};
const collectionIds = new Map([
  ['prints', 'gid://shopify/Collection/1'],
  ['stickers', 'gid://shopify/Collection/2'],
]);
const heron: Original = {
  id: 'gid://shopify/Product/10',
  handle: 'blue-heron',
  title: 'Blue Heron',
  status: 'ACTIVE',
  vendor: 'Maller Art',
  images: [{ url: 'https://cdn.shopify.com/heron-1.jpg', altText: null }],
};
const art = new Map([
  ['blue-heron', { originalHandle: 'blue-heron', originalSource: 'https://staged/heron.png', alt: 'Blue Heron sticker' }],
]);

describe('printInput', () => {
  it('builds one variant per size, untracked, with the original images and an escaped title', () => {
    const input = printInput({ ...heron, title: 'Fish & Chips' }, config, 'gid://shopify/Collection/1');
    expect(input.handle).toBe('blue-heron-print');
    expect(input.title).toBe('Fish & Chips Print');
    expect(input.descriptionHtml).toBe('<p>Print of <em>Fish &amp; Chips</em>.</p>');
    expect(input.variants.map((v) => [v.optionValues[0]?.name, v.price])).toEqual([
      ['8 x 10 in', '35.00'],
      ['11 x 14 in', '55.00'],
    ]);
    expect(input.variants[0]?.inventoryItem).toEqual({
      tracked: false,
      requiresShipping: true,
      measurement: { weight: { value: 6, unit: 'OUNCES' } },
    });
    expect(input.files?.[0]?.originalSource).toBe('https://cdn.shopify.com/heron-1.jpg');
    expect(input.tags).toEqual(['derived', 'print', 'source:blue-heron']);
  });

  it('keeps the derivatives of a draft original in draft', () => {
    expect(printInput({ ...heron, status: 'DRAFT' }, config, 'c').status).toBe('DRAFT');
  });
});

describe('fingerprint', () => {
  it('ignores the fp tag itself and tag order, and changes with price', () => {
    const a = printInput(heron, config, 'c');
    const b = { ...a, tags: [...a.tags].reverse().concat('fp:deadbeef0000') };
    expect(fingerprint(b)).toBe(fingerprint(a));
    const pricier = { ...config, prints: { ...config.prints, sizes: [{ name: '8 x 10 in', price: '36.00', weightOz: 6 }] } };
    expect(fingerprint(printInput(heron, pricier, 'c'))).not.toBe(fingerprint(a));
  });
});

describe('plan', () => {
  it('creates both derivatives for a new original', () => {
    const p = plan({ originals: [heron], existing: [], config, collectionIds, stickerArt: art });
    expect(p.actions.map((a) => [a.kind, a.handle])).toEqual([
      ['create', 'blue-heron-print'],
      ['create', 'blue-heron-sticker'],
    ]);
    const create = p.actions[0];
    expect(create?.kind === 'create' && create.input.tags.some((t) => t.startsWith('fp:'))).toBe(true);
  });

  it('skips an unchanged product and updates a changed one without re-sending images', () => {
    const fp = fingerprint(printInput(heron, config, 'gid://shopify/Collection/1'));
    const existing: Existing[] = [
      {
        id: 'gid://shopify/Product/20',
        handle: 'blue-heron-print',
        tags: ['derived', 'print', 'source:blue-heron', tagFingerprint(fp)],
        mediaCount: 1,
        status: 'ACTIVE',
      },
      {
        id: 'gid://shopify/Product/21',
        handle: 'blue-heron-sticker',
        tags: ['derived', 'sticker', 'source:blue-heron', 'fp:stale'],
        mediaCount: 1,
        status: 'ACTIVE',
      },
    ];
    const p = plan({ originals: [heron], existing, config, collectionIds, stickerArt: art });
    expect(p.actions[0]).toMatchObject({ kind: 'skip', handle: 'blue-heron-print', reason: 'unchanged' });
    const upd = p.actions[1];
    expect(upd?.kind).toBe('update');
    if (upd?.kind === 'update') {
      expect(upd.id).toBe('gid://shopify/Product/21');
      expect(upd.input.files).toBeUndefined();
    }
  });

  it('re-sends images on update when the product has none', () => {
    const existing: Existing[] = [
      { id: 'p', handle: 'blue-heron-print', tags: ['derived', 'source:blue-heron', 'fp:old'], mediaCount: 0, status: 'ACTIVE' },
    ];
    const p = plan({ originals: [heron], existing, config, collectionIds, stickerArt: new Map() });
    const upd = p.actions[0];
    expect(upd?.kind === 'update' && upd.input.files?.length).toBe(1);
    expect(p.actions[1]).toMatchObject({ kind: 'skip', handle: 'blue-heron-sticker', reason: 'no sticker artwork on disk' });
  });

  it('skips prints for an original without images, and reports orphans whose original is gone', () => {
    const bare = { ...heron, handle: 'sketch', title: 'Sketch', images: [] };
    const existing: Existing[] = [{ id: 'o', handle: 'old-print', tags: ['derived', 'source:old'], mediaCount: 1, status: 'ACTIVE' }];
    const p = plan({ originals: [bare], existing, config, collectionIds, stickerArt: new Map() });
    expect(p.actions.map((a) => [a.kind, a.handle])).toEqual([
      ['skip', 'sketch-print'],
      ['skip', 'sketch-sticker'],
      ['orphan', 'old-print'],
    ]);
  });

  it('--only narrows to one original and suppresses orphan checks', () => {
    const other = { ...heron, handle: 'fox', title: 'Fox', id: 'gid://shopify/Product/11' };
    const existing: Existing[] = [{ id: 'o', handle: 'old-print', tags: ['derived', 'source:old'], mediaCount: 1, status: 'ACTIVE' }];
    const p = plan({ originals: [heron, other], existing, config, collectionIds, stickerArt: new Map(), only: 'fox' });
    expect(p.actions.map((a) => a.handle)).toEqual(['fox-print', 'fox-sticker']);
  });
});
