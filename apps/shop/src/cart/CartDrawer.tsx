import { Suspense } from 'react';
import { Dialog } from '@portfolio/ui';
import { CartEmpty, CartLoader } from './CartContents.tsx';
import { useCart } from './CartContext.tsx';

/** The cart as a drawer from the inline end, on the native dialog element. Its contents load on open. */
export function CartDrawer() {
  const { open, closeCart, cartId } = useCart();
  return (
    <Dialog open={open} onClose={closeCart} title="Your cart" placement="end" className="cart-drawer">
      {cartId ? (
        <Suspense
          fallback={
            <p className="loading" role="status">
              Loading your cart…
            </p>
          }
        >
          <CartLoader cartId={cartId} onContinue={closeCart} />
        </Suspense>
      ) : (
        <CartEmpty onContinue={closeCart} />
      )}
    </Dialog>
  );
}
