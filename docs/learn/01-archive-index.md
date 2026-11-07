# Lesson 1: the archive index

**Claim:** "over an archive of 1,836 scanned letters" and "456 letters in reading order".

**Files:** `apps/letters/scripts/parse-archive-name.ts`, `apps/letters/server/archive-index.ts`,
`apps/letters/data/listing.txt`, and their tests beside them.

## What the problem was

The archive on VM 104 is one flat directory of 1,839 files. The original folder tree
(chapter → letter → page) was flattened into the filenames with a literal `%2F` where each `/`
used to be, and the folder names carry runs of padding spaces:

```
Chapter 10          The Home front%2FLetter # 440%2Fpfr100313.jpg
Chapter 6         The Jagel Family%2FStalingrad     Letter  # 400%2FA.jpg
Chapter 10          The Home front%2FLetter # 441%2Fa%2FA.jpg
Introduction%2Fsomething.jpg
```

There is no database and no metadata file. Everything the site knows (which chapter a letter is
in, how many pages it has, what order they go in) has to come from those names. The first
decision was therefore: **the filenames are the data source, parsed once at startup into an
in-memory model.** No SQLite, no import step, nothing to keep in sync with the folder.

## How it was built

1. **Start from the real data.** `data/listing.txt` is the actual `ls` of the archive, committed to
   the repo. The parser's tests run against the real names, so every odd case the author's
   folders contain (glued group names like `Stalingrad     Letter  # 400`, split letters like
   `441/a`, scanner-named pages like `pfr100313` beside lettered pages `A`, `B`) was found by a
   failing test, not by a user.
2. **Parse one name into one record.** `parseArchiveName` (read it now) splits on `%2F`, collapses
   whitespace, pulls `Chapter N` off the front and the page name off the end, then walks the parts in
   between to find the letter number, an optional variant letter and an optional group folder.
   `pageOrder` sorts lettered pages first (A=1), then scanner ids by their number.
3. **Fold records into a model.** `buildArchiveIndex` groups entries into `Section → Letter → Page`,
   keeps non-image companions (a `.docx` beside the scans) apart from pages, sorts everything, and
   builds two lookup maps plus one flat `letters` array in reading order. That array is what makes
   `previous`/`next` in the API a one-line resolver.
4. **Transcriptions are layered on, and can replace scans.** `buildArchiveIndex` takes the
   transcriptions map (lesson 7 covers the files). The author scanned his own typed English
   translations beside the letters; those were machine-read into `transcriptions/<key>.md` with
   `source: translation` and a `replaces:` list, and the index moves the named scans out of `pages`
   into `transcriptionScans`. So `pageCount` means pages the reader shows, which is why the numbers
   in the exercises are smaller than the file counts.
5. **The server reads the listing when the archive is absent.** `server/index.ts` → `listArchive()`:
   on VM 104 it does `readdir` on the mounted archive; on a workstation or in CI it reads
   `data/listing.txt`. So the whole app, including SSR and the e2e suite, runs without the 6.8 GB
   of scans.

## Trace it

Follow the name `Chapter 10          The Home front%2FLetter # 441%2Fa%2FA.jpg`:

- `parts` after the split and collapse: `["Chapter 10 The Home front", "Letter # 441", "a"]`, page `A`, ext `jpg`.
- `CHAPTER_RE` gives chapter 10, title `The Home front`.
- `Letter # 441` matches `LETTER_RE` → letter 441. Then `a` with a letter already set → variant `a`.
- `sectionKeyFor` → `ch10`; `letterKeyFor` → `441a`; the page id is `441a/A`.

Now find where `441a` ends up in `index.letters` relative to `441` and `442` (the sort in
`buildArchiveIndex`, `byVariant`).

## Try it

```sh
cd apps/letters
pnpm vitest run scripts/parse-archive-name.test.ts server/archive-index.test.ts
node -e "import('./server/archive-index.ts').then(async ({buildArchiveIndex}) => { const l = (await import('node:fs/promises')).readFile('data/listing.txt','utf8'); const i = buildArchiveIndex((await l).split(/\r?\n/).filter(Boolean)); console.log(i.sections.map(s => [s.key, s.letters.length])) })"
```

## Exercise

`pnpm learn 01` → `src/learn/01-archive-index.test.ts`. Fill in the prediction (1a) and write
`imagePagesIn` (1b). 1c already passes; explain it.

## Say it out loud

- Why parse filenames at startup instead of importing them into a database? What would change the answer?
- What does "reading order" mean here, and which single data structure carries it?
- A new scan is added to the archive. What has to happen for it to appear on the site? (Lesson 6 finishes this answer.)
