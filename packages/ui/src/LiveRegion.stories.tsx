import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { LiveRegionProvider, useAnnounce } from './LiveRegion';

function Demo() {
  const announce = useAnnounce();
  return (
    <p style={{ display: 'flex', gap: '0.5rem' }}>
      <Button onClick={() => announce('Added to cart')}>Announce politely</Button>
      <Button variant="secondary" onClick={() => announce('Payment failed', { assertive: true })}>
        Announce assertively
      </Button>
    </p>
  );
}

const meta = {
  title: 'LiveRegion',
  component: Demo,
  decorators: [
    (Story) => (
      <LiveRegionProvider>
        <Story />
      </LiveRegionProvider>
    ),
  ],
  parameters: { docs: { description: { component: 'Nothing visible changes: turn on a screen reader to hear the announcements.' } } },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
