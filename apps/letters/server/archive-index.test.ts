import { describe, expect, it } from 'vitest';
import { buildArchiveIndex } from './archive-index.ts';

const files = [
  'Chapter 10          The Home front%2FLetter # 440%2Fpfr100314.jpg',
  'Chapter 10          The Home front%2FLetter # 440%2Fpfr100313.jpg',
  'Chapter 10          The Home front%2FLetter # 441%2Fb%2FA.jpg',
  'Chapter 10          The Home front%2FLetter # 441%2Fa%2FA.jpg',
  'Chapter 10          The Home front%2FLetter # 442%2FB.jpg',
  'Chapter 10          The Home front%2FLetter # 442%2FA.jpg',
  'Chapter 6         The Jagel Family%2FStalingrad     Letter  # 400%2FA.jpg',
  'Chapter 11 Into the Abyss%2FLetter # 445%2FLetter # 445.docx',
  'Chapter 11 Into the Abyss%2FLetter # 445%2FA.jpg',
  'Introduction%2Fmap.jpg',
  'Chapter 2          The Heller Family%2FLetter # 15%2FA.png',
];

describe('buildArchiveIndex', () => {
  const idx = buildArchiveIndex(files);

  it('orders sections by chapter with the Introduction first', () => {
    expect(idx.sections.map((s) => s.key)).toEqual(['introduction', 'ch2', 'ch6', 'ch10', 'ch11']);
    expect(idx.sections[3]?.title).toBe('The Home front');
  });

  it('orders letters by number then variant, and pages by their order key', () => {
    const ch10 = idx.sectionByKey.get('ch10')!;
    expect(ch10.letters.map((l) => l.key)).toEqual(['440', '441a', '441b', '442']);
    expect(idx.letterByKey.get('440')!.pages.map((p) => p.page)).toEqual(['pfr100313', 'pfr100314']);
    expect(idx.letterByKey.get('442')!.pages.map((p) => p.page)).toEqual(['A', 'B']);
  });

  it('keeps group names, companions and loose section images', () => {
    expect(idx.letterByKey.get('400')!.group).toBe('Stalingrad');
    const l445 = idx.letterByKey.get('445')!;
    expect(l445.pages).toHaveLength(1);
    expect(l445.companions.map((c) => c.ext)).toEqual(['docx']);
    expect(idx.sectionByKey.get('introduction')!.loose.map((p) => p.page)).toEqual(['map']);
  });

  it('attaches transcriptions by letter key and lists letters in reading order', () => {
    const withText = buildArchiveIndex(
      files,
      new Map([['440', { letterKey: '440', markdown: '# Hello', source: 'book', replaces: [] }]]),
    );
    expect(withText.letterByKey.get('440')!.transcription?.source).toBe('book');
    expect(withText.letters.map((l) => l.key)).toEqual(['15', '400', '440', '441a', '441b', '442', '445']);
  });

  it('drops the scanned pages a transcription replaces', () => {
    const withText = buildArchiveIndex(
      files,
      new Map([['442', { letterKey: '442', markdown: 'Dear Egon', source: 'translation', replaces: ['b'] }]]),
    );
    expect(withText.letterByKey.get('442')!.pages.map((p) => p.page)).toEqual(['A']);
  });
});
