import { Suspense, useDeferredValue, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Link, useLocation, useNavigate } from 'react-router';
import { Image, VisuallyHidden, useAnnounce } from '@portfolio/ui';
import type { HeaderCartCountQuery as CartCountQueryType } from '../__generated__/HeaderCartCountQuery.graphql.ts';
import type { HeaderSuggestionsQuery as SuggestionsQueryType } from '../__generated__/HeaderSuggestionsQuery.graphql.ts';
import { useCart } from '../cart/CartContext.tsx';
import { SECTIONS, SITE } from '../site.ts';

export function Header() {
  const { pathname, search } = useLocation();
  const Wordmark = pathname === '/' ? 'h1' : 'p';
  return (
    <header className="site-header">
      <Wordmark className="wordmark">
        <Link to="/" className="wordmark__link">
          {SITE}
        </Link>
      </Wordmark>
      <nav aria-label="Collections" className="site-nav">
        <ul>
          {SECTIONS.map((s) => {
            const to = `/collections/${s.handle}`;
            return (
              <li key={s.handle}>
                <Link to={to} aria-current={pathname === to ? 'page' : undefined}>
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="site-tools">
        {/* keyed by location so the field resets on navigation without an effect */}
        <SearchBox key={`${pathname}?${search}`} />
        <CartLink />
      </div>
    </header>
  );
}

const SuggestionsQuery = graphql`
  query HeaderSuggestionsQuery($q: String!) {
    predictiveSearch(query: $q, limit: 6, types: [PRODUCT]) {
      products {
        id
        handle
        title
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

/**
 * The search pill. A plain GET form to /search, so it works without
 * JavaScript; with it, typing shows predictive suggestions from Shopify and
 * submit navigates in place.
 */
function SearchBox() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputId = useId();
  const listId = useId();
  const initial = location.pathname === '/search' ? (new URLSearchParams(location.search).get('q') ?? '') : '';
  const [q, setQ] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const deferred = useDeferredValue(q.trim());
  const box = useRef<HTMLDivElement>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setTouched(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };
  const showSuggestions = touched && focused && deferred.length >= 2;

  return (
    <div
      className="search"
      ref={box}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!box.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <form role="search" action="/search" method="get" className="search__form" onSubmit={onSubmit}>
        <label htmlFor={inputId} className="ui-visually-hidden">
          Search artwork
        </label>
        <input
          id={inputId}
          className="search__input"
          type="search"
          name="q"
          placeholder="Search"
          autoComplete="off"
          spellCheck={false}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setTouched(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && q) {
              e.preventDefault();
              setQ('');
            }
          }}
          aria-controls={showSuggestions ? listId : undefined}
          aria-describedby={showSuggestions ? `${listId}-hint` : undefined}
        />
        <button type="submit" className="search__submit" aria-label="Search">
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M10.5 10.5L15 15" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </form>
      {showSuggestions ? (
        <Suspense fallback={null}>
          <Suggestions q={deferred} listId={listId} onPick={() => setTouched(false)} />
        </Suspense>
      ) : null}
    </div>
  );
}

function Suggestions({ q, listId, onPick }: { q: string; listId: string; onPick: () => void }) {
  const data = useLazyLoadQuery<SuggestionsQueryType>(SuggestionsQuery, { q }, { fetchPolicy: 'store-or-network' });
  const products = data.predictiveSearch?.products ?? [];
  const announce = useAnnounce();
  useEffect(() => {
    announce(products.length ? `${products.length} suggestions` : 'No suggestions');
  }, [products.length, announce]);
  if (!products.length) return null;
  return (
    <div className="suggestions" id={listId}>
      <p id={`${listId}-hint`} className="ui-visually-hidden">
        Suggestions follow. Press Tab to move through them, or Enter to search.
      </p>
      <ul className="suggestions__list" aria-label="Suggestions">
        {products.map((p) => (
          <li key={p.id}>
            <Link to={`/products/${p.handle}`} className="suggestions__item" onClick={onPick}>
              {p.featuredImage ? (
                <Image className="suggestions__media" src={p.featuredImage.url} alt="" width={p.featuredImage.width ?? undefined} height={p.featuredImage.height ?? undefined} sizes="3rem" widths={[48, 96, 144]} />
              ) : null}
              <span>{p.title}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to={`/search?q=${encodeURIComponent(q)}`} className="suggestions__item suggestions__all" onClick={onPick}>
            All results for “{q}”
          </Link>
        </li>
      </ul>
    </div>
  );
}

const CartCountQuery = graphql`
  query HeaderCartCountQuery($id: ID!) {
    cart(id: $id) {
      id
      totalQuantity
    }
  }
`;

/** Link to the cart page; with JavaScript a plain click opens the drawer instead. */
function CartLink() {
  const { cartId, openCart } = useCart();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    openCart();
  };
  return (
    <Link to="/cart" className="cart-link" onClick={onClick}>
      Cart
      {cartId ? <CartCount cartId={cartId} /> : null}
    </Link>
  );
}

const noop = () => () => {};

/** Client-only: the count is not worth a cart query on every server render. False on the server and during hydration, true after. */
function CartCount({ cartId }: { cartId: string }) {
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <CartCountValue cartId={cartId} />
    </Suspense>
  );
}

function CartCountValue({ cartId }: { cartId: string }) {
  const data = useLazyLoadQuery<CartCountQueryType>(CartCountQuery, { id: cartId }, { fetchPolicy: 'store-or-network' });
  const n = data.cart?.totalQuantity ?? 0;
  if (!n) return null;
  // Spoken as "Cart, 1 item"; shown as "Cart (1)". The visible parentheses are hidden from the name.
  return (
    <>
      <VisuallyHidden>
        , {n} {n === 1 ? 'item' : 'items'}
      </VisuallyHidden>
      <span className="cart-link__count" aria-hidden="true">
        {' '}({n})
      </span>
    </>
  );
}
