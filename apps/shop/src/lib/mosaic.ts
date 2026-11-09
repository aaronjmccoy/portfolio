/**
 * Mosaic layout from the images' intrinsic sizes.
 *
 * The grid has `cols` equal columns, and six rows (gaps included) add up to
 * one column, so a square image is six rows tall plus one row of ribbon for
 * its title and price. Tiles are packed into bands: each band is a set of
 * column stacks (one or two tiles high, or one landscape tile two columns
 * wide), and every stack in a band is scaled to the same height, so the
 * bottoms of a band are flush. Scaling crops the image (`object-fit: cover`),
 * so the packing minimises the crop: dynamic programming over the order the
 * store gives, with a small bonus for giving a landscape its two columns.
 *
 * The server cannot know the viewport, so callers lay out for two and for
 * three columns and the CSS picks one per breakpoint. On one column the
 * tiles simply stack and none of this applies.
 */
export type Size = { width?: number | null | undefined; height?: number | null | undefined };
export type Placement = { col: number; colSpan: 1 | 2; row: number; rowSpan: number };

/** A square image is this many rows tall. */
export const ROWS_PER_COLUMN = 6;
/** One row under each image for the title and price. */
export const RIBBON_ROWS = 1;
/** Wider than this takes two columns when it can. */
export const LANDSCAPE_RATIO = 1.3;
const MIN_IMAGE_ROWS = 3;
const MAX_IMAGE_ROWS = 10;
const MIN_TILE_ROWS = MIN_IMAGE_ROWS + RIBBON_ROWS;
/** Taken off a band's crop cost for each landscape that gets its two columns. */
const WIDE_BONUS = 0.15;
/** Added for each column a band leaves empty that the remaining tiles could have filled. */
const EMPTY_COLUMN_PENALTY = 0.5;
/** A band that crops any stack by more than this is a last resort. */
const MAX_CROP = 0.25;
const OVER_CROP_PENALTY = 2;

/** Height over width; unknown sizes count as square. */
function ratio(size: Size): number {
  const { width, height } = size;
  if (!width || !height || width <= 0 || height <= 0) return 1;
  return height / width;
}

export function isWide(size: Size): boolean {
  const { width, height } = size;
  if (!width || !height || width <= 0 || height <= 0) return false;
  return width / height >= LANDSCAPE_RATIO;
}

/** Rows a tile wants at its natural proportions, ribbon included. */
export function naturalRows(size: Size, colSpan: 1 | 2): number {
  const image = Math.round(ROWS_PER_COLUMN * colSpan * ratio(size));
  return Math.min(MAX_IMAGE_ROWS, Math.max(MIN_IMAGE_ROWS, image)) + RIBBON_ROWS;
}

type Stack = { items: number[]; colSpan: 1 | 2; natural: number };
type Band = { stacks: Stack[]; count: number; height: number; cost: number };

/** Every way to fill a band from `start`: stacks of one or two tiles, or one wide tile across two columns. */
function candidates(sizes: readonly Size[], start: number, cols: number): Band[] {
  const out: Band[] = [];
  // Columns the tiles from `start` onward could fill at most; a band that ends the list is only blamed for emptiness beyond that.
  let capacity = 0;
  for (let k = start; k < sizes.length && capacity < cols; k++) capacity += isWide(sizes[k] as Size) ? 2 : 1;
  const forcedEmpty = Math.max(0, cols - capacity);
  const rec = (idx: number, colsLeft: number, stacks: Stack[]) => {
    if (colsLeft === 0 || idx >= sizes.length) {
      if (stacks.length) out.push(score(stacks, idx - start, Math.max(0, colsLeft - forcedEmpty)));
      return;
    }
    const one = sizes[idx] as Size;
    if (colsLeft >= 2 && isWide(one)) rec(idx + 1, colsLeft - 2, [...stacks, { items: [idx], colSpan: 2, natural: naturalRows(one, 2) }]);
    rec(idx + 1, colsLeft - 1, [...stacks, { items: [idx], colSpan: 1, natural: naturalRows(one, 1) }]);
    const two = sizes[idx + 1];
    if (two) rec(idx + 2, colsLeft - 1, [...stacks, { items: [idx, idx + 1], colSpan: 1, natural: naturalRows(one, 1) + naturalRows(two, 1) }]);
  };
  rec(start, cols, []);
  return out;
}

/** The band's shared height and what it costs in cropping: the largest fraction any stack loses. */
function score(stacks: Stack[], count: number, emptyCols: number): Band {
  const floor = Math.max(...stacks.map((s) => s.items.length * MIN_TILE_ROWS));
  const mean = stacks.reduce((sum, s) => sum + s.natural, 0) / stacks.length;
  const height = Math.max(floor, Math.round(mean));
  let cost = 0;
  for (const s of stacks) {
    const crop = Math.abs(s.natural - height) / Math.max(s.natural, height);
    if (crop > cost) cost = crop;
  }
  if (cost > MAX_CROP) cost += OVER_CROP_PENALTY;
  cost -= WIDE_BONUS * stacks.filter((s) => s.colSpan === 2).length;
  cost += EMPTY_COLUMN_PENALTY * emptyCols;
  return { stacks, count, height, cost };
}

/** Splits `height` across a stack's tiles in proportion to their natural rows, never below the minimum. */
function scaleRows(naturals: number[], height: number): number[] {
  const total = naturals.reduce((a, b) => a + b, 0);
  const rows = naturals.map((n) => Math.max(MIN_TILE_ROWS, Math.round((n * height) / total)));
  let diff = height - rows.reduce((a, b) => a + b, 0);
  // Rounding leaves a row or two over or short; give it to (or take it from) the tallest tile.
  const tallest = rows.indexOf(Math.max(...rows));
  const target = rows[tallest] as number;
  if (diff < 0 && target + diff < MIN_TILE_ROWS) diff = MIN_TILE_ROWS - target;
  rows[tallest] = target + diff;
  return rows;
}

/** Grid placements (1-based lines) for every image, in the order given, for a grid of `cols` columns. */
export function layoutMosaic(sizes: readonly Size[], cols: 2 | 3): Placement[] {
  const n = sizes.length;
  // best[i] = cheapest way to lay out items i..n-1
  const best: Array<{ cost: number; band: Band | null }> = new Array(n + 1);
  best[n] = { cost: 0, band: null };
  for (let i = n - 1; i >= 0; i--) {
    let pick: { cost: number; band: Band | null } = { cost: Infinity, band: null };
    for (const band of candidates(sizes, i, cols)) {
      const rest = best[i + band.count] as { cost: number };
      const cost = band.cost + rest.cost;
      if (cost < pick.cost) pick = { cost, band };
    }
    best[i] = pick;
  }
  const out: Placement[] = new Array(n);
  let row = 1;
  for (let i = 0; i < n; ) {
    const band = (best[i] as { band: Band }).band;
    let col = 1;
    for (const stack of band.stacks) {
      const spans = scaleRows(stack.items.map((k) => naturalRows(sizes[k] as Size, stack.colSpan)), band.height);
      let r = row;
      stack.items.forEach((k, j) => {
        const rowSpan = spans[j] as number;
        out[k] = { col, colSpan: stack.colSpan, row: r, rowSpan };
        r += rowSpan;
      });
      col += stack.colSpan;
    }
    row += band.height;
    i += band.count;
  }
  return out;
}

/** The `sizes` attribute for a tile from its column spans at two and three columns. */
export function mosaicSizes(at2: 1 | 2, at3: 1 | 2): string {
  return `(min-width: 60rem) ${at3 === 2 ? 50 : 25}vw, (min-width: 30rem) ${at2 === 2 ? 90 : 45}vw, 90vw`;
}

export type MosaicVars = Record<`--m${2 | 3}-${'c' | 'cs' | 'r' | 'rs'}`, number>;

/** Custom properties the stylesheet reads: `--m2-*` at two columns, `--m3-*` at three. */
export function placementVars(at2: Placement, at3: Placement): MosaicVars {
  return {
    '--m2-c': at2.col,
    '--m2-cs': at2.colSpan,
    '--m2-r': at2.row,
    '--m2-rs': at2.rowSpan,
    '--m3-c': at3.col,
    '--m3-cs': at3.colSpan,
    '--m3-r': at3.row,
    '--m3-rs': at3.rowSpan,
  };
}
