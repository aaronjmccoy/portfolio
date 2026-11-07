import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Button',
  component: Button,
  args: { children: 'Add to cart', variant: 'primary', busy: false, disabled: false },
  argTypes: { variant: { control: 'radio', options: ['primary', 'secondary', 'ghost'] } },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', children: 'View details' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Remove' } };
export const Busy: Story = { args: { busy: true, children: 'Adding…' }, parameters: { docs: { description: { story: 'Stays focusable and announces aria-busy; clicks are ignored until the action settles.' } } } };
export const Disabled: Story = { args: { disabled: true } };
