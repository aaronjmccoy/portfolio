import { describe, expect, it } from 'vitest';
import { findVariant, hasRealOptions, initialVariant, nextSelection, pickerOptions, selectionOf } from './variants.ts';

const options = [
  { name: 'Size', optionValues: [{ name: '8 x 10' }, { name: '11 x 14' }] },
  { name: 'Paper', optionValues: [{ name: 'Matte' }, { name: 'Gloss' }] },
];
const v = (id: string, size: string, paper: string, availableForSale = true) => ({
  id,
  availableForSale,
  selectedOptions: [
    { name: 'Size', value: size },
    { name: 'Paper', value: paper },
  ],
});
const variants = [v('a', '8 x 10', 'Matte'), v('b', '8 x 10', 'Gloss', false), v('c', '11 x 14', 'Matte')];

describe('variants', () => {
  it('treats Default Title as no choice', () => {
    expect(hasRealOptions([{ name: 'Title', optionValues: [{ name: 'Default Title' }] }])).toBe(false);
    expect(hasRealOptions(options)).toBe(true);
  });

  it('finds the variant for a full selection and reads a selection back', () => {
    expect(findVariant(variants, { Size: '8 x 10', Paper: 'Gloss' })?.id).toBe('b');
    expect(findVariant(variants, { Size: '11 x 14', Paper: 'Gloss' })).toBeUndefined();
    expect(selectionOf(variants[2])).toEqual({ Size: '11 x 14', Paper: 'Matte' });
  });

  it('starts from the URL variant, else the first purchasable one', () => {
    expect(initialVariant(variants, 'c')?.id).toBe('c');
    expect(initialVariant([v('x', '8 x 10', 'Matte', false), v('y', '8 x 10', 'Gloss')], null)?.id).toBe('y');
    expect(initialVariant(variants, 'nope')?.id).toBe('a');
  });

  it('marks values unavailable relative to the other choices', () => {
    const picker = pickerOptions(options, variants, { Size: '11 x 14', Paper: 'Matte' });
    expect(picker[1]?.values).toEqual([
      { value: 'Matte', available: true },
      { value: 'Gloss', available: false },
    ]);
    expect(picker[0]?.values.map((x) => x.available)).toEqual([true, true]);
  });

  it('keeps the other choices when possible, otherwise jumps to a variant with the new value', () => {
    expect(nextSelection(variants, { Size: '8 x 10', Paper: 'Matte' }, 'Size', '11 x 14')?.id).toBe('c');
    expect(nextSelection(variants, { Size: '11 x 14', Paper: 'Matte' }, 'Paper', 'Gloss')?.id).toBe('b');
  });
});
