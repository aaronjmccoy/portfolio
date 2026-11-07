import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';
import type { ReactNode } from 'react';

function DialogDemo({ placement = 'center', title }: { placement?: 'center' | 'end'; title: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open {placement === 'end' ? 'drawer' : 'dialog'}</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} placement={placement}>
        <p>Focus is trapped here, Esc closes, and focus returns to the opener afterwards.</p>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Done
        </Button>
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Dialog',
  component: DialogDemo,
  args: { placement: 'center', title: 'Confirm order' },
  argTypes: { placement: { control: 'radio', options: ['center', 'end'] } },
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Modal: Story = {};
export const Drawer: Story = { args: { placement: 'end', title: 'Your cart' } };
