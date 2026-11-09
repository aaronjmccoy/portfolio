import type { CSSProperties } from 'react';
import { graphql, useFragment } from 'react-relay';
import type { Mosaic_products$key } from '../__generated__/Mosaic_products.graphql.ts';
import { layoutMosaic, mosaicSizes, placementVars } from '../lib/mosaic.ts';
import { ProductCard } from './ProductCard.tsx';

const ProductsFragment = graphql`
  fragment Mosaic_products on Product @relay(plural: true) {
    id
    featuredImage {
      width
      height
    }
    ...ProductCard_product
  }
`;

export type MosaicProps = {
  products: Mosaic_products$key;
  /** 3 under a section's h2 (home page), 2 under a page's h1 (collection page) */
  headingLevel?: 2 | 3;
  /** How many leading tiles load eagerly (above the fold on a collection page) */
  priorityCount?: number;
};

/**
 * A grid of product tiles packed into flush bands from their images'
 * proportions (lib/mosaic.ts). The layout is computed here, during server
 * rendering, for two and for three columns; the stylesheet picks one per
 * breakpoint and stacks the tiles on one column.
 */
export function Mosaic({ products, headingLevel = 3, priorityCount = 0 }: MosaicProps) {
  const items = useFragment(ProductsFragment, products);
  const sizes = items.map((p) => ({ width: p.featuredImage?.width, height: p.featuredImage?.height }));
  const at2 = layoutMosaic(sizes, 2);
  const at3 = layoutMosaic(sizes, 3);
  return (
    // The outer div is the size container the mosaic's row unit is measured against.
    <div className="collection__grid collection__grid--mosaic">
      <div className="mosaic">
        {items.map((p, i) => {
          const two = at2[i];
          const three = at3[i];
          if (!two || !three) return null;
          return (
            <ProductCard
              key={p.id}
              product={p}
              headingLevel={headingLevel}
              priority={i < priorityCount}
              sizes={mosaicSizes(two.colSpan, three.colSpan)}
              style={placementVars(two, three) as CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
