import { graphql, useFragment } from 'react-relay';
import { Link } from 'react-router';
import { Image, formatMoney } from '@portfolio/ui';
import type { ProductCard_product$key } from '../__generated__/ProductCard_product.graphql.ts';

export const ProductCardFragment = graphql`
  fragment ProductCard_product on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

/** Widths the card renders at: 1-up on phones, 2-up to 60rem, then one third of the 683-track grid. */
export const CARD_SIZES = '(min-width: 60rem) 20vw, (min-width: 30rem) 45vw, 90vw';

export function priceLabel(range: { minVariantPrice: { amount: string; currencyCode: string }; maxVariantPrice: { amount: string; currencyCode: string } }): string {
  const min = formatMoney(range.minVariantPrice);
  return Number(range.minVariantPrice.amount) === Number(range.maxVariantPrice.amount) ? min : `From ${min}`;
}

export type ProductCardProps = {
  product: ProductCard_product$key;
  priority?: boolean;
  /** 3 under a section's h2 (home page), 2 under a page's h1 (collection, search) */
  headingLevel?: 2 | 3;
};

/** One piece of work in a grid: image, title, price. The whole card is the link. */
export function ProductCard({ product, priority = false, headingLevel = 3 }: ProductCardProps) {
  const p = useFragment(ProductCardFragment, product);
  const img = p.featuredImage;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="card">
      <Link to={`/products/${p.handle}`} className="card__link">
        {img ? (
          <Image
            className="card__media"
            src={img.url}
            alt={img.altText ?? ''}
            width={img.width ?? undefined}
            height={img.height ?? undefined}
            sizes={CARD_SIZES}
            priority={priority}
          />
        ) : (
          <span className="card__media card__media--empty" aria-hidden="true" />
        )}
        <Heading className="card__title">{p.title}</Heading>
        <p className="card__caption">{p.availableForSale ? priceLabel(p.priceRange) : 'Sold'}</p>
      </Link>
    </article>
  );
}
