import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { Button, Image, Price, buttonClass } from '@portfolio/ui';
import type { CartContents_cart$key } from '../__generated__/CartContents_cart.graphql.ts';
import type { CartContentsQuery as CartContentsQueryType } from '../__generated__/CartContentsQuery.graphql.ts';
import { fetchPolicy } from '../relay/environment.ts';
import { useCart } from './CartContext.tsx';

export const CartFragment = graphql`
  fragment CartContents_cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          __typename
          ... on ProductVariant {
            id
            title
            product {
              handle
              title
            }
            image {
              url
              altText
              width
              height
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export const CartContentsQuery = graphql`
  query CartContentsQuery($id: ID!) {
    cart(id: $id) {
      ...CartContents_cart
    }
  }
`;

type Continue = { onContinue?: (() => void) | undefined };

export function CartEmpty({ onContinue }: Continue) {
  return (
    <div className="cart-empty">
      <p>Your cart is empty.</p>
      <p>
        <Link to="/" className={buttonClass('secondary')} onClick={onContinue}>
          Keep looking
        </Link>
      </p>
    </div>
  );
}

/** Loads the cart by id and renders it. Rendered only when a cart id exists. */
export function CartLoader({ cartId, onContinue }: { cartId: string } & Continue) {
  const data = useLazyLoadQuery<CartContentsQueryType>(CartContentsQuery, { id: cartId }, { fetchPolicy });
  if (!data.cart) return <CartEmpty onContinue={onContinue} />;
  return <CartContents cart={data.cart} onContinue={onContinue} />;
}

/**
 * The cart's lines, subtotal and checkout link. Every control is a real form
 * posting to the server, so it works before hydration and with JavaScript off;
 * with JavaScript the submit is intercepted and becomes a Relay mutation.
 */
export function CartContents({ cart: key, onContinue }: { cart: CartContents_cart$key } & Continue) {
  const cart = useFragment(CartFragment, key);
  const { update, remove, busy } = useCart();
  if (cart.lines.nodes.length === 0) return <CartEmpty onContinue={onContinue} />;

  const onUpdate = (lineId: string) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.name === 'remove') return remove(lineId);
    const quantity = Number(new FormData(form).get('quantity') ?? 1);
    update(lineId, Math.max(0, quantity));
  };

  return (
    <div className="cart">
      <ul className="cart__lines" aria-label="Items in your cart">
        {cart.lines.nodes.map((line) => {
          const m = line.merchandise;
          if (m.__typename !== 'ProductVariant') return null;
          const options = m.selectedOptions.filter((o) => o.value !== 'Default Title');
          return (
            <li key={line.id} className="cart-line">
              {m.image ? (
                <Image className="cart-line__media" src={m.image.url} alt={m.image.altText ?? ''} width={m.image.width ?? undefined} height={m.image.height ?? undefined} sizes="6rem" widths={[96, 192, 288]} />
              ) : (
                <span className="cart-line__media cart-line__media--empty" aria-hidden="true" />
              )}
              <div className="cart-line__body">
                <h3 className="cart-line__title">
                  <Link to={`/products/${m.product.handle}`} onClick={onContinue}>
                    {m.product.title}
                  </Link>
                </h3>
                {options.length ? <p className="cart-line__options">{options.map((o) => `${o.name}: ${o.value}`).join(' · ')}</p> : null}
                <p className="cart-line__price">
                  <Price price={line.cost.totalAmount} />
                </p>
                <form method="post" action="/cart/update" className="cart-line__form" onSubmit={onUpdate(line.id)}>
                  <input type="hidden" name="line" value={line.id} />
                  <label className="cart-line__qty">
                    <span>Qty</span>
                    <input type="number" name="quantity" min={0} max={99} defaultValue={line.quantity} key={line.quantity} inputMode="numeric" />
                  </label>
                  <Button type="submit" variant="secondary" busy={busy} className="cart-line__update">
                    Update
                  </Button>
                  <Button type="submit" variant="ghost" name="remove" value="1" busy={busy} aria-label={`Remove ${m.product.title}`}>
                    Remove
                  </Button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="cart__summary">
        <p className="cart__subtotal">
          <span>Subtotal</span> <Price price={cart.cost.subtotalAmount} />
        </p>
        <p className="cart__note">Shipping and taxes are calculated at checkout.</p>
        <a href={cart.checkoutUrl} className={buttonClass('primary', 'cart__checkout')}>
          Check out
        </a>
      </div>
    </div>
  );
}
