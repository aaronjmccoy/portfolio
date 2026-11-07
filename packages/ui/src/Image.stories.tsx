import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from './Image';

// Storybook has no Shopify CDN; a placeholder service that resizes by path stands in.
const picsum = (src: string, width: number) => `${src}/${width}/${Math.round(width * 1.25)}`;

const meta = {
  title: 'Image',
  component: Image,
  args: {
    src: 'https://picsum.photos/seed/koi',
    alt: 'Koi print, blue on cream',
    width: 1200,
    height: 1500,
    srcFor: picsum,
    sizes: '(min-width: 64rem) 50vw, 100vw',
    style: { maxWidth: '24rem' },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lazy: Story = {};
export const Priority: Story = { args: { priority: true } };
