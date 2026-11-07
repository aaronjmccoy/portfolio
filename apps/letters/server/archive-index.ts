/**
 * The in-memory domain model behind the GraphQL API, built once from the
 * archive's file listing. Everything the UI needs to navigate — sections,
 * letters, pages — comes from filenames; transcriptions are layered on from
 * Markdown files keyed by letter number.
 */
import { parseArchiveName } from '../scripts/parse-archive-name.ts';
import type { ArchiveEntry } from '../scripts/parse-archive-name.ts';

export type Page = {
  id: string; // `${letterKey}/${page}`
  letterKey: string;
  page: string;
  ext: string;
  file: string;
  order: number;
};

export type Letter = {
  key: string; // "440" or "441a"
  number: number;
  variant: string | undefined;
  group: string | undefined;
  sectionKey: string;
  pages: Page[];
  companions: Page[]; // non-image files (docx, onetoc2)
  transcription: Transcription | undefined;
};

export type Section = {
  key: string; // "intro" or "ch10"
  chapter: number | undefined;
  title: string; // "The Home front" or "Introduction"
  order: number;
  letters: Letter[];
  loose: Page[]; // section-level images with no letter (maps, photos)
};

export type Transcription = {
  letterKey: string;
  markdown: string;
  /** "book" when sourced from the author's text, "ocr" when machine-read */
  source: 'book' | 'ocr';
};

export type ArchiveIndex = {
  sections: Section[];
  sectionByKey: Map<string, Section>;
  letterByKey: Map<string, Letter>;
  letters: Letter[]; // in reading order: section order, then number, then variant
};

/** Scan formats sharp can read and the UI shows as pages; anything else is a companion file. */
export const IMAGE_EXT: ReadonlySet<string> = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'tif', 'tiff']);

/** Derived rendition widths, in CSS pixels, for `srcset`. */
export const WIDTHS = [320, 800, 1600] as const;

/**
 * Basename of a page's derived renditions: `<name>-<width>.webp`. Built from
 * the page id with every unsafe character folded to "-", so the files need no
 * URL encoding and survive Caddy's and Hono's differing path decoding.
 */
export function derivedName(page: Pick<Page, 'id'>): string {
  return page.id.replace(/[^A-Za-z0-9._-]+/g, '-');
}

export function sectionKeyFor(e: Pick<ArchiveEntry, 'chapter' | 'section'>): string {
  return e.chapter === undefined ? e.section.toLowerCase().replace(/\s+/g, '-') : `ch${e.chapter}`;
}

export function letterKeyFor(e: Pick<ArchiveEntry, 'letter' | 'variant'>): string | undefined {
  if (e.letter === undefined) return undefined;
  return `${e.letter}${e.variant ?? ''}`;
}

export function buildArchiveIndex(
  files: Iterable<string>,
  transcriptions: ReadonlyMap<string, Transcription> = new Map(),
): ArchiveIndex {
  const sectionByKey = new Map<string, Section>();
  const letterByKey = new Map<string, Letter>();

  for (const file of files) {
    const e = parseArchiveName(file);
    if (!e) continue;
    const sKey = sectionKeyFor(e);
    let section = sectionByKey.get(sKey);
    if (!section) {
      section = {
        key: sKey,
        chapter: e.chapter,
        title: e.chapter === undefined ? e.section : e.sectionTitle,
        order: e.chapter ?? 0,
        letters: [],
        loose: [],
      };
      sectionByKey.set(sKey, section);
    }
    const lKey = letterKeyFor(e);
    const page: Page = {
      id: `${lKey ?? sKey}/${e.page}`,
      letterKey: lKey ?? '',
      page: e.page,
      ext: e.ext,
      file,
      order: e.pageOrder,
    };
    if (lKey === undefined) {
      if (IMAGE_EXT.has(e.ext)) section.loose.push(page);
      continue;
    }
    let letter = letterByKey.get(lKey);
    if (!letter) {
      letter = {
        key: lKey,
        number: e.letter!,
        variant: e.variant,
        group: e.group,
        sectionKey: sKey,
        pages: [],
        companions: [],
        transcription: transcriptions.get(lKey),
      };
      letterByKey.set(lKey, letter);
      section.letters.push(letter);
    }
    (IMAGE_EXT.has(e.ext) ? letter.pages : letter.companions).push(page);
  }

  const byVariant = (a: Letter, b: Letter) =>
    a.number - b.number || (a.variant ?? '').localeCompare(b.variant ?? '');
  for (const s of sectionByKey.values()) {
    s.letters.sort(byVariant);
    s.loose.sort((a, b) => a.order - b.order);
    for (const l of s.letters) {
      l.pages.sort((a, b) => a.order - b.order);
      l.companions.sort((a, b) => a.order - b.order);
    }
  }
  const sections = [...sectionByKey.values()].sort((a, b) => a.order - b.order);
  const letters = sections.flatMap((s) => s.letters);
  return { sections, sectionByKey, letterByKey, letters };
}
