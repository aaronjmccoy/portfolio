/** Pure helpers for product options and variants, shared by the product page and its tests. */
import type { VariantOption } from '@portfolio/ui';

export type SelectedOption = { readonly name: string; readonly value: string };
export type VariantLike = {
  readonly id: string;
  readonly availableForSale: boolean;
  readonly selectedOptions: ReadonlyArray<SelectedOption>;
};
export type OptionLike = { readonly name: string; readonly optionValues: ReadonlyArray<{ readonly name: string }> };

/** Shopify gives single-variant products one option named Title with the value Default Title; it is not a choice. */
export function hasRealOptions(options: ReadonlyArray<OptionLike>): boolean {
  return !(options.length === 1 && options[0]?.name === 'Title' && options[0].optionValues.length === 1);
}

/** The variant whose options match the selection exactly, if any. */
export function findVariant<V extends VariantLike>(variants: ReadonlyArray<V>, selected: Record<string, string | undefined>): V | undefined {
  return variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value));
}

/** The selection a variant represents, as the picker's `selected` prop. */
export function selectionOf(variant: VariantLike | undefined): Record<string, string | undefined> {
  return Object.fromEntries((variant?.selectedOptions ?? []).map((o) => [o.name, o.value]));
}

/** The variant to show first: the one named in the URL, else the first that can be bought, else the first. */
export function initialVariant<V extends VariantLike>(variants: ReadonlyArray<V>, requestedId: string | null | undefined): V | undefined {
  return variants.find((v) => v.id === requestedId) ?? variants.find((v) => v.availableForSale) ?? variants[0];
}

/**
 * Options for the picker, with availability per value given what else is
 * selected: for each value, is there a purchasable variant that has it together
 * with the current choices for the other options?
 */
export function pickerOptions(
  options: ReadonlyArray<OptionLike>,
  variants: ReadonlyArray<VariantLike>,
  selected: Record<string, string | undefined>,
): VariantOption[] {
  return options.map((option) => ({
    name: option.name,
    values: option.optionValues.map(({ name: value }) => ({
      value,
      available: variants.some(
        (v) =>
          v.availableForSale &&
          v.selectedOptions.every((o) => (o.name === option.name ? o.value === value : selected[o.name] === undefined || selected[o.name] === o.value)),
      ),
    })),
  }));
}

/**
 * The selection after choosing one value: keep the other choices when a variant
 * exists for them, otherwise fall back to the first variant that has the new value.
 */
export function nextSelection<V extends VariantLike>(
  variants: ReadonlyArray<V>,
  selected: Record<string, string | undefined>,
  name: string,
  value: string,
): V | undefined {
  const wanted = { ...selected, [name]: value };
  return findVariant(variants, wanted) ?? variants.find((v) => v.selectedOptions.some((o) => o.name === name && o.value === value));
}
