import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { graphql, useMutation } from 'react-relay';
import type { RecordSourceSelectorProxy } from 'relay-runtime';
import { useAnnounce } from '@portfolio/ui';
import type { CartContextCreateMutation } from '../__generated__/CartContextCreateMutation.graphql.ts';
import type { CartContextLinesAddMutation } from '../__generated__/CartContextLinesAddMutation.graphql.ts';
import type { CartContextLinesRemoveMutation } from '../__generated__/CartContextLinesRemoveMutation.graphql.ts';
import type { CartContextLinesUpdateMutation } from '../__generated__/CartContextLinesUpdateMutation.graphql.ts';
import { writeCartCookie } from './cookie.ts';

/**
 * Each mutation returns the whole cart through the same fragment the drawer
 * and cart page read, so Relay's normalized store updates every view of the
 * cart at once. Optimistic updaters adjust the quantities in the store before
 * Shopify answers; the response then replaces them.
 */
const CreateMutation = graphql`
  mutation CartContextCreateMutation($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        ...CartContents_cart
      }
      userErrors {
        message
      }
    }
  }
`;
const LinesAddMutation = graphql`
  mutation CartContextLinesAddMutation($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartContents_cart
      }
      userErrors {
        message
      }
    }
  }
`;
const LinesUpdateMutation = graphql`
  mutation CartContextLinesUpdateMutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartContents_cart
      }
      userErrors {
        message
      }
    }
  }
`;
const LinesRemoveMutation = graphql`
  mutation CartContextLinesRemoveMutation($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartContents_cart
      }
      userErrors {
        message
      }
    }
  }
`;

export type Cart = {
  cartId: string | undefined;
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Adds a variant; creates the cart on first use. `label` is spoken by the live region. */
  add: (merchandiseId: string, quantity: number, label: string) => void;
  update: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  busy: boolean;
};

const CartContext = createContext<Cart | undefined>(undefined);

const LINES_ARGS = { first: 100 };

function bumpTotal(store: RecordSourceSelectorProxy, cartId: string, delta: number): void {
  const cart = store.get(cartId);
  if (!cart) return;
  const total = (cart.getValue('totalQuantity') as number | null) ?? 0;
  cart.setValue(Math.max(0, total + delta), 'totalQuantity');
}

export function CartProvider({ initialCartId, children }: { initialCartId: string | undefined; children: ReactNode }) {
  const [cartId, setCartId] = useState(initialCartId);
  const [open, setOpen] = useState(false);
  const announce = useAnnounce();
  const [commitCreate, creating] = useMutation<CartContextCreateMutation>(CreateMutation);
  const [commitAdd, adding] = useMutation<CartContextLinesAddMutation>(LinesAddMutation);
  const [commitUpdate, updating] = useMutation<CartContextLinesUpdateMutation>(LinesUpdateMutation);
  const [commitRemove, removing] = useMutation<CartContextLinesRemoveMutation>(LinesRemoveMutation);

  const failed = useCallback(
    (what: string, errors?: ReadonlyArray<{ message: string }> | null) => {
      const detail = errors?.map((e) => e.message).join(' ') ?? '';
      announce(`${what} failed. ${detail}`.trim(), { assertive: true });
    },
    [announce],
  );

  const add = useCallback<Cart['add']>(
    (merchandiseId, quantity, label) => {
      const lines = [{ merchandiseId, quantity }];
      if (!cartId) {
        commitCreate({
          variables: { lines },
          onCompleted: (res) => {
            if (res.cartCreate?.userErrors.length || !res.cartCreate?.cart) return failed('Adding to cart', res.cartCreate?.userErrors);
            // `id` is selected outside the fragment so it is visible here despite masking.
            const newId = res.cartCreate.cart.id;
            setCartId(newId);
            writeCartCookie(newId);
            announce(`${label} added to cart`);
            setOpen(true);
          },
          onError: () => failed('Adding to cart'),
        });
        return;
      }
      commitAdd({
        variables: { cartId, lines },
        optimisticUpdater: (store) => bumpTotal(store, cartId, quantity),
        onCompleted: (res) => {
          if (res.cartLinesAdd?.userErrors.length) return failed('Adding to cart', res.cartLinesAdd.userErrors);
          announce(`${label} added to cart`);
          setOpen(true);
        },
        onError: () => failed('Adding to cart'),
      });
    },
    [cartId, commitCreate, commitAdd, announce, failed],
  );

  const update = useCallback<Cart['update']>(
    (lineId, quantity) => {
      if (!cartId) return;
      commitUpdate({
        variables: { cartId, lines: [{ id: lineId, quantity }] },
        optimisticUpdater: (store) => {
          const line = store.get(lineId);
          const before = (line?.getValue('quantity') as number | null) ?? 0;
          line?.setValue(quantity, 'quantity');
          bumpTotal(store, cartId, quantity - before);
        },
        onCompleted: (res) => {
          if (res.cartLinesUpdate?.userErrors.length) failed('Updating the cart', res.cartLinesUpdate.userErrors);
          else announce(`Quantity set to ${quantity}`);
        },
        onError: () => failed('Updating the cart'),
      });
    },
    [cartId, commitUpdate, announce, failed],
  );

  const remove = useCallback<Cart['remove']>(
    (lineId) => {
      if (!cartId) return;
      commitRemove({
        variables: { cartId, lineIds: [lineId] },
        optimisticUpdater: (store) => {
          const cart = store.get(cartId);
          const line = store.get(lineId);
          const qty = (line?.getValue('quantity') as number | null) ?? 0;
          bumpTotal(store, cartId, -qty);
          const lines = cart?.getLinkedRecord('lines', LINES_ARGS);
          const nodes = lines?.getLinkedRecords('nodes');
          if (lines && nodes) lines.setLinkedRecords(nodes.filter((n) => n.getDataID() !== lineId), 'nodes');
        },
        onCompleted: (res) => {
          if (res.cartLinesRemove?.userErrors.length) failed('Removing from cart', res.cartLinesRemove.userErrors);
          else announce('Removed from cart');
        },
        onError: () => failed('Removing from cart'),
      });
    },
    [cartId, commitRemove, announce, failed],
  );

  const value = useMemo<Cart>(
    () => ({
      cartId,
      open,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      add,
      update,
      remove,
      busy: creating || adding || updating || removing,
    }),
    [cartId, open, add, update, remove, creating, adding, updating, removing],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Cart {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart outside CartProvider');
  return ctx;
}
