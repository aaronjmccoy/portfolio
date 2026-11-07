import type { ComponentPropsWithoutRef, ElementType } from 'react';

type Props<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

/**
 * Text that screen readers announce but sighted users never see.
 * Uses the clip pattern rather than display:none so it stays in the
 * accessibility tree. Pass `as="label"` etc. when the element matters.
 */
export function VisuallyHidden<T extends ElementType = 'span'>({ as, ...rest }: Props<T>) {
  const Tag = (as ?? 'span') as ElementType;
  return <Tag className="ui-visually-hidden" {...rest} />;
}
