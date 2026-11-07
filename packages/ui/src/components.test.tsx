import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Disclosure } from './Disclosure';
import { Image, shopifyImageUrl } from './Image';
import { LiveRegionProvider, useAnnounce } from './LiveRegion';
import { Price, formatMoney } from './Price';
import { VariantPicker } from './VariantPicker';

describe('Button', () => {
  it('defaults to type=button and calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);
    const button = screen.getByRole('button', { name: 'Add to cart' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('while busy stays focusable, announces aria-busy and ignores clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Adding…
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Adding…' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('LiveRegionProvider', () => {
  function Demo() {
    const announce = useAnnounce();
    return (
      <>
        <button type="button" onClick={() => announce('Added to cart')}>
          add
        </button>
        <button type="button" onClick={() => announce('Payment failed', { assertive: true })}>
          fail
        </button>
      </>
    );
  }

  it('speaks through always-mounted polite and assertive regions', async () => {
    render(
      <LiveRegionProvider>
        <Demo />
      </LiveRegionProvider>,
    );
    const status = screen.getByRole('status');
    const alert = screen.getByRole('alert');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toBeEmptyDOMElement();
    await userEvent.click(screen.getByText('add'));
    expect(await screen.findByText('Added to cart')).toBe(status);
    await userEvent.click(screen.getByText('fail'));
    expect(await screen.findByText('Payment failed')).toBe(alert);
  });
});

describe('Disclosure', () => {
  it('is a native details element that reports toggles', async () => {
    const onToggle = vi.fn();
    render(
      <Disclosure summary="Shipping" onToggle={onToggle}>
        Ships in 3 days.
      </Disclosure>,
    );
    const summary = screen.getByText('Shipping');
    const details = summary.closest('details')!;
    expect(details).not.toHaveAttribute('open');
    await userEvent.click(summary);
    expect(details).toHaveAttribute('open');
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('follows a controlled open prop', () => {
    const { rerender } = render(
      <Disclosure summary="Details" open={false}>
        body
      </Disclosure>,
    );
    const details = screen.getByText('Details').closest('details')!;
    expect(details).not.toHaveAttribute('open');
    rerender(
      <Disclosure summary="Details" open>
        body
      </Disclosure>,
    );
    expect(details).toHaveAttribute('open');
  });
});

describe('Dialog', () => {
  beforeAll(() => {
    // jsdom lacks the modal API; emulate the parts the component relies on.
    const proto = HTMLDialogElement.prototype;
    proto.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open cart
        </button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Your cart" placement="end">
          <p>1 item</p>
        </Dialog>
      </>
    );
  }

  it('opens as a labelled modal, closes on Esc and on the close button', async () => {
    render(<Demo />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByText('Open cart'));
    const dialog = screen.getByRole('dialog', { name: 'Your cart' });
    expect(dialog).toHaveClass('ui-dialog--end');
    expect(screen.getByText('1 item')).toBeInTheDocument();

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(screen.getByText('Open cart'));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Price', () => {
  it('formats money for the locale', () => {
    expect(formatMoney({ amount: '24.5', currencyCode: 'USD' })).toBe('$24.50');
    expect(formatMoney({ amount: 1200, currencyCode: 'EUR' }, 'de-DE')).toBe('1.200,00 €');
  });

  it('marks a sale and spells it out for screen readers', () => {
    render(<Price price={{ amount: '24.00', currencyCode: 'USD' }} compareAt={{ amount: '32.00', currencyCode: 'USD' }} />);
    const price = screen.getByText('$24.00').closest('.ui-price')!;
    expect(price).toHaveClass('ui-price--sale');
    expect(price).toHaveTextContent('Sale price $24.00 Regular price $32.00');
    expect(screen.getByText('$32.00').closest('s')).not.toBeNull();
  });

  it('ignores a compare-at that is not higher', () => {
    render(<Price price={{ amount: '24.00', currencyCode: 'USD' }} compareAt={{ amount: '24.00', currencyCode: 'USD' }} />);
    expect(screen.queryByText(/Regular price/)).toBeNull();
  });
});

describe('Image', () => {
  it('builds a Shopify srcset capped at the source width and lazy-loads by default', () => {
    render(<Image src="https://cdn.shopify.com/s/files/1/0/x/print.jpg?v=1" alt="Koi print" width={1000} height={1400} widths={[320, 640, 960, 1280]} />);
    const img = screen.getByRole('img', { name: 'Koi print' });
    expect(img).toHaveAttribute('srcset', [320, 640, 960, 1000].map((w) => `https://cdn.shopify.com/s/files/1/0/x/print.jpg?v=1&width=${w} ${w}w`).join(', '));
    expect(img).toHaveAttribute('src', 'https://cdn.shopify.com/s/files/1/0/x/print.jpg?v=1&width=960');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('width', '1000');
    expect(img).toHaveAttribute('height', '1400');
  });

  it('eager-loads a priority image', () => {
    render(<Image src="https://cdn.shopify.com/a.jpg" alt="" priority />);
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('shopifyImageUrl replaces an existing width', () => {
    expect(shopifyImageUrl('https://cdn.shopify.com/a.jpg?width=100', 800)).toBe('https://cdn.shopify.com/a.jpg?width=800');
  });
});

describe('VariantPicker', () => {
  const options = [
    { name: 'Size', values: [{ value: '8×10', available: true }, { value: '11×14', available: false }] },
    { name: 'Finish', values: [{ value: 'Matte', available: true }] },
  ];

  it('renders one labelled radio group per option and reports changes', async () => {
    const onChange = vi.fn();
    render(<VariantPicker options={options} selected={{ Size: '8×10', Finish: 'Matte' }} onChange={onChange} />);
    const size = screen.getByRole('group', { name: 'Size' });
    expect(screen.getByRole('group', { name: 'Finish' })).toBeInTheDocument();
    const small = screen.getByRole('radio', { name: '8×10' });
    const large = screen.getByRole('radio', { name: '11×14, sold out' });
    expect(size).toContainElement(small);
    expect(small).toBeChecked();
    expect(large).toHaveAttribute('name', 'Size');
    await userEvent.click(large);
    expect(onChange).toHaveBeenCalledWith('Size', '11×14');
  });
});
