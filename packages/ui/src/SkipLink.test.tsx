import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink';
import { VisuallyHidden } from './VisuallyHidden';

describe('SkipLink', () => {
  it('is the first tab stop and targets #main by default', async () => {
    render(
      <>
        <SkipLink />
        <main id="main" tabIndex={-1}>
          content
        </main>
      </>,
    );
    await userEvent.tab();
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute('href', '#main');
  });
});

describe('VisuallyHidden', () => {
  it('keeps text in the accessibility tree and honours `as`', () => {
    render(<VisuallyHidden as="label" htmlFor="q">Search artwork</VisuallyHidden>);
    const label = screen.getByText('Search artwork');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveClass('ui-visually-hidden');
  });
});
