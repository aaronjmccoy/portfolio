import { useEffect, useRef } from 'react';
import type { MouseEvent, SyntheticEvent } from 'react';

export type LightboxImage = { url: string; alt: string; width?: number | undefined; height?: number | undefined };

export type LightboxProps = {
  images: readonly LightboxImage[];
  index: number;
  onIndex: (i: number) => void;
  open: boolean;
  onClose: () => void;
  title: string;
};

/**
 * The product gallery, kept quiet: the window tints, the image sits in the
 * middle at full resolution fitted to the viewport, and the only controls are
 * a previous and a next arrow (the arrow keys work too). Escape, or a click
 * anywhere off the image, leaves. A native modal <dialog> gives the focus
 * trap, the inert page behind and focus return to the shot that opened it.
 */
export function Lightbox({ images, index, onIndex, open, onClose, title }: LightboxProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const count = images.length;
  const image = images[index];
  const go = (delta: number) => onIndex((index + delta + count) % count);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    // The dialog box is the whole viewport, so anything that is not the image or an arrow (or the glyph inside one) is "outside".
    if (!(e.target as Element).closest('.lightbox__image, .lightbox__arrow')) onClose();
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
  return (
    <dialog ref={ref} className="lightbox" aria-label={`${title} gallery`} onCancel={onCancel} onClose={() => open && onClose()} onClick={onClick}>
      {open && image ? (
        <>
          {/* The source URL without a width is the file as uploaded. */}
          <img key={image.url} className="lightbox__image" src={image.url} alt={image.alt} width={image.width} height={image.height} decoding="async" />
          {count > 1 ? (
            <>
              <button type="button" className="lightbox__arrow lightbox__arrow--prev" onClick={() => go(-1)} aria-label="Previous image">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="lightbox__arrow lightbox__arrow--next" onClick={() => go(1)} aria-label="Next image">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : null}
          <p className="lightbox__count ui-visually-hidden" aria-live="polite">
            {index + 1} of {count}
          </p>
        </>
      ) : null}
    </dialog>
  );
  /* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
}
