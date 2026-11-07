import type { Meta, StoryObj } from '@storybook/react-vite';
import { Price } from './Price';

const meta = {
  title: 'Price',
  component: Price,
  args: { price: { amount: '24.00', currencyCode: 'USD' } },
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};
export const OnSale: Story = { args: { compareAt: { amount: '32.00', currencyCode: 'USD' } } };
export const Euro: Story = { args: { price: { amount: '1200', currencyCode: 'EUR' }, locale: 'de-DE' } };
