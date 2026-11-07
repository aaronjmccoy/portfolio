import { useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Dialog } from '@portfolio/ui';
import { photoFull, photoSrc, photoSrcSet } from '../photos.ts';
import type { Photo } from '../photos.ts';

export type GalleryCard = { photos: Photo[]; caption: ReactNode };

/**
 * A grid of captioned cards whose images open in a lightbox. Each thumbnail
 * is a real link to the large rendition, so without JavaScript it still
 * opens; with it, the lightbox pages through every image in the gallery.
 */
export function Gallery({ cards, label, columns = 4 }: { cards: GalleryCard[]; label: string; columns?: 2 | 4 }) {
  const all = cards.flatMap((c) => c.photos);
  const [open, setOpen] = useState<number | null>(null);

  const show = (photo: Photo) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setOpen(all.indexOf(photo));
  };

  return (
    <>
      <ul className={`gallery gallery--${columns}`} aria-label={label}>
        {cards.map((card, i) => (
          <li key={i} className="gallery__card">
            {card.photos.map((photo) => (
              <a key={photo.name} href={photoFull(photo)} className="gallery__open" onClick={show(photo)}>
                <img
                  className="gallery__img"
                  src={photoSrc(photo, 800)}
                  srcSet={photoSrcSet(photo)}
                  sizes={columns === 4 ? '(min-width: 64rem) 22vw, (min-width: 40rem) 45vw, 92vw' : '(min-width: 40rem) 45vw, 92vw'}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                />
                <span className="visually-hidden"> (enlarge)</span>
              </a>
            ))}
            <div className="gallery__caption">{card.caption}</div>
          </li>
        ))}
      </ul>
      <Lightbox photos={all} index={open} onIndex={setOpen} />
    </>
  );
}

function Lightbox({ photos, index, onIndex }: { photos: Photo[]; index: number | null; onIndex: (i: number | null) => void }) {
  const photo = index === null ? undefined : photos[index];
  const step = (by: number) => {
    if (index !== null) onIndex((index + by + photos.length) % photos.length);
  };

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <Dialog open={photo !== undefined} onClose={() => onIndex(null)} title={photo?.title ?? ''} className="lightbox">
      {photo ? (
        <figure className="lightbox__figure">
          <img
            className="lightbox__img"
            src={photoFull(photo)}
            srcSet={photoSrcSet(photo)}
            sizes="(min-width: 64rem) 60rem, 94vw"
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
          />
          <figcaption className="lightbox__bar">
            <button type="button" className="button" onClick={() => step(-1)}>
              Previous
            </button>
            <span aria-live="polite">
              {index! + 1} of {photos.length}
            </span>
            <button type="button" className="button" onClick={() => step(1)}>
              Next
            </button>
          </figcaption>
        </figure>
      ) : null}
    </Dialog>
  );
}
