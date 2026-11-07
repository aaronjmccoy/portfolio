import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from './SkipLink';

const meta = {
  title: 'SkipLink',
  component: SkipLink,
  render: (args) => (
    <>
      <SkipLink {...args} />
      <p>Press Tab: the link appears at the top-left and jumps past the header.</p>
      <main id="main" tabIndex={-1}>
        <h1>Main content</h1>
      </main>
    </>
  ),
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
