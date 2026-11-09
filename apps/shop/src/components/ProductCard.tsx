import type { CSSProperties } from 'react';
import { graphql, useFragment } from 'react-relay';
import { Link } from 'react-router';
import { Image, formatMoney } from '@portfolio/ui';
import type { ProductCard_product$key } from '../__generated__/ProductCard_product.graphql.ts';
import { mosaicSizes, mosaicSpan } from '../lib/mosaic.ts';

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

/** Widths the card renders at: 1-up on phones, 2-up to 60rem, then one third of the 767-track grid. */
export const CARD_SIZES = '(min-width: 60rem) 25vw, (min-width: 30rem) 45vw, 90vw';

export function priceLabel(range: { minVariantPrice: { amount: string; currencyCode: string }; maxVariantPrice: { amount: string; currencyCode: string } }): string {
  const min = formatMoney(range.minVariantPrice);
  return Number(range.minVariantPrice.amount) === Number(range.maxVariantPrice.amount) ? min : `From ${min}`;
}

export type ProductCardProps = {
  product: ProductCard_product$key;
  priority?: boolean;
  /** 3 under a section's h2 (home page), 2 under a page's h1 (collection, search) */
  headingLevel?: 2 | 3;
  /** In a `.mosaic` grid: span columns and rows from the image's own proportions (see lib/mosaic.ts). */
  mosaic?: boolean;
};

/**
 * One piece of work in a grid: image, then a ribbon with title and price. The
 * whole card is the link. In a mosaic the card is told its spans through two
 * custom properties and the CSS does the rest.
 */
export function ProductCard({ product, priority = false, headingLevel = 3, mosaic = false }: ProductCardProps) {
  const p = useFragment(ProductCardFragment, product);
  const img = p.featuredImage;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const span = mosaic ? mosaicSpan(img?.width, img?.height) : undefined;
  const style = span ? ({ '--span-cols': span.cols, '--span-rows': span.rows } as CSSProperties) : undefined;
  return (
    <article className="card" style={style}>
      <Link to={`/products/${p.handle}`} className="card__link">
        {img ? (
          <Image
            className="card__media"
            src={img.url}
            alt={img.altText ?? ''}
            width={img.width ?? undefined}
            height={img.height ?? undefined}
            sizes={span ? mosaicSizes(span.cols) : CARD_SIZES}
            priority={priority}
          />
        ) : (
          <span className="card__media card__media--empty" aria-hidden="true" />
        )}
        <div className="card__ribbon">
          <Heading className="card__title">{p.title}</Heading>
          <p className="card__caption">{p.availableForSale ? priceLabel(p.priceRange) : 'Sold'}</p>
        </div>
      </Link>
    </article>
  );
}
