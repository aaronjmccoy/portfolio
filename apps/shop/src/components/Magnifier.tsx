import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Image, shopifyImageUrl } from '@portfolio/ui';

export type MagnifierProps = {
  src: string;
  alt: string;
  width?: number | undefined;
  height?: number | undefined;
  sizes: string;
  priority?: boolean;
  /** How much larger the lens shows the image than the frame */
  zoom?: number;
  /** Clicking the frame: open the gallery on this image */
  onOpen: () => void;
};

/** Largest rendition the lens pans over; Shopify's CDN caps requests at the source size anyway. */
const LENS_WIDTH = 2048;

/**
 * A product shot in a button. With a mouse, hovering shows a magnified view
 * of the same image inside the frame that pans with the pointer; the
 * percentage background position maps the pointer's place in the frame to
 * the same place in the enlarged image. Touch and keyboard skip the lens and
 * open the gallery, which has the full-size image for everyone.
 */
export function Magnifier({ src, alt, width, height, sizes, priority = false, zoom = 2.5, onOpen }: MagnifierProps) {
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);
  const preloaded = useRef(false);
  const large = shopifyImageUrl(src, width ? Math.min(width, LENS_WIDTH) : LENS_WIDTH);

  const place = (e: PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setLens({ x, y });
  };
  const onPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    if (!preloaded.current) {
      preloaded.current = true;
      const img = new window.Image();
      img.onload = () => setReady(true);
      img.src = large;
    }
    place(e);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse') place(e);
  };

  return (
    <button
      type="button"
      className="shot"
      onClick={onOpen}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setLens(null)}
      aria-haspopup="dialog"
    >
      <Image className="shot__image product__image" src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} />
      {lens && ready ? (
        <span
          className="shot__lens"
          aria-hidden="true"
          data-testid="lens"
          style={{
            backgroundImage: `url("${large}")`,
            backgroundSize: `${zoom * 100}%`,
            backgroundPosition: `${lens.x}% ${lens.y}%`,
          }}
        />
      ) : null}
    </button>
  );
}
