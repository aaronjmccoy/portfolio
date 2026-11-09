import { describe, expect, it } from 'vitest';
import { LANDSCAPE_RATIO, RIBBON_ROWS, ROWS_PER_COLUMN, mosaicSizes, mosaicSpan } from './mosaic.ts';

describe('mosaicSpan', () => {
  it('gives a square image one column and a column-height of rows plus the ribbon', () => {
    expect(mosaicSpan(1000, 1000)).toEqual({ cols: 1, rows: ROWS_PER_COLUMN + RIBBON_ROWS });
  });

  it('makes a portrait taller, rounded to whole rows', () => {
    // 2160x2880 is 3:4 -> 8 image rows
    expect(mosaicSpan(2160, 2880)).toEqual({ cols: 1, rows: 8 + RIBBON_ROWS });
    // the Starstuff full shot, 2160x3237 -> 9 rows
    expect(mosaicSpan(2160, 3237)).toEqual({ cols: 1, rows: 9 + RIBBON_ROWS });
  });

  it('spreads a landscape across two columns with rows for the doubled width', () => {
    // Flaunt, 997x731 -> 1.36:1 -> two columns, 12 / 1.36 = 8.8 -> 9 rows
    expect(mosaicSpan(997, 731)).toEqual({ cols: 2, rows: 9 + RIBBON_ROWS });
    expect(mosaicSpan(1300, 1000).cols).toBe(2);
    expect(mosaicSpan(1299, 1000).cols).toBe(1);
    expect(LANDSCAPE_RATIO).toBe(1.3);
  });

  it('clamps extreme ratios so one image cannot dominate the grid', () => {
    expect(mosaicSpan(100, 1000).rows).toBe(10 + RIBBON_ROWS);
    expect(mosaicSpan(1000, 100).rows).toBe(3 + RIBBON_ROWS);
  });

  it('falls back to a square tile when the size is unknown', () => {
    expect(mosaicSpan(null, null)).toEqual({ cols: 1, rows: ROWS_PER_COLUMN + RIBBON_ROWS });
    expect(mosaicSpan(0, 500)).toEqual({ cols: 1, rows: ROWS_PER_COLUMN + RIBBON_ROWS });
  });
});

describe('mosaicSizes', () => {
  it('asks for a wider image for a two-column tile', () => {
    expect(mosaicSizes(2)).toContain('50vw');
    expect(mosaicSizes(1)).toContain('25vw');
  });
});
