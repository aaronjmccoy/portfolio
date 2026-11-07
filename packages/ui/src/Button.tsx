import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/** Class list for something that should look like a button but isn't one, e.g. a router Link. */
export function buttonClass(variant: ButtonVariant = 'primary', className?: string): string {
  return cx('ui-button', `ui-button--${variant}`, className);
}

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  /**
   * An in-flight action. The button stays focusable and announces aria-busy
   * (a disabled control would drop keyboard focus mid-task) but ignores
   * clicks until the action settles.
   */
  busy?: boolean;
};

export function Button({ variant = 'primary', busy = false, className, type = 'button', onClick, ...rest }: ButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (busy) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  return (
    <button
      type={type}
      className={buttonClass(variant, className)}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={handleClick}
      {...rest}
    />
  );
}
