// @vitest-environment node
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadTranscriptions, parseTranscription } from './transcriptions.ts';

describe('parseTranscription', () => {
  it('defaults to the book as source and trims the body', () => {
    expect(parseTranscription('440', '\nLiebe Eltern,\n\nes geht mir gut.\n')).toEqual({
      letterKey: '440',
      source: 'book',
      markdown: 'Liebe Eltern,\n\nes geht mir gut.',
      replaces: [],
    });
  });

  it('reads the source from front matter and normalises CRLF', () => {
    const t = parseTranscription('441a', '---\r\nsource: ocr\r\n---\r\nText\r\n');
    expect(t.source).toBe('ocr');
    expect(t.markdown).toBe('Text');
  });

  it('reads the pages a translation replaces', () => {
    const t = parseTranscription('442', '---\nsource: translation\nreplaces: pfr100518, E\n---\nDear Egon !.');
    expect(t).toEqual({ letterKey: '442', source: 'translation', replaces: ['pfr100518', 'E'], markdown: 'Dear Egon !.' });
  });

  it('rejects unknown sources', () => {
    expect(() => parseTranscription('1', '---\nsource: guess\n---\nx')).toThrow(/source must be/);
  });
});

describe('loadTranscriptions', () => {
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'letters-transcriptions-'));
    await writeFile(join(dir, '440.md'), 'Letter 440 text');
    await writeFile(join(dir, '441A.md'), '---\nsource: ocr\n---\nLetter 441a text');
    await writeFile(join(dir, 'README.md'), 'not a letter');
    await writeFile(join(dir, 'notes.txt'), 'nor this');
  });
  afterAll(() => rm(dir, { recursive: true, force: true }));

  it('loads letter files only, keyed by lower-case letter key', async () => {
    const map = await loadTranscriptions(dir);
    expect([...map.keys()]).toEqual(['440', '441a']);
    expect(map.get('441a')?.source).toBe('ocr');
  });

  it('returns an empty map when the folder does not exist', async () => {
    expect((await loadTranscriptions(join(dir, 'missing'))).size).toBe(0);
  });
});
