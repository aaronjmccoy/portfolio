import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { VariantPicker } from './VariantPicker';
import type { VariantOption } from './VariantPicker';

const options: VariantOption[] = [
  {
    name: 'Size',
    values: [
      { value: '8×10', available: true },
      { value: '11×14', available: true },
      { value: '16×20', available: false },
    ],
  },
  {
    name: 'Finish',
    values: [
      { value: 'Matte', available: true },
      { value: 'Lustre', available: true },
    ],
  },
];

function Demo() {
  const [selected, setSelected] = useState<Record<string, string>>({ Size: '8×10', Finish: 'Matte' });
  return <VariantPicker options={options} selected={selected} onChange={(name, value) => setSelected((s) => ({ ...s, [name]: value }))} />;
}

const meta = { title: 'VariantPicker', component: Demo } satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
