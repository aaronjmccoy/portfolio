import { useEffect } from 'react';

const SITE = 'German War Letters';

export function pageTitle(text: string | undefined): string {
  return text ? `${text} — ${SITE}` : `${SITE}, 1939–1945`;
}

/**
 * Sets document.title after client navigation. The server writes the
 * initial <title> from the matched route, so this has nothing to do on
 * first paint and never causes a mismatch.
 */
export function Title({ text }: { text: string }) {
  useEffect(() => {
    document.title = pageTitle(text);
  }, [text]);
  return null;
}
