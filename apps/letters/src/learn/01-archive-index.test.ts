// @vitest-environment node
/**
 * Lesson 1 exercises: from filenames to a domain model.
 * Read docs/learn/01-archive-index.md first. Run: pnpm learn 01
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { parseArchiveName } from '../../scripts/parse-archive-name.ts';
import type { ArchiveIndex } from '../../server/archive-index.ts';
import { loadContext } from './helpers.ts';

/* Exercise 1a: read scripts/parse-archive-name.ts, then predict what it returns
 * for this filename. Fill in every value below. */
const NAME = 'Chapter 6         The Jagel Family%2FStalingrad     Letter  # 400%2FA.jpg';
const PREDICTION = {
  chapter: 0,
  sectionTitle: '',
  group: '',
  letter: 0,
  variant: undefined as string | undefined,
  page: '',
  ext: '',
  pageOrder: 0,
};

/* Exercise 1b: count the scanned (image) pages of one chapter using only the
 * index. Look at the Section and Letter types in server/archive-index.ts. */
function imagePagesIn(index: ArchiveIndex, chapter: number): number {
  throw new Error(`exercise 1b: count the pages of chapter ${chapter} across ${index.sections.length} sections`);
}

describe('lesson 1: the archive index', () => {
  let index: ArchiveIndex;
  beforeAll(async () => {
    index = (await loadContext()).index;
  });

  it('1a: the parser turns one flattened filename into section, letter and page', () => {
    expect(parseArchiveName(NAME)).toMatchObject(PREDICTION);
  });

  it('1b: chapter 3 shows 754 scanned pages across 246 letters', () => {
    // 1,013 files are images in chapter 3; the ones a transcription replaces
    // (the author's typed translations) are moved to `transcriptionScans` and
    // are not pages the reader shows. Count what the reader shows.
    expect(index.sectionByKey.get('ch3')?.letters).toHaveLength(246);
    expect(imagePagesIn(index, 3)).toBe(754);
  });

  it('1c: letters are in reading order across the whole book', () => {
    // Nothing to write: this passes. Say out loud what `index.letters` is
    // sorted by, and why `previous`/`next` on the GraphQL Letter type can be
    // answered from this one array.
    const i = index.letters.findIndex((l) => l.key === '440');
    expect(index.letters[i - 1]?.key).toBe('439');
    expect(index.letters[i + 1]?.key).toBe('441');
    expect(index.letters.map((l) => l.key).slice(i + 1, i + 4)).toEqual(['441', '441a', '441b']);
  });
});
