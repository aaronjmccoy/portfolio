/**
 * The scan archive is one flat directory whose original folder structure was
 * flattened into filenames with a literal "%2F" where each "/" used to be:
 *
 *   Chapter 10          The Home front%2FLetter # 440%2Fpfr100313.jpg
 *   Chapter 6         The Jagel Family%2FStalingrad     Letter  # 400%2FA.jpg
 *   Chapter 10          The Home front%2FLetter # 441%2Fa%2FA.jpg
 *   Chapter 2          The Heller Family%2FLetter # 15%2FA.png
 *   Introduction%2F...
 *
 * Runs of spaces are padding from the original folder names and carry no
 * meaning. Pages are either lettered (A, B, C…) or scanner-named
 * (pfr100313); lettered pages sort first, then scanner names by number.
 */

export type ArchiveEntry = {
  /** "Introduction" or "Chapter 10 The Home front" with whitespace collapsed */
  section: string;
  /** 10 for "Chapter 10 …"; undefined for the Introduction */
  chapter: number | undefined;
  /** Section title without the "Chapter N" prefix, e.g. "The Home front" */
  sectionTitle: string;
  /** A sub-grouping folder between the section and the letter, e.g. "Stalingrad" */
  group: string | undefined;
  /** 440 for "Letter # 440"; undefined for section-level files */
  letter: number | undefined;
  /** "a" / "b" when a letter number was split into lettered sub-folders */
  variant: string | undefined;
  /** Original page file name without extension, e.g. "A" or "pfr100313" */
  page: string;
  ext: string;
  /** Sort key within a letter: lettered pages first, then scanner numbers */
  pageOrder: number;
  /** The exact filename, for building URLs to the original */
  file: string;
};

const SEP = '%2F';
const LETTER_RE = /^Letter\s*#\s*(\d+)$/i;
const CHAPTER_RE = /^Chapter\s+(\d+)\s*(.*)$/i;

function collapse(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export function pageOrder(page: string): number {
  if (/^[A-Z]$/i.test(page)) return page.toUpperCase().charCodeAt(0) - 64; // A=1 … Z=26
  const m = /(\d+)$/.exec(page);
  return m ? 1000 + Number(m[1]) : 100000;
}

export function parseArchiveName(rawFile: string): ArchiveEntry | undefined {
  // Listings can arrive with CRLF endings or padding; a filename never
  // legitimately ends in whitespace.
  const file = rawFile.replace(/[\r\n]+$/, '').trimEnd();
  const dot = file.lastIndexOf('.');
  if (dot <= 0) return undefined;
  const ext = file.slice(dot + 1).toLowerCase();
  const parts = file.slice(0, dot).split(SEP).map(collapse);
  const page = parts.pop();
  const section = parts.shift();
  if (!page || !section) return undefined;

  let chapter: number | undefined;
  let sectionTitle = section;
  const ch = CHAPTER_RE.exec(section);
  if (ch) {
    chapter = Number(ch[1]);
    sectionTitle = collapse(ch[2] ?? '');
  }

  let group: string | undefined;
  let letter: number | undefined;
  let variant: string | undefined;

  for (const part of parts) {
    const asLetter = LETTER_RE.exec(part);
    if (asLetter) {
      letter = Number(asLetter[1]);
      continue;
    }
    // "Stalingrad Letter # 400": a group name glued to the letter folder
    const glued = /^(.*?)\s+Letter\s*#\s*(\d+)$/i.exec(part);
    if (glued) {
      group = collapse(glued[1] ?? '') || undefined;
      letter = Number(glued[2]);
      continue;
    }
    if (letter !== undefined && /^[a-z]$/i.test(part)) {
      variant = part.toLowerCase();
      continue;
    }
    if (letter === undefined) group = part;
  }

  return {
    section,
    chapter,
    sectionTitle,
    group,
    letter,
    variant,
    page,
    ext,
    pageOrder: pageOrder(page),
    file,
  };
}
