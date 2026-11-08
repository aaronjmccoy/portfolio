import { cx } from './cx';
import { VisuallyHidden } from './VisuallyHidden';

/** The shape Shopify's Storefront API returns for MoneyV2 */
export type Money = { amount: string | number; currencyCode: string };

export function formatMoney({ amount, currencyCode }: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(Number(amount));
}

export type PriceProps = {
  price: Money;
  /** The pre-sale price; shown struck through when higher than `price` */
  compareAt?: Money | null | undefined;
  locale?: string;
  className?: string;
};

/**
 * A price, with the sale relationship spoken as well as shown: a struck-out
 * number alone is "24 dollars 32 dollars" to a screen reader.
 */
export function Price({ price, compareAt, locale, className }: PriceProps) {
  const onSale = !!compareAt && Number(compareAt.amount) > Number(price.amount);
  return (
    <span className={cx('ui-price', onSale && 'ui-price--sale', className)}>
      {onSale ? <VisuallyHidden>Sale price </VisuallyHidden> : null}
      <data className="ui-price__amount" value={String(price.amount)}>
        {formatMoney(price, locale)}
      </data>
      {onSale ? (
        <>
          {' '}
          <s className="ui-price__compare">
            <VisuallyHidden>Regular price </VisuallyHidden>
            {formatMoney(compareAt, locale)}
          </s>
        </>
      ) : null}
    </span>
  );
}
