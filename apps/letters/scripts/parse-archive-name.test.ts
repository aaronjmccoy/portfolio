import { describe, expect, it } from 'vitest';
import { pageOrder, parseArchiveName } from './parse-archive-name';

// Real names from /srv/www/germanwarletters.com/public/german-war-letters
describe('parseArchiveName', () => {
  it('parses a plain chapter / letter / scanner page', () => {
    const e = parseArchiveName('Chapter 10          The Home front%2FLetter # 440%2Fpfr100313.jpg');
    expect(e).toMatchObject({
      section: 'Chapter 10 The Home front',
      chapter: 10,
      sectionTitle: 'The Home front',
      group: undefined,
      letter: 440,
      variant: undefined,
      page: 'pfr100313',
      ext: 'jpg',
    });
  });

  it('parses a lettered page', () => {
    const e = parseArchiveName('Chapter 10          The Home front%2FLetter # 442%2FA.jpg');
    expect(e?.letter).toBe(442);
    expect(e?.page).toBe('A');
  });

  it('parses a sub-letter variant folder (441a, 441b)', () => {
    const a = parseArchiveName('Chapter 10          The Home front%2FLetter # 441%2Fa%2FA.jpg');
    const b = parseArchiveName('Chapter 10          The Home front%2FLetter # 441%2Fb%2FA.jpg');
    expect(a).toMatchObject({ letter: 441, variant: 'a', page: 'A' });
    expect(b).toMatchObject({ letter: 441, variant: 'b', page: 'A' });
  });

  it('parses a group name glued to the letter folder with odd spacing', () => {
    const e = parseArchiveName(
      'Chapter 6         The Jagel Family%2FStalingrad     Letter  # 400%2Fpfr100176.jpg',
    );
    expect(e).toMatchObject({
      chapter: 6,
      sectionTitle: 'The Jagel Family',
      group: 'Stalingrad',
      letter: 400,
      page: 'pfr100176',
    });
  });

  it('handles the Introduction (no chapter number) and png scans', () => {
    const e = parseArchiveName('Chapter 2          The Heller Family%2FLetter # 15%2FA.png');
    expect(e).toMatchObject({ chapter: 2, letter: 15, ext: 'png' });
    const intro = parseArchiveName('Introduction%2Fmap.jpg');
    expect(intro).toMatchObject({ section: 'Introduction', chapter: undefined, letter: undefined, page: 'map' });
  });

  it('keeps non-image companions so they can be listed, not rendered', () => {
    const e = parseArchiveName('Chapter 11 Into the Abyss%2FLetter # 445%2FLetter # 445.docx');
    expect(e).toMatchObject({ chapter: 11, letter: 445, ext: 'docx', page: 'Letter # 445' });
  });

  it('rejects names with no extension', () => {
    expect(parseArchiveName('junk')).toBeUndefined();
  });

  it('ignores a trailing CR from a CRLF listing', () => {
    const e = parseArchiveName('Chapter 10          The Home front%2FLetter # 440%2Fpfr100313.jpg\r');
    expect(e?.ext).toBe('jpg');
    expect(e?.file).toBe('Chapter 10          The Home front%2FLetter # 440%2Fpfr100313.jpg');
  });
});

describe('pageOrder', () => {
  it('sorts lettered pages before scanner-numbered ones, each in order', () => {
    const order = ['pfr100314', 'B', 'pfr100313', 'A', 'C'].sort((x, y) => pageOrder(x) - pageOrder(y));
    expect(order).toEqual(['A', 'B', 'C', 'pfr100313', 'pfr100314']);
  });
});
