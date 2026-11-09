import { useState } from 'react';
import { Lightbox } from './Lightbox.tsx';
import type { LightboxImage } from './Lightbox.tsx';
import { Magnifier } from './Magnifier.tsx';

const GALLERY_SIZES = '(min-width: 60rem) 55vw, 100vw';

export type ProductGalleryProps = {
  /** The hero first, then the other views */
  images: readonly LightboxImage[];
  title: string;
};

/** Hero shot plus thumbnails, each a magnifier on hover and a gallery on click. */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const [hero, ...others] = images;
  if (!hero) return null;
  return (
    <div className="product__gallery">
      <Magnifier src={hero.url} alt={hero.alt} width={hero.width} height={hero.height} sizes={GALLERY_SIZES} priority onOpen={() => show(0)} />
      {others.length ? (
        <ul className="product__thumbs" aria-label={`More views of ${title}`}>
          {others.map((img, i) => (
            <li key={img.url}>
              <Magnifier src={img.url} alt={img.alt} width={img.width} height={img.height} sizes={GALLERY_SIZES} onOpen={() => show(i + 1)} />
            </li>
          ))}
        </ul>
      ) : null}
      <Lightbox images={images} index={index} onIndex={setIndex} open={open} onClose={() => setOpen(false)} title={title} />
    </div>
  );
}
