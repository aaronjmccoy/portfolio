/** schema.org Product markup for a product page, so search engines show price and availability. */
export type JsonLdInput = {
  url: string;
  name: string;
  description: string;
  brand: string;
  images: ReadonlyArray<string>;
  offers: ReadonlyArray<{ id: string; name: string; price: string; currency: string; available: boolean }>;
};

export function productJsonLd(p: JsonLdInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: [...p.images],
    brand: { '@type': 'Brand', name: p.brand },
    url: p.url,
    offers: p.offers.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      url: `${p.url}?variant=${encodeURIComponent(o.id)}`,
      price: o.price,
      priceCurrency: o.currency,
      availability: o.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    })),
  };
}

/** HTML text strips tags; JSON-LD wants plain text. */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/** Serialized for a <script type="application/ld+json">; `<` is escaped so content cannot close the tag. */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
