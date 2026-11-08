import { useMemo } from 'react';
import type { FormEvent } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Link, useParams, useSearchParams } from 'react-router';
import { Button, Image, Price, VariantPicker } from '@portfolio/ui';
import type { ProductPageQuery as QueryType } from '../__generated__/ProductPageQuery.graphql.ts';
import { useCart } from '../cart/CartContext.tsx';
import { NotFound } from '../components/NotFound.tsx';
import { Title } from '../components/Title.tsx';
import { jsonLdScript, plainText, productJsonLd } from '../lib/jsonld.ts';
import { hasRealOptions, initialVariant, nextSelection, pickerOptions, selectionOf } from '../lib/variants.ts';
import { fetchPolicy } from '../relay/environment.ts';
import { SITE, SITE_URL } from '../site.ts';

export const ProductPageQuery = graphql`
  query ProductPageQuery($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      descriptionHtml
      availableForSale
      collections(first: 1) {
        nodes {
          handle
          title
        }
      }
      images(first: 10) {
        nodes {
          url
          altText
          width
          height
        }
      }
      options {
        name
        optionValues {
          name
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
          }
        }
      }
    }
  }
`;

const GALLERY_SIZES = '(min-width: 60rem) 55vw, 100vw';

export function ProductPage() {
  const { handle = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const data = useLazyLoadQuery<QueryType>(ProductPageQuery, { handle }, { fetchPolicy });
  const { add, busy } = useCart();
  const product = data.product;
  const variants = useMemo(() => product?.variants.nodes ?? [], [product]);
  const variant = initialVariant(variants, params.get('variant'));
  const selected = useMemo(() => selectionOf(variant), [variant]);
  const options = useMemo(() => (product ? pickerOptions(product.options, variants, selected) : []), [product, variants, selected]);
  if (!product) return <NotFound what="piece" />;

  const onPick = (name: string, value: string) => {
    const next = nextSelection(variants, selected, name, value);
    if (next) setParams({ variant: next.id }, { replace: true, preventScrollReset: true });
  };
  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (variant) add(variant.id, 1, product.title);
  };

  const images = product.images.nodes;
  const heroImage = images.find((i) => i.url === variant?.image?.url) ?? images[0];
  const others = images.filter((i) => i !== heroImage);
  const crumb = product.collections.nodes[0];
  const url = `${SITE_URL}/products/${product.handle}`;
  const jsonLd = productJsonLd({
    url,
    name: product.title,
    description: plainText(product.descriptionHtml),
    brand: product.vendor || SITE,
    images: images.map((i) => i.url),
    offers: variants.map((v) => ({ id: v.id, name: v.title, price: v.price.amount, currency: v.price.currencyCode, available: v.availableForSale })),
  });

  return (
    <article className="product">
      <Title text={product.title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <div className="product__gallery">
        {heroImage ? (
          <Image className="product__image" src={heroImage.url} alt={heroImage.altText ?? product.title} width={heroImage.width ?? undefined} height={heroImage.height ?? undefined} sizes={GALLERY_SIZES} priority />
        ) : null}
        {others.length ? (
          <ul className="product__thumbs" aria-label={`More views of ${product.title}`}>
            {others.map((img) => (
              <li key={img.url}>
                <Image className="product__image" src={img.url} alt={img.altText ?? `${product.title}, another view`} width={img.width ?? undefined} height={img.height ?? undefined} sizes={GALLERY_SIZES} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="product__panel">
        {crumb ? (
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link to={`/collections/${crumb.handle}`}>{crumb.title}</Link>
          </nav>
        ) : null}
        <h1 className="product__title">{product.title}</h1>
        {variant ? (
          <p className="product__price">
            <Price price={variant.price} compareAt={variant.compareAtPrice} />
          </p>
        ) : null}
        <form method="post" action="/cart/add" className="product__buy" onSubmit={onAdd}>
          {hasRealOptions(product.options) ? <VariantPicker options={options} selected={selected} onChange={onPick} /> : null}
          <input type="hidden" name="id" value={variant?.id ?? ''} />
          <input type="hidden" name="quantity" value="1" />
          {variant?.availableForSale ? (
            <Button type="submit" busy={busy} className="product__add">
              Add to cart
            </Button>
          ) : (
            <p className="product__soldout" role="status">
              {variants.length > 1 ? 'This option is sold out.' : 'Sold.'}
            </p>
          )}
        </form>
        {product.descriptionHtml ? <div className="product__description prose" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} /> : null}
      </div>
    </article>
  );
}
