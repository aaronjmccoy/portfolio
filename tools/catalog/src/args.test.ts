import { describe, expect, it } from 'vitest';
import { parseArgs } from './args.ts';

describe('parseArgs', () => {
  it('reads the command and defaults', () => {
    expect(parseArgs(['derive'])).toEqual({
      command: 'derive',
      dryRun: false,
      configPath: 'derive.config.json',
      stickerDir: 'stickers',
      only: undefined,
    });
  });

  it('accepts --dry-run and both forms of the value flags', () => {
    expect(parseArgs(['derive', '--dry-run', '--config', 'x.json', '--only', 'blue-heron'])).toMatchObject({
      dryRun: true,
      configPath: 'x.json',
      only: 'blue-heron',
    });
    expect(parseArgs(['derive', '--config=y.json', '--stickers=art']).configPath).toBe('y.json');
    expect(parseArgs(['derive', '--stickers=art']).stickerDir).toBe('art');
  });

  it('rejects unknown flags, stray arguments and missing values', () => {
    expect(() => parseArgs(['derive', '--nope'])).toThrow('unknown flag --nope');
    expect(() => parseArgs(['derive', 'extra'])).toThrow('unexpected argument extra');
    expect(() => parseArgs(['derive', '--config'])).toThrow('--config needs a value');
    expect(() => parseArgs(['derive', '--only', '--dry-run'])).toThrow('--only needs a value');
  });
});
