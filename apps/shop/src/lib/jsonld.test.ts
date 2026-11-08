import { describe, expect, it } from 'vitest';
import { jsonLdScript, plainText, productJsonLd } from './jsonld.ts';

describe('jsonld', () => {
  it('builds one Offer per variant with availability', () => {
    const data = productJsonLd({
      url: 'https://mallerart.com/products/starstuff',
      name: 'Starstuff',
      description: 'A peacock.',
      brand: 'Maller Art',
      images: ['https://cdn/x.jpg'],
      offers: [
        { id: 'gid://shopify/ProductVariant/1', name: 'Default Title', price: '5000.0', currency: 'USD', available: true },
        { id: 'gid://shopify/ProductVariant/2', name: 'Print', price: '35.00', currency: 'USD', available: false },
      ],
    });
    const offers = data['offers'] as Array<Record<string, string>>;
    expect(offers).toHaveLength(2);
    expect(offers[0]?.['availability']).toBe('https://schema.org/InStock');
    expect(offers[1]?.['availability']).toBe('https://schema.org/OutOfStock');
    expect(offers[0]?.['url']).toContain('variant=gid%3A%2F%2Fshopify');
  });

  it('strips tags for the description and escapes < in the script', () => {
    expect(plainText('<p>Archival print of <em>Fish &amp; Chips</em>.</p>')).toBe('Archival print of Fish & Chips.');
    expect(jsonLdScript({ a: '</script>' })).not.toContain('</script>');
  });
});
