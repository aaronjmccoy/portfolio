import { Suspense, useEffect, useRef } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { Link, Route, Routes, useLocation } from 'react-router';
import type { Environment } from 'relay-runtime';
import { SkipLink } from '@portfolio/ui';
import { routes } from './routes.tsx';
import { NotFound } from './components/NotFound.tsx';
import './styles.css';

export type AppProps = { environment: Environment };

export function App({ environment }: AppProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <SkipLink />
      <header className="site-header">
        <p className="site-header__name">
          <Link to="/">German War Letters</Link> <span className="site-header__dates">1939–1945</span>
        </p>
        <SiteNav />
      </header>
      <Main />
      <footer className="site-footer">
        <p>The letters, the translations and the commentary are the author's. The site is maintained in his memory.</p>
      </footer>
    </RelayEnvironmentProvider>
  );
}

const TABS = [
  { to: '/', label: 'Home', match: (p: string) => p === '/' },
  { to: '/letters', label: 'Letters', match: (p: string) => /^\/(letters|chapter|letter)(\/|$)/.test(p) },
];

/** Two tabs: the book's home page, and the letters reader with its chapters and scans. */
function SiteNav() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Site" className="site-nav">
      <ul className="site-nav__list">
        {TABS.map((t) => {
          const here = t.match(pathname);
          return (
            <li key={t.to}>
              <Link to={t.to} className="site-nav__link" aria-current={here ? (pathname === t.to ? 'page' : 'true') : undefined}>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Main() {
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  // After a client-side navigation, move focus to the main region so screen
  // readers and keyboard users land on the new page rather than mid-footer.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus();
  }, [location.pathname]);
  return (
    <main id="main" tabIndex={-1} ref={main} className="site-main">
      <Suspense fallback={<p className="loading" role="status">Loading…</p>}>
        <Routes>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={<r.Component />} />
          ))}
          <Route path="*" element={<NotFound what="page" />} />
        </Routes>
      </Suspense>
    </main>
  );
}
