# Lesson 1: the archive index

**Claim on the resume:** "over an archive of 1,836 scanned letters" and "456 letters in reading order".

**Files:** `apps/letters/scripts/parse-archive-name.ts`, `apps/letters/server/archive-index.ts`,
`apps/letters/data/listing.txt`, and their tests beside them.

## The words

**Data source.** Where the facts a site shows come from. Usually a database or a CMS. Here it is
the *filenames* of the scans, because that is all the author left.

**Parser.** A function that turns a string into structured data. `parseArchiveName` turns one
filename into `{ chapter, letter, variant, page, ext }`.

**Index.** A structure built once so lookups are cheap afterwards: maps from key to object, and
arrays in a fixed order. Like a book's index, built once, consulted many times.

**In-memory model.** The whole index lives in the Node process's memory, built when the server
starts. No database, no file to keep in sync. The trade-off: it is rebuilt on every start, which
is fine for 1,839 names and would not be for 10 million rows.

**Reading order.** The one flat array `index.letters` sorted chapter, letter, variant. "Previous"
and "next" are neighbours in that array. That is what the resume means by "456 letters in reading
order".

**Startup vs request time.** Work done once when the process boots (building the index) versus
work done per HTTP request (a map lookup). Moving work to startup is the oldest performance trick.

## The interview answer

**"Where did the data for the letters site come from?"**

> There was no database and no metadata. The author had scanned about 1,800 pages into a folder
> tree, chapter, letter, page, and at some point that tree got flattened into one directory with
> the slashes encoded into the filenames. So the filenames *were* the data. I wrote a parser that
> turns each name into a record, with tests against the real listing, because the folder names had
> every inconsistency you would expect from a person naming things by hand over years: padding
> spaces, letters split into "441" and "441/a", scanner-generated page names next to hand-lettered
> ones. Then an index step groups the records into sections, letters and pages, sorts them, and
> builds lookup maps plus one flat array in reading order. That runs once at startup; after that
> every API call is a map lookup. Later, when I added transcriptions, the same index step learned
> to swap a scanned translation out for its text version, so the page count is "pages the reader
> shows", not "files on disk".

**"Why not import it into a database?"**

> Because nothing would be gained. The data is small, changes only when a scan is added, and has no
> writes. A database would add an import step that can drift from the folder, a schema to migrate,
> and a service to run. Parsing at startup takes well under a second and the folder stays the
> single source of truth. If the archive grew to hundreds of thousands of items, or if users could
> annotate letters, I would move it to SQLite and the resolvers would become async; the client
> would not notice because the GraphQL schema is the contract, not the storage.

**Likely follow-up: "How did you make sure the parser was right?"**

> I committed the real `ls` output of the archive, 1,839 names, and the tests run the parser over
> all of it. Every odd case was found by a failing test, not by a user. The server also falls back
> to that listing when the real folder is absent, so the whole app, including server rendering and
> the browser tests, runs on a laptop or in CI without 6.8 GB of scans.

## How it was built here

The names look like this; `%2F` is where each `/` used to be:

```
Chapter 10          The Home front%2FLetter # 440%2Fpfr100313.jpg
Chapter 6         The Jagel Family%2FStalingrad     Letter  # 400%2FA.jpg
Chapter 10          The Home front%2FLetter # 441%2Fa%2FA.jpg
Introduction%2Fsomething.jpg
```

1. **Parse one name into one record.** `parseArchiveName` splits on `%2F`, collapses whitespace,
   pulls `Chapter N` off the front and the page name off the end, then walks the parts between to
   find the letter number, an optional variant letter and an optional group folder. `pageOrder`
   sorts lettered pages first (A=1), then scanner ids by their number.
2. **Fold records into a model.** `buildArchiveIndex` groups entries into `Section → Letter → Page`,
   keeps non-image companions (a `.docx` beside the scans) apart from pages, sorts everything, and
   builds two lookup maps plus the flat `letters` array.
3. **Transcriptions are layered on, and can replace scans.** `buildArchiveIndex` takes the
   transcriptions map. The author scanned his own typed English translations beside the letters;
   those were machine-read into `transcriptions/<key>.md` with `source: translation` and a
   `replaces:` list, and the index moves the named scans out of `pages` into `transcriptionScans`.
4. **The server reads the listing when the archive is absent.** `server/index.ts` → `listArchive()`:
   on VM 104 it does `readdir` on the mounted archive; elsewhere it reads `data/listing.txt`.

## Trace it

Follow `Chapter 10          The Home front%2FLetter # 441%2Fa%2FA.jpg`:

- `parts` after split and collapse: `["Chapter 10 The Home front", "Letter # 441", "a"]`, page `A`, ext `jpg`.
- `CHAPTER_RE` gives chapter 10, title `The Home front`.
- `Letter # 441` matches `LETTER_RE` → letter 441. Then `a` with a letter already set → variant `a`.
- `sectionKeyFor` → `ch10`; `letterKeyFor` → `441a`; the page id is `441a/A`.

Now find where `441a` lands in `index.letters` relative to `441` and `442` (`byVariant` in
`buildArchiveIndex`).

## Try it

```sh
cd apps/letters
pnpm vitest run scripts/parse-archive-name.test.ts server/archive-index.test.ts
node -e "import('./server/archive-index.ts').then(async ({buildArchiveIndex}) => { const l = (await import('node:fs/promises')).readFile('data/listing.txt','utf8'); const i = buildArchiveIndex((await l).split(/\r?\n/).filter(Boolean)); console.log(i.sections.map(s => [s.key, s.letters.length])) })"
```

## Exercise

`pnpm learn 01` → `src/learn/01-archive-index.test.ts`. Fill in the prediction (1a) and write
`imagePagesIn` (1b). 1c already passes; explain it.

## Say it out loud, without notes

- What is the data source for this site, and why?
- What does "in-memory index built at startup" mean, and what is its cost?
- What does "reading order" mean here, and which single data structure carries it?
- A new scan is added to the archive. What has to happen for it to appear? (Lesson 6 finishes this.)
