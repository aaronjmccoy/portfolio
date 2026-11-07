import type { Preview } from '@storybook/react-vite';
import '../src/index';

const preview: Preview = {
  parameters: {
    a11y: {
      // Every story is checked against WCAG 2.2 AA; a violation fails the story.
      test: 'error',
      config: { rules: [] },
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } },
    },
    layout: 'padded',
  },
};

export default preview;
