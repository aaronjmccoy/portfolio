/**
 * Lesson 8 exercises: the accessible component library.
 * Read docs/learn/08-ui-library.md first. Run: pnpm learn 08
 * (jsdom, with Testing Library and jest-dom from vitest.setup.ts)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LiveRegionProvider, VariantPicker, useAnnounce } from '@portfolio/ui';

const options = [{ name: 'Size', values: [{ value: '8×10', available: true }, { value: '11×14', available: false }] }];

function Speaker() {
  const announce = useAnnounce();
  return (
    <button type="button" onClick={() => announce('Added to cart')}>
      Add
    </button>
  );
}

describe('lesson 8: the component library', () => {
  it('8a: a sold-out variant is still a choice, and says so to a screen reader', async () => {
    const onChange = vi.fn();
    render(<VariantPicker options={options} selected={{ Size: '8×10' }} onChange={onChange} />);
    // Write it: find the radio whose accessible name is "11×14, sold out";
    // assert it is enabled (not disabled), click it, and assert onChange was
    // called with ('Size', '11×14'). Then explain why sold-out values are
    // not `disabled` (packages/ui/src/VariantPicker.tsx says why).
    throw new Error('exercise 8a: write the assertions described above');
  });

  it('8b: the same message announced twice is spoken twice', async () => {
    render(
      <LiveRegionProvider>
        <Speaker />
      </LiveRegionProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Added to cart'));
    // Write it: click again and prove the region was emptied before the
    // message came back (hint: the provider clears, then sets after 50 ms;
    // `vi.useFakeTimers()` or `waitFor` both work). Then explain why a live
    // region that keeps the same text would stay silent.
    throw new Error('exercise 8b: write the second announcement check');
  });
});
