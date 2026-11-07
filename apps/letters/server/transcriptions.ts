/**
 * Transcriptions are Markdown files in transcriptions/, one per letter, named
 * by letter key: `440.md`, `441a.md`. The text comes from the author's books,
 * chapter by chapter; machine-read text is marked so the UI can say so:
 *
 *   ---
 *   source: ocr
 *   ---
 *   Liebe Eltern, ...
 *
 * Without front matter a file is from the book. The author's typed English
 * translations, which were scanned with the letters, are `source: translation`
 * and name the scanned pages the text stands in for, so the reader drops them:
 *
 *   ---
 *   source: translation
 *   replaces: pfr100518
 *   ---
 *
 * Anything else in the folder (README, drafts) is ignored.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Transcription } from './archive-index.ts';

const LETTER_FILE = /^(\d+[a-z]?)\.md$/i;
const SOURCES = new Set(['book', 'ocr', 'translation']);

export function parseTranscription(letterKey: string, raw: string): Transcription {
  const text = raw.replace(/\r\n/g, '\n');
  let source: Transcription['source'] = 'book';
  let replaces: string[] = [];
  let body = text;
  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---', 4);
    if (end < 0) throw new Error(`transcription ${letterKey}: unterminated front matter`);
    for (const line of text.slice(4, end).split('\n')) {
      const m = /^(\w+)\s*:\s*(.*)$/.exec(line.trim());
      if (!m) continue;
      if (m[1] === 'source') {
        if (!SOURCES.has(m[2] ?? '')) throw new Error(`transcription ${letterKey}: source must be "book", "ocr" or "translation", got "${m[2]}"`);
        source = m[2] as Transcription['source'];
      } else if (m[1] === 'replaces') {
        replaces = (m[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    body = text.slice(end + 4);
  }
  return { letterKey, markdown: body.trim(), source, replaces };
}

export async function loadTranscriptions(dir: string): Promise<Map<string, Transcription>> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return new Map();
    throw err;
  }
  const out = new Map<string, Transcription>();
  for (const name of names.sort()) {
    const m = LETTER_FILE.exec(name);
    if (!m) continue;
    const key = m[1]!.toLowerCase();
    out.set(key, parseTranscription(key, await readFile(join(dir, name), 'utf8')));
  }
  return out;
}
