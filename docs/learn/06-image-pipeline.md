# Lesson 6: the image pipeline

**Claim:** "Image pipeline with sharp: 5,511 responsive WebP renditions, pixel sizes recorded so scans
reserve layout space, originals served untouched."

**Files:** `apps/letters/scripts/derive-images.ts`, `server/dimensions.ts`, `derivedName` in
`server/archive-index.ts`, the `Image` type in `server/schema.ts`, the `<img>` in `src/pages/LetterPage.tsx`,
`deploy/README.md`.

## The constraints

- Originals are 0.6 to 1.8 MB JPEGs. Serving them as thumbnails is unacceptable on mobile.
- The originals must never be modified or copied into the repo or the Docker image (6.8 GB, and they
  are the archive).
- The site should know each scan's pixel size before the image loads, so the page does not jump.

## The design

1. **One script, run on the host that has the scans.** `deriveImages` walks the index from lesson 1,
   and for every image page writes `<out>/img/<derivedName>-{320,800,1600}.webp`, never upscaling
   (`withoutEnlargement`), WebP quality 78. `.rotate()` with no argument applies EXIF orientation so
   the stored size is what the viewer sees.
2. **A manifest of original sizes.** `img/manifest.json` maps page id → `{ width, height }`.
   `server/dimensions.ts` loads it at startup into `context.dimensions`; the `Image.width/height`
   resolvers read it, and `LetterPage` puts them on `<img width height>` so the browser reserves the
   box. A CSS `aspect-ratio: auto 3 / 4` is the fallback before the manifest exists.
3. **Derived names that two decoders agree on.** Page ids contain `/`, `#` and spaces. Caddy serves
   `/img/` from disk in production and Hono does locally, and they decode paths differently.
   `derivedName` folds every character outside `[A-Za-z0-9._-]` to `-`, so the file name needs no
   encoding at all.
4. **Renditions are assets, not a cache.** A rendition that exists is never rebuilt, whatever the
   timestamps say; only `--force` rebuilds. That makes a re-run after new scans take seconds and
   means a restore from backup never triggers eleven minutes of work.
5. **Bounded concurrency.** A small `pool` runs `availableParallelism() - 1` workers; on the two-core
   VM the runbook passes `--concurrency 2`.

## What happened in practice

- The first real run on VM 104 (2026-11-07): 1,837 scans, 5,511 renditions, 412 MB, 11 minutes.
- The test suite creates real PNGs with sharp and runs the pipeline on them. On Windows it failed
  with `EBUSY` deleting the temp folder: libvips keeps files memory-mapped while cached. Fix:
  `sharp.cache(false)` in the test and a retrying `rm`.
- The landing page's photos went through the same pipeline later (`--photos`), which is why the
  script has two entry points.

## Try it

```sh
cd apps/letters
pnpm vitest run scripts/derive-images.test.ts
node scripts/derive-images.ts --dry-run --scans <a folder with a few scans> --out /tmp/letters-data
```

In GraphiQL: `{ letter(key: "440") { pages { image { src srcset width height } } } }`. `width` is
`null` on a workstation because there is no manifest; look at `loadDimensions` to see why that is
not an error.

## Exercise

`pnpm learn 06`. Predict derived names, the srcset the API produces, and what a dry run reports.

## Say it out loud

- Why three widths and those three? What does `sizes` on the `<img>` do with them?
- What is CLS and how do `width`/`height` on `<img>` fix it?
- Why keep the originals where they are and let Caddy serve them under `/scans/`?
- What would you do differently with 100,000 images? (Hint: a queue, not a script.)
