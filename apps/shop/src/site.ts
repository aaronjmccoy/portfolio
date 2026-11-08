/** Site-wide copy and the collections the storefront is built around. Megan edits titles and descriptions in Shopify; these are the handles and fallbacks. */
export const SITE = 'Maller Art';
export const TAGLINE = 'Paintings, Prints & Trinkets';
export const DESCRIPTION = 'Original watercolour paintings, fine art prints and small pretty things by Megan Maller McCoy.';
export const ARTIST = 'Megan Maller McCoy';
export const CONTACT_EMAIL = 'mamaller23@gmail.com';
export const INSTAGRAM = 'https://www.instagram.com/mamaller23/';
/** Canonical origin for structured data and sharing; the staging host is fine until launch. */
export const SITE_URL = 'https://mallerart.com';

export type Section = { handle: string; label: string; tagline: string };

/**
 * The three collections on the home page and in the nav, in order. Headings
 * use the collection's title from Shopify; `label` is the nav word (the nav
 * renders before any data loads) and a collection's own description, when
 * set, replaces the tagline.
 */
export const SECTIONS: readonly Section[] = [
  { handle: 'originals', label: 'Paintings', tagline: 'Find your next crush →' },
  { handle: 'prints', label: 'Prints', tagline: 'Take one home →' },
  { handle: 'stickers', label: 'Trinkets', tagline: 'Pretty things for everyday life →' },
];

export const HERO = {
  src: '/hero-peacock.jpg',
  width: 2560,
  height: 930,
  alt: 'Watercolour of a white peacock in profile, its blue-flecked head turned to the left against a wide fan of pale green and cream tail feathers.',
};

export function pageTitle(text?: string): string {
  return text ? `${text} — ${SITE}` : `${SITE} — ${TAGLINE}`;
}
