import { CartContentsQuery, CartEmpty, CartLoader } from '../cart/CartContents.tsx';
import { useCart } from '../cart/CartContext.tsx';
import { Title } from '../components/Title.tsx';

/** The cart page proper: what the no-JS forms land on, and the drawer's permanent address. */
export const CartPageQuery = CartContentsQuery;

export function CartPage() {
  const { cartId } = useCart();
  return (
    <section className="cart-page" aria-labelledby="cart-title">
      <Title text="Your cart" />
      <h1 className="rail__title" id="cart-title">
        Your cart
      </h1>
      {cartId ? <CartLoader cartId={cartId} /> : <CartEmpty />}
    </section>
  );
}
