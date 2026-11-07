import type { ReactNode } from 'react';

type Props = { href?: string; children?: ReactNode };

/**
 * First focusable element on the page. Hidden until focused, then pinned to
 * the top-left so keyboard users can jump past the header.
 * The target must be focusable: give <main> `id="main" tabIndex={-1}`.
 */
export function SkipLink({ href = '#main', children = 'Skip to content' }: Props) {
  return (
    <a className="ui-skip-link" href={href}>
      {children}
    </a>
  );
}
