import { useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import { cx } from './cx';

export type DisclosureProps = {
  summary: ReactNode;
  children: ReactNode;
  /** Controlled open state; leave undefined for uncontrolled */
  open?: boolean;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
};

/**
 * Show/hide content behind a heading. Native <details> underneath, so it
 * works before hydration and with JavaScript off, gets keyboard handling and
 * the expanded state from the browser, and is searchable while closed in
 * browsers that support hidden=until-found.
 */
export function Disclosure({ summary, children, open, defaultOpen = false, onToggle, className }: DisclosureProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const handleToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    const next = e.currentTarget.open;
    if (next === isOpen) return;
    if (open === undefined) setInternal(next);
    onToggle?.(next);
  };
  return (
    <details className={cx('ui-disclosure', className)} open={isOpen} onToggle={handleToggle}>
      <summary className="ui-disclosure__summary">{summary}</summary>
      <div className="ui-disclosure__panel">{children}</div>
    </details>
  );
}
