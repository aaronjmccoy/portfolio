import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type Announce = (message: string, options?: { assertive?: boolean }) => void;

const AnnounceContext = createContext<Announce>(() => {});

/**
 * Two always-mounted live regions (polite and assertive) plus `useAnnounce()`
 * for components to speak through them: "Added to cart", "3 results", a
 * failed save. Mounted once near the root so the regions exist before the
 * first announcement; screen readers ignore live regions created on the fly.
 */
export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const announce = useCallback<Announce>((message, { assertive: isAssertive = false } = {}) => {
    const set = isAssertive ? setAssertive : setPolite;
    // Clear first so an identical message (a second "Added to cart") is
    // still a change the screen reader announces.
    set('');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => set(message), 50);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => announce, [announce]);
  return (
    <AnnounceContext.Provider value={value}>
      {children}
      <div className="ui-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="ui-visually-hidden" role="alert" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce(): Announce {
  return useContext(AnnounceContext);
}
