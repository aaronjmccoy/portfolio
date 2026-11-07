/**
 * The photographs, maps and documents from the original germanwarletters.com
 * landing page. The files stay on the host beside the scans (the old site's
 * `img/` folder); `derive-images --photos` writes WebP renditions of them to
 * `<data>/photos/<name>-<width>.webp`, which Caddy serves under /photos/.
 * Sizes are the originals' pixel dimensions, so the layout reserves space
 * before the images arrive.
 */
export const PHOTO_WIDTHS = [320, 800, 1600] as const;

export type Photo = {
  /** Original filename without extension; the renditions' basename */
  name: string;
  width: number;
  height: number;
  /** What the image shows */
  alt: string;
  /** The caption the old lightbox showed */
  title: string;
};

export function photoSrc(photo: Photo, width: (typeof PHOTO_WIDTHS)[number]): string {
  return `/photos/${photo.name}-${width}.webp`;
}

/**
 * Renditions are never upscaled, so a nominal 1600 file of an 824 px original
 * is 824 px wide; the srcset states each file's real width.
 */
export function photoSrcSet(photo: Photo): string {
  const seen = new Set<number>();
  const parts: string[] = [];
  for (const w of PHOTO_WIDTHS) {
    const actual = Math.min(w, photo.width);
    if (seen.has(actual)) continue;
    seen.add(actual);
    parts.push(`${photoSrc(photo, w)} ${actual}w`);
  }
  return parts.join(', ');
}

/** The largest rendition, for the lightbox and the no-JavaScript link. */
export function photoFull(photo: Photo): string {
  return photoSrc(photo, 1600);
}

const p = (name: string, width: number, height: number, title: string, alt: string = title): Photo => ({ name, width, height, title, alt });

export const photos = {
  hero: p('letters', 2130, 1490, 'Two soldiers reading letters', 'Two German soldiers sit reading letters outside a log farmhouse, a staff car parked behind them.'),
  why: p('image28', 929, 619, 'Soldiers at a field kitchen', 'German soldiers in winter greatcoats crowd round a field kitchen with their mess tins; initials are written above several of them.'),
  heinrichMailRun: p('image17', 824, 545, 'Heinrich on a mail and supply run'),
  eastern: p('image6', 1326, 1058, 'Soviet Breakthrough along the "Eastern Wall"', 'Map: the Soviet breakthrough along the "Eastern Wall"'),
  heinrichHowitzer: p('image20', 826, 558, 'Heinrich and his 105 mm field howitzer.', 'Heinrich and his gun crew with their 105 mm field howitzer'),
  caucasus: p(
    'image33',
    1328,
    1241,
    'The advance of Army Group A into the Caucuses 25th of July through December 31, 1942',
    'Map: the advance of Army Group A into the Caucasus, 25 July to 31 December 1942',
  ),
  bunkers: p('image26', 857, 586, 'Downtime for the Regiment outside of their forest bunkers'),
  shockArmy: p('image34', 1322, 1788, 'The Destruction of the 2nd Soviet Shock Army', 'Map: the destruction of the 2nd Soviet Shock Army'),
  mailCall: p('image23', 826, 537, 'Mail call for the 112th Panzer Grenadiers, Summer 1943'),
  orel: p('image35', 1326, 1144, 'Orel situation Early Spring, 1943', 'Map: the situation at Orel, early spring 1943'),
  sampleLetter: p('header', 2528, 3284, 'A sample letter', 'A handwritten letter from one of the soldiers'),
  hellmut: p('image13', 972, 655, "Hellmut's artwork", 'Hellmut’s drawing of a German military base, from a letter to his father'),
  radioNotice: p('image31', 1527, 1118, 'Notice for Mr. Theofil', 'Typed notice to Mr. Theofil about radio receiver regulations'),
  gestapo: p('image32', 1225, 1750, 'A Gestapo arrest warrant dated March 3, 1942', 'Gestapo arrest warrant dated 3 March 1942, with the Secret State Police rubber stamp'),
} satisfies Record<string, Photo>;
