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
        <Brand />
        <SiteNav />
      </header>
      <Main />
      <footer className="site-footer">
        <p>
          <cite>Memories of a Lost Generation: German War Letters, 1939–1945</cite> by Dr. Steve Nicklas. This site is maintained in his memory.
        </p>
        <p>
          Contact: <a href="mailto:support@koifrog.com">support@koifrog.com</a>
        </p>
      </footer>
    </RelayEnvironmentProvider>
  );
}

/**
 * The book's title, on every page. On the home page it is the page's <h1>;
 * elsewhere each page has its own, so here it is a plain paragraph.
 */
function Brand() {
  const { pathname } = useLocation();
  const Tag = pathname === '/' ? 'h1' : 'p';
  return (
    <Tag className="site-brand">
      <Link to="/" className="site-brand__link">
        <span className="site-brand__title">Memories of a Lost Generation:</span>{' '}
        <span className="site-brand__subtitle">German War Letters, 1939–1945</span>
      </Link>
    </Tag>
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
