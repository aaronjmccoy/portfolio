/**
 * Mosaic placement from an image's intrinsic size.
 *
 * The home page grid has `--cols` equal columns, and six rows (gaps included)
 * add up to one column. Each tile spans whole rows, so a square image is six
 * rows, a 3:4 portrait eight, and anything wider than 1.3:1 takes two columns.
 * Spans are rounded, so an image is cropped by about half a row; dense auto-placement
 * then fills the holes. All of it is CSS; this only chooses the spans, and it
 * runs on the server with the rest of the page.
 */
export type MosaicSpan = { cols: 1 | 2; rows: number };

/** Rows per column width: a square image is this many rows tall. */
export const ROWS_PER_COLUMN = 6;
/** One extra row under the image for the title and price. */
export const RIBBON_ROWS = 1;
/** Wider than this takes two columns. */
export const LANDSCAPE_RATIO = 1.3;
const MIN_IMAGE_ROWS = 3;
const MAX_IMAGE_ROWS = 10;

export function mosaicSpan(width: number | null | undefined, height: number | null | undefined): MosaicSpan {
  if (!width || !height || width <= 0 || height <= 0) return { cols: 1, rows: ROWS_PER_COLUMN + RIBBON_ROWS };
  const ratio = width / height;
  const cols: 1 | 2 = ratio >= LANDSCAPE_RATIO ? 2 : 1;
  const imageRows = Math.round((ROWS_PER_COLUMN * cols) / ratio);
  return { cols, rows: Math.min(MAX_IMAGE_ROWS, Math.max(MIN_IMAGE_ROWS, imageRows)) + RIBBON_ROWS };
}

/** The `sizes` attribute for a tile: two-column tiles render about twice as wide. */
export function mosaicSizes(cols: 1 | 2): string {
  return cols === 2 ? '(min-width: 60rem) 50vw, 90vw' : '(min-width: 60rem) 25vw, (min-width: 30rem) 45vw, 90vw';
}
