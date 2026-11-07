# Lesson 6: the image pipeline

**Claim on the resume:** "Image pipeline with sharp: 5,511 responsive WebP renditions, pixel sizes recorded so
scans reserve layout space, originals served untouched."

**Files:** `apps/letters/scripts/derive-images.ts`, `server/dimensions.ts`, `derivedName` in
`server/archive-index.ts`, the `Image` type in `server/schema.ts`, the `<img>` in `src/pages/LetterPage.tsx`,
`deploy/README.md`.

## The words

**Rendition.** A resized copy of an original. The originals here are 0.6 to 1.8 MB JPEG scans;
a phone showing a thumbnail should not download that. Each scan gets three WebP renditions at
320, 800 and 1600 pixels wide. 1,837 scans × 3 = 5,511 files.

**WebP.** A newer image format, roughly 30% smaller than JPEG at the same visual quality, supported
by every current browser.

**sharp.** The standard Node library for resizing and converting images. It wraps libvips, which is
why it handles 1,800 scans in minutes on a two-core VM.

**Responsive images: `srcset` and `sizes`.** One `<img>` can list several candidate files with
their pixel widths (`srcset="x-320.webp 320w, x-800.webp 800w, x-1600.webp 1600w"`) and tell the
browser how wide the image slot will be at each viewport (`sizes="(max-width: 600px) 100vw, 800px"`).
The browser, which knows the viewport and the device pixel ratio, picks the smallest file that is
sharp enough. The server never guesses the device.

**CLS, and `width`/`height` on `<img>`.** Cumulative Layout Shift is the Core Web Vital that measures
how much content jumps while a page loads. An image without known dimensions takes zero height
until it arrives, then pushes everything down. Putting the intrinsic `width` and `height` on the
tag lets the browser reserve the right box before the first byte of the image. To do that the
server has to know each scan's pixel size in advance, hence the manifest.

**Manifest.** A JSON file the pipeline writes mapping each page id to `{ width, height }`. Loaded at
startup into the GraphQL context so `Image.width` and `Image.height` are plain lookups.

**Idempotent.** A script you can run again safely. The pipeline checks whether each rendition
exists and skips it; only `--force` rebuilds. So a re-run after adding ten scans takes seconds, and
a restore from backup never triggers eleven minutes of work. Renditions are treated as assets, not
a cache.

**Bounded concurrency.** Doing N conversions at once, not all 5,511. A small worker pool sized to
the CPU count keeps the VM responsive.

## The interview answer

**"How do you handle images on the letters site?"**

> The originals are large scans that live on the server and are never modified; Caddy serves them
> under `/scans/` for anyone who wants the full file. For the reader I wrote a sharp-based script
> that derives three WebP widths per scan and records each original's pixel size into a manifest.
> The GraphQL `Image` type exposes `src`, `srcset`, `width` and `height` from that, and the page
> renders a standard `<img srcset sizes width height>` so the browser picks the right file and
> reserves the box before it loads, which is what keeps layout shift at zero. The first scan on a
> letter page gets `fetchPriority="high"` because it is the largest contentful paint; thumbnails
> are `loading="lazy"`. The script is idempotent and runs on the host that has the scans; the
> first run produced 5,511 files in about eleven minutes.

**"Why not an image CDN or `next/image`?"**

> Both would do the same work on demand. For a fixed archive of 1,800 images that never change,
> doing it once ahead of time is simpler, costs nothing per month, and keeps the originals on my
> own disk. The shop is different: product photos come from Shopify's CDN, which resizes by URL
> parameter, so the `Image` primitive in the UI package builds `srcset` from CDN URLs instead. Same
> `<img>` contract, different source.

**Likely follow-ups**

- *"What is CLS and how did you fix it?"* Above. The CSS fallback `aspect-ratio: auto 3 / 4`
  covers the case before the manifest exists.
- *"Why those three widths?"* 320 covers thumbnails and small phones, 800 the reading column,
  1600 a 2× display of that column. More steps give diminishing returns for more files.
- *"What would change at 100,000 images?"* A queue and workers instead of one script, and
  on-demand derivation with a cache, because a full pass would take hours.

## How it was built here

1. `deriveImages` walks the index from lesson 1 and, for every image page, writes
   `<out>/img/<derivedName>-{320,800,1600}.webp`, never upscaling (`withoutEnlargement`), WebP
   quality 78. `.rotate()` with no argument applies EXIF orientation so the stored size is what the
   viewer sees.
2. `img/manifest.json` maps page id → `{ width, height }`; `server/dimensions.ts` loads it.
3. **Derived names two decoders agree on.** Page ids contain `/`, `#` and spaces. Caddy serves
   `/img/` from disk in production and Hono does locally, and they decode paths differently.
   `derivedName` folds every character outside `[A-Za-z0-9._-]` to `-`, so the file name needs no
   encoding at all.
4. The existence check replaced an earlier timestamp comparison, which would have rebuilt
   everything after a restore from backup changed mtimes.
5. A small `pool` runs `availableParallelism() - 1` workers; on the two-core VM the runbook passes
   `--concurrency 2`.

What happened in practice: first run on VM 104 (2026-11-07), 1,837 scans, 5,511 renditions,
412 MB, 11 minutes. On Windows the test failed with `EBUSY` deleting the temp folder: libvips keeps
files memory-mapped while cached; fix was `sharp.cache(false)` in the test and a retrying `rm`.
The landing page photos went through the same pipeline later (`--photos`).

## Try it

```sh
cd apps/letters
pnpm vitest run scripts/derive-images.test.ts
node scripts/derive-images.ts --dry-run --scans <a folder with a few scans> --out /tmp/letters-data
```

In GraphiQL: `{ letter(key: "440") { pages { image { src srcset width height } } } }`. `width` is
`null` on a workstation because there is no manifest; look at `loadDimensions` to see why that is
not an error. In the browser, open a letter page, right-click the scan, "Open image in new tab",
and read the filename: that is the browser's `srcset` choice. Resize the window and reload.

## Exercise

`pnpm learn 06`. Predict derived names, the srcset the API produces, and what a dry run reports.

## Say it out loud, without notes

- What is a rendition, and why three widths?
- What do `srcset` and `sizes` do, and who decides which file loads?
- What is CLS, and how do `width`/`height` on `<img>` fix it?
- What does idempotent mean, and why does it matter for this script?
- Why keep the originals where they are and let Caddy serve them?
