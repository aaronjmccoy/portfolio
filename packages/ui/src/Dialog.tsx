import { useEffect, useId, useRef } from 'react';
import type { MouseEvent, ReactNode, SyntheticEvent } from 'react';
import { cx } from './cx';

export type DialogProps = {
  open: boolean;
  /** Called for every way out: close button, Esc, backdrop click */
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** `center` for a modal, `end` for a drawer sliding in from the inline end */
  placement?: 'center' | 'end';
  closeLabel?: string;
  className?: string;
};

/**
 * Modal dialog or drawer on the native <dialog> element: `showModal()` gives
 * the focus trap, Esc, an inert page behind it and focus return to the
 * opener for free. React state stays the source of truth, so Esc asks the
 * owner to close rather than closing by itself. Children mount only while
 * open, so data they load is loaded on demand.
 */
export function Dialog({ open, onClose, title, children, placement = 'center', closeLabel = 'Close', className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };
  const onNativeClose = () => {
    if (open) onClose();
  };
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    // The panel fills the dialog box, so a click whose target is the dialog
    // itself landed on the backdrop.
    if (e.target === ref.current) onClose();
  };

  // Backdrop click is a pointer-only extra; keyboard users have Esc (native
  // cancel) and the close button, so no key handler belongs on the element.
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
  return (
    <dialog
      ref={ref}
      className={cx('ui-dialog', `ui-dialog--${placement}`, className)}
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClose={onNativeClose}
      onClick={onBackdropClick}
    >
      {open ? (
        <div className="ui-dialog__panel">
          <header className="ui-dialog__header">
            <h2 id={titleId} className="ui-dialog__title">
              {title}
            </h2>
            <button type="button" className="ui-dialog__close" onClick={onClose} aria-label={closeLabel}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
          </header>
          <div className="ui-dialog__body">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
