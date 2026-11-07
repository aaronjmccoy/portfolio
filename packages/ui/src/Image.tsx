import type { ComponentPropsWithoutRef } from 'react';

export const DEFAULT_WIDTHS: readonly number[] = [320, 640, 960, 1280, 1920];

/** Shopify's CDN resizes on request: any image URL plus `?width=`. */
export function shopifyImageUrl(src: string, width: number): string {
  const url = new URL(src, 'https://cdn.shopify.com');
  url.searchParams.set('width', String(width));
  return url.href;
}

export type ImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'srcSet' | 'loading' | 'alt'> & {
  src: string;
  /** Required: "" for decorative images, otherwise what the image shows */
  alt: string;
  /** Intrinsic size of the source; sets the aspect ratio and caps the srcset */
  width?: number;
  height?: number;
  /** Candidate widths; the source's own width is appended and larger ones dropped */
  widths?: readonly number[];
  /** Builds the URL for a given width; defaults to Shopify's CDN parameter */
  srcFor?: (src: string, width: number) => string;
  /** The LCP image: eager, high priority. Everything else lazy-loads. */
  priority?: boolean;
};

/**
 * Responsive image over a resizing CDN. Lazy by default, never upscaled,
 * and always with width/height so the layout reserves its space.
 */
export function Image({
  src,
  alt,
  width,
  height,
  widths = DEFAULT_WIDTHS,
  srcFor = shopifyImageUrl,
  priority = false,
  sizes = '100vw',
  decoding = 'async',
  ...rest
}: ImageProps) {
  const candidates = width ? [...widths.filter((w) => w < width), width] : [...widths];
  const fallback = candidates.find((w) => w >= 960) ?? candidates[candidates.length - 1] ?? 960;
  return (
    <img
      src={srcFor(src, fallback)}
      srcSet={candidates.map((w) => `${srcFor(src, w)} ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={decoding}
      {...rest}
    />
  );
}
