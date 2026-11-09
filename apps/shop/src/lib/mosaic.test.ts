import { describe, expect, it } from 'vitest';
import type { Placement, Size } from './mosaic.ts';
import { RIBBON_ROWS, ROWS_PER_COLUMN, isWide, layoutMosaic, mosaicSizes, naturalRows, placementVars } from './mosaic.ts';

/** The nine originals as the store reports them today. */
const ORIGINALS: Size[] = [
  { width: 2160, height: 2880 }, // tough-guy 3:4
  { width: 1890, height: 3735 }, // three-brothers, very tall
  { width: 2160, height: 2200 }, // the-bishop, near square
  { width: 2160, height: 2880 }, // peering
  { width: 990, height: 1463 }, // mask-man
  { width: 2160, height: 2231 }, // little-king
  { width: 997, height: 731 }, // flaunt, landscape
  { width: 2160, height: 2181 }, // feather-bedfellows-study
  { width: 2160, height: 3237 }, // starstuff
];

/** Every band must be flush: no two tiles overlap, and no column ends short of another inside a band. */
function cells(placements: Placement[]): Map<string, number> {
  const taken = new Map<string, number>();
  placements.forEach((p, i) => {
    for (let c = p.col; c < p.col + p.colSpan; c++) {
      for (let r = p.row; r < p.row + p.rowSpan; r++) {
        const key = `${c}:${r}`;
        expect(taken.has(key), `tile ${i} overlaps tile ${taken.get(key)} at ${key}`).toBe(false);
        taken.set(key, i);
      }
    }
  });
  return taken;
}

function assertFlush(placements: Placement[], cols: number) {
  const taken = cells(placements);
  const last = Math.max(...placements.map((p) => p.row + p.rowSpan - 1));
  // Every row is either fully occupied across all columns or, only at the very end, partly empty.
  let sawGap = false;
  for (let r = 1; r <= last; r++) {
    const filled = Array.from({ length: cols }, (_, c) => taken.has(`${c + 1}:${r}`)).filter(Boolean).length;
    if (filled < cols) sawGap = true;
    else expect(sawGap, `row ${r} is full after an unfilled row: a band did not end flush`).toBe(false);
  }
}

describe('naturalRows', () => {
  it('counts six rows for a square image plus the ribbon', () => {
    expect(naturalRows({ width: 1000, height: 1000 }, 1)).toBe(ROWS_PER_COLUMN + RIBBON_ROWS);
    expect(naturalRows({ width: 2160, height: 2880 }, 1)).toBe(8 + RIBBON_ROWS);
  });
  it('doubles for a two-column tile and clamps extremes', () => {
    expect(naturalRows({ width: 997, height: 731 }, 2)).toBe(9 + RIBBON_ROWS);
    expect(naturalRows({ width: 100, height: 1000 }, 1)).toBe(10 + RIBBON_ROWS);
    expect(naturalRows({ width: 1000, height: 100 }, 1)).toBe(3 + RIBBON_ROWS);
    expect(naturalRows({}, 1)).toBe(ROWS_PER_COLUMN + RIBBON_ROWS);
  });
  it('calls 1.3:1 and wider landscape', () => {
    expect(isWide({ width: 1300, height: 1000 })).toBe(true);
    expect(isWide({ width: 1299, height: 1000 })).toBe(false);
    expect(isWide({})).toBe(false);
  });
});

describe('layoutMosaic', () => {
  for (const cols of [2, 3] as const) {
    it(`places every original at ${cols} columns without overlap and with flush bands`, () => {
      const placements = layoutMosaic(ORIGINALS, cols);
      expect(placements).toHaveLength(ORIGINALS.length);
      for (const p of placements) {
        expect(p.col).toBeGreaterThanOrEqual(1);
        expect(p.col + p.colSpan - 1).toBeLessThanOrEqual(cols);
        expect(p.rowSpan).toBeGreaterThanOrEqual(4);
      }
      assertFlush(placements, cols);
    });
  }

  it('gives the landscape its two columns', () => {
    const flaunt = layoutMosaic(ORIGINALS, 3)[6];
    expect(flaunt?.colSpan).toBe(2);
    expect(layoutMosaic(ORIGINALS, 2)[6]?.colSpan).toBe(2);
  });

  it('keeps tiles near their natural height: a 3:4 beside a square costs each at most two rows', () => {
    const [a, b, c] = layoutMosaic([{ width: 3, height: 4 }, { width: 1, height: 1 }, { width: 3, height: 4 }], 3);
    expect(a?.rowSpan).toBe(b?.rowSpan);
    expect(b?.rowSpan).toBe(c?.rowSpan);
    expect(Math.abs((a?.rowSpan ?? 0) - 9)).toBeLessThanOrEqual(2);
  });

  it('stacks two short tiles beside a tall one rather than cropping the tall one hard', () => {
    // a very tall portrait, then two landscapes that are not quite wide enough for two columns
    const placements = layoutMosaic(
      [
        { width: 1, height: 2 },
        { width: 5, height: 4 },
        { width: 5, height: 4 },
      ],
      2,
    );
    const [tall, s1, s2] = placements;
    expect(tall?.col).toBe(1);
    expect(s1?.col).toBe(2);
    expect(s2?.col).toBe(2);
    expect((s1?.rowSpan ?? 0) + (s2?.rowSpan ?? 0)).toBe(tall?.rowSpan);
    assertFlush(placements, 2);
  });

  it('does not leave columns empty while tiles remain: a trailing landscape takes two columns and the last tile sits beside it', () => {
    const placements = layoutMosaic(ORIGINALS.slice(6, 8), 3); // flaunt, feather-bedfellows-study
    expect(placements[0]).toMatchObject({ col: 1, colSpan: 2, row: 1 });
    expect(placements[1]).toMatchObject({ col: 3, colSpan: 1, row: 1 });
    expect(placements[0]?.rowSpan).toBe(placements[1]?.rowSpan);
  });

  it('keeps a trailing landscape wide at two columns, leaving the last tile alone below it', () => {
    const [flaunt, feather] = layoutMosaic(ORIGINALS.slice(6, 8), 2);
    expect(flaunt).toMatchObject({ col: 1, colSpan: 2, row: 1 });
    expect(feather?.row).toBe((flaunt?.row ?? 0) + (flaunt?.rowSpan ?? 0));
  });

  it('would rather leave a tile alone at the end than crop a landscape toward square', () => {
    // flaunt, feather-bedfellows-study, starstuff at three columns: not flaunt beside a two-tile stack
    const [flaunt, feather, star] = layoutMosaic(ORIGINALS.slice(6, 9), 3);
    expect(flaunt?.colSpan).toBe(2);
    expect(flaunt?.rowSpan).toBeLessThanOrEqual(12);
    expect(feather?.row).toBe(1);
    expect(star?.row).toBeGreaterThan(1);
  });

  it('handles one tile, and none', () => {
    expect(layoutMosaic([], 3)).toEqual([]);
    expect(layoutMosaic([{ width: 1, height: 1 }], 3)).toEqual([{ col: 1, colSpan: 1, row: 1, rowSpan: 7 }]);
  });

  it('lays out a page of twenty-four without overlap', () => {
    const many = Array.from({ length: 24 }, (_, i) => ORIGINALS[i % ORIGINALS.length] as Size);
    assertFlush(layoutMosaic(many, 3), 3);
    assertFlush(layoutMosaic(many, 2), 2);
  });
});

describe('placementVars and mosaicSizes', () => {
  it('emits both breakpoints as custom properties', () => {
    const vars = placementVars({ col: 1, colSpan: 1, row: 1, rowSpan: 7 }, { col: 2, colSpan: 2, row: 8, rowSpan: 10 });
    expect(vars).toEqual({ '--m2-c': 1, '--m2-cs': 1, '--m2-r': 1, '--m2-rs': 7, '--m3-c': 2, '--m3-cs': 2, '--m3-r': 8, '--m3-rs': 10 });
  });
  it('asks for a wider image where the tile spans two columns', () => {
    expect(mosaicSizes(2, 2)).toBe('(min-width: 60rem) 50vw, (min-width: 30rem) 90vw, 90vw');
    expect(mosaicSizes(1, 1)).toBe('(min-width: 60rem) 25vw, (min-width: 30rem) 45vw, 90vw');
  });
});
