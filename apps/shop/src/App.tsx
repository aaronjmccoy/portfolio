import { Suspense, useEffect, useRef } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { Route, Routes, useLocation } from 'react-router';
import type { Environment } from 'relay-runtime';
import { LiveRegionProvider, SkipLink } from '@portfolio/ui';
import { CartProvider } from './cart/CartContext.tsx';
import { CartDrawer } from './cart/CartDrawer.tsx';
import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { NotFound } from './components/NotFound.tsx';
import { routes } from './routes.tsx';
import './styles.css';

export type AppProps = { environment: Environment; cartId: string | undefined };

export function App({ environment, cartId }: AppProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <LiveRegionProvider>
        <CartProvider initialCartId={cartId}>
          <SkipLink />
          <Header />
          <Main />
          <Footer />
          <CartDrawer />
        </CartProvider>
      </LiveRegionProvider>
    </RelayEnvironmentProvider>
  );
}

function Main() {
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  // After a client-side navigation, move focus to the main region so screen
  // readers and keyboard users land on the new page rather than mid-header.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus();
  }, [location.pathname]);
  return (
    <main id="main" tabIndex={-1} ref={main} className="site-main">
      <Suspense
        fallback={
          <p className="loading" role="status">
            Loading…
          </p>
        }
      >
        <Routes>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={<r.Component />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  );
}
