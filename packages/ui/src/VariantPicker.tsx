import { useId } from 'react';
import { cx } from './cx';
import { VisuallyHidden } from './VisuallyHidden';

export type VariantOption = {
  /** "Size", "Finish" — also the form field name, so a plain POST carries it */
  name: string;
  values: { value: string; available: boolean }[];
};

export type VariantPickerProps = {
  options: VariantOption[];
  /** Selected value per option name */
  selected: Record<string, string | undefined>;
  onChange: (name: string, value: string) => void;
  className?: string;
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * One radio group per product option, styled as chips. Radios rather than
 * buttons because the browser then provides the group semantics, arrow-key
 * movement and a single tab stop; sold-out values stay selectable (the
 * product page says so) but are labelled for screen readers and the eye.
 */
export function VariantPicker({ options, selected, onChange, className }: VariantPickerProps) {
  const base = useId();
  return (
    <div className={cx('ui-variants', className)}>
      {options.map((option) => (
        <fieldset key={option.name} className="ui-variants__group">
          <legend className="ui-variants__legend">{option.name}</legend>
          <div className="ui-variants__choices">
            {option.values.map(({ value, available }) => {
              const id = `${base}-${slug(option.name)}-${slug(value)}`;
              return (
                <span key={value} className="ui-variants__choice">
                  <input
                    type="radio"
                    id={id}
                    className="ui-visually-hidden ui-variants__input"
                    name={option.name}
                    value={value}
                    checked={selected[option.name] === value}
                    onChange={() => onChange(option.name, value)}
                  />
                  <label htmlFor={id} className={cx('ui-variants__label', !available && 'ui-variants__label--unavailable')}>
                    {value}
                    {available ? null : <VisuallyHidden>, sold out</VisuallyHidden>}
                  </label>
                </span>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
