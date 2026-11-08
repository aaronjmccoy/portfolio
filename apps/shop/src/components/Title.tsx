import { useEffect } from 'react';
import { pageTitle } from '../site.ts';

/**
 * Sets document.title after client navigation. The server writes the initial
 * <title> from the preloaded store, so this has nothing to do on first paint.
 */
export function Title({ text }: { text?: string | undefined }) {
  useEffect(() => {
    document.title = pageTitle(text);
  }, [text]);
  return null;
}
