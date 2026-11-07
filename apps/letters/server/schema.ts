/**
 * GraphQL schema for the letters archive, built with Pothos.
 *
 * Relay-spec by design: every addressable thing is a Node with a global ID,
 * lists are connections, and the client is react-relay. The schema is
 * printed to schema/schema.graphql (pnpm schema:print) for relay-compiler.
 */
import SchemaBuilder from '@pothos/core';
import RelayPlugin, { resolveArrayConnection } from '@pothos/plugin-relay';
import { IMAGE_EXT, WIDTHS, derivedName } from './archive-index.ts';
import type { ArchiveIndex, Letter, Page, Section, Transcription } from './archive-index.ts';
import type { Dimensions } from './dimensions.ts';

export type Context = {
  index: ArchiveIndex;
  /** Pixel sizes of the originals, from the derive-images manifest; empty until it has run */
  dimensions?: ReadonlyMap<string, Dimensions>;
};

const builder = new SchemaBuilder<{
  Context: Context;
  Objects: { Section: Section; Letter: Letter; Page: Page; Transcription: Transcription };
  DefaultFieldNullability: false;
}>({
  plugins: [RelayPlugin],
  defaultFieldNullability: false,
  relay: {},
});

const SectionRef = builder.objectRef<Section>('Section');
const LetterRef = builder.objectRef<Letter>('Letter');
const PageRef = builder.objectRef<Page>('Page');
const TranscriptionRef = builder.objectRef<Transcription>('Transcription');

builder.node(SectionRef, {
  id: { resolve: (s) => s.key },
  loadOne: (id, { index }) => index.sectionByKey.get(id) ?? null,
  fields: (t) => ({
    key: t.exposeString('key'),
    chapter: t.exposeInt('chapter', { nullable: true, description: 'Absent for the Introduction' }),
    title: t.exposeString('title'),
    letterCount: t.int({ resolve: (s) => s.letters.length }),
    letters: t.connection({
      type: LetterRef,
      resolve: (s, args) => resolveArrayConnection({ args }, s.letters),
    }),
    loosePages: t.field({
      type: [PageRef],
      description: 'Section-level images with no letter, such as maps and photos',
      resolve: (s) => s.loose,
    }),
  }),
});

builder.node(LetterRef, {
  id: { resolve: (l) => l.key },
  loadOne: (id, { index }) => index.letterByKey.get(id) ?? null,
  fields: (t) => ({
    key: t.exposeString('key', { description: '"440", or "441a" when a number was split' }),
    number: t.exposeInt('number'),
    variant: t.exposeString('variant', { nullable: true }),
    group: t.exposeString('group', { nullable: true, description: 'Sub-grouping folder, e.g. "Stalingrad"' }),
    section: t.field({ type: SectionRef, resolve: (l, _a, { index }) => index.sectionByKey.get(l.sectionKey)! }),
    pages: t.field({ type: [PageRef], resolve: (l) => l.pages }),
    pageCount: t.int({ resolve: (l) => l.pages.length }),
    companions: t.field({ type: [PageRef], description: 'Non-image files kept beside the scans', resolve: (l) => l.companions }),
    transcription: t.field({ type: TranscriptionRef, nullable: true, resolve: (l) => l.transcription ?? null }),
    transcriptionScans: t.field({
      type: [PageRef],
      description: "Scans the transcription was read from (the author's typed translation); not in `pages`",
      resolve: (l) => l.transcriptionScans,
    }),
    previous: t.field({
      type: LetterRef,
      nullable: true,
      resolve: (l, _a, { index }) => index.letters[index.letters.indexOf(l) - 1] ?? null,
    }),
    next: t.field({
      type: LetterRef,
      nullable: true,
      resolve: (l, _a, { index }) => index.letters[index.letters.indexOf(l) + 1] ?? null,
    }),
  }),
});

builder.node(PageRef, {
  id: { resolve: (p) => p.id },
  loadOne: (id, { index }) => {
    const slash = id.indexOf('/');
    const letter = index.letterByKey.get(id.slice(0, slash));
    return (
      letter?.pages.find((p) => p.id === id) ??
      letter?.companions.find((p) => p.id === id) ??
      letter?.transcriptionScans.find((p) => p.id === id) ??
      null
    );
  },
  fields: (t) => ({
    page: t.exposeString('page', { description: 'Original page name: "A" or a scanner id like "pfr100313"' }),
    ext: t.exposeString('ext'),
    order: t.exposeInt('order'),
    original: t.string({
      description: 'URL of the untouched scan, served by Caddy',
      resolve: (p) => `/scans/${encodeURIComponent(p.file)}`,
    }),
    image: t.field({
      type: ImageRef,
      nullable: true,
      description: 'Derived responsive sizes; null for non-image companions',
      resolve: (p) => (IMAGE_EXT.has(p.ext) ? { page: p } : null),
    }),
  }),
});

type DerivedImage = { page: Page };
const ImageRef = builder.objectRef<DerivedImage>('Image');
builder.objectType(ImageRef, {
  fields: (t) => ({
    srcset: t.string({
      resolve: ({ page }) => WIDTHS.map((w) => `/img/${derivedName(page)}-${w}.webp ${w}w`).join(', '),
    }),
    src: t.string({ resolve: ({ page }) => `/img/${derivedName(page)}-800.webp` }),
    widths: t.intList({ resolve: () => [...WIDTHS] }),
    width: t.int({
      nullable: true,
      description: 'Pixel width of the original scan, for the aspect ratio; null until images are derived',
      resolve: ({ page }, _a, { dimensions }) => dimensions?.get(page.id)?.width ?? null,
    }),
    height: t.int({ nullable: true, resolve: ({ page }, _a, { dimensions }) => dimensions?.get(page.id)?.height ?? null }),
  }),
});

builder.objectType(TranscriptionRef, {
  fields: (t) => ({
    markdown: t.exposeString('markdown'),
    source: t.exposeString('source', { description: '"book" from the author\'s text, "ocr" when machine-read' }),
  }),
});

builder.queryType({
  fields: (t) => ({
    sections: t.field({ type: [SectionRef], resolve: (_r, _a, { index }) => index.sections }),
    section: t.field({
      type: SectionRef,
      nullable: true,
      args: { key: t.arg.string({ required: true }) },
      resolve: (_r, { key }, { index }) => index.sectionByKey.get(key) ?? null,
    }),
    letter: t.field({
      type: LetterRef,
      nullable: true,
      args: { key: t.arg.string({ required: true }) },
      resolve: (_r, { key }, { index }) => index.letterByKey.get(key) ?? null,
    }),
    letters: t.connection({
      type: LetterRef,
      description: 'Every letter in reading order',
      resolve: (_r, args, { index }) => resolveArrayConnection({ args }, index.letters),
    }),
  }),
});

export const schema = builder.toSchema();
