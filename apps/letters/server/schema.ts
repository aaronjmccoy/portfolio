/**
 * GraphQL schema for the letters archive, built with Pothos.
 *
 * Relay-spec by design: every addressable thing is a Node with a global ID,
 * lists are connections, and the client is react-relay. The schema is
 * printed to schema/schema.graphql (pnpm schema:print) for relay-compiler.
 */
import SchemaBuilder from '@pothos/core';
import RelayPlugin, { resolveArrayConnection } from '@pothos/plugin-relay';
import type { ArchiveIndex, Letter, Page, Section, Transcription } from './archive-index.ts';

export type Context = { index: ArchiveIndex };

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
    return letter?.pages.find((p) => p.id === id) ?? letter?.companions.find((p) => p.id === id) ?? null;
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
      resolve: (p) => (['jpg', 'jpeg', 'png'].includes(p.ext) ? { page: p } : null),
    }),
  }),
});

type DerivedImage = { page: Page };
const ImageRef = builder.objectRef<DerivedImage>('Image');
const WIDTHS = [320, 800, 1600] as const;
builder.objectType(ImageRef, {
  fields: (t) => ({
    srcset: t.string({
      resolve: ({ page }) => WIDTHS.map((w) => `/img/${encodeURIComponent(page.id)}-${w}.webp ${w}w`).join(', '),
    }),
    src: t.string({ resolve: ({ page }) => `/img/${encodeURIComponent(page.id)}-800.webp` }),
    widths: t.intList({ resolve: () => [...WIDTHS] }),
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
