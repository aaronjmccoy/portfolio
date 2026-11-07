import { describe, expect, it } from 'vitest';
import { parseArgs } from './args.ts';

describe('parseArgs', () => {
  it('reads the command and defaults', () => {
    expect(parseArgs(['import'])).toMatchObject({ command: 'import', dryRun: false });
  });

  it('accepts --dry-run and both --catalog forms', () => {
    expect(parseArgs(['import', '--dry-run', '--catalog', 'x'])).toMatchObject({
      dryRun: true,
      catalogDir: 'x',
    });
    expect(parseArgs(['import', '--catalog=y']).catalogDir).toBe('y');
  });

  it('rejects unknown flags and stray arguments', () => {
    expect(() => parseArgs(['import', '--nope'])).toThrow('unknown flag --nope');
    expect(() => parseArgs(['import', 'extra'])).toThrow('unexpected argument extra');
    expect(() => parseArgs(['import', '--catalog'])).toThrow('--catalog needs a directory');
  });
});
