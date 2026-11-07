import type { Meta, StoryObj } from '@storybook/react-vite';
import { Disclosure } from './Disclosure';

const meta = {
  title: 'Disclosure',
  component: Disclosure,
  args: { summary: 'Shipping and returns', children: 'Prints ship flat within 3 business days. Returns accepted within 30 days.' },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const Stacked: Story = {
  render: (args) => (
    <>
      <Disclosure {...args} />
      <Disclosure summary="Paper and inks">Hahnemühle Photo Rag, pigment inks rated for 100+ years.</Disclosure>
      <Disclosure summary="Framing">Sold unframed; standard sizes fit off-the-shelf frames.</Disclosure>
    </>
  ),
};
