/** The cart id lives in a cookie so the server can render the cart and the no-JS forms can find it. */
export const CART_COOKIE = 'ma_cart';

export function readCartCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === CART_COOKIE) {
      const v = rest.join('=');
      return v ? decodeURIComponent(v) : undefined;
    }
  }
  return undefined;
}

/** Browser side: the client writes the cookie after cartCreate so the next server render knows the cart. */
export function writeCartCookie(cartId: string | undefined): void {
  if (typeof document === 'undefined') return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = cartId
    ? `${CART_COOKIE}=${encodeURIComponent(cartId)}; Path=/; Max-Age=${60 * 60 * 24 * 14}; SameSite=Lax${secure}`
    : `${CART_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
