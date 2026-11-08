import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseConfig } from './config.ts';

const sample = JSON.parse(await readFile(new URL('../derive.config.json', import.meta.url), 'utf8')) as Record<string, unknown>;
const withPrints = (patch: Record<string, unknown>) => ({ ...sample, prints: { ...(sample['prints'] as object), ...patch } });

describe('parseConfig', () => {
  it('accepts the checked-in sample', () => {
    const c = parseConfig(sample);
    expect(c.prints.sizes.length).toBeGreaterThan(0);
    expect(c.publication).toBe('Headless');
  });

  it('names the bad field', () => {
    expect(() => parseConfig({})).toThrow('originals must be an object');
    expect(() => parseConfig(withPrints({ sizes: [] }))).toThrow('prints.sizes must be a non-empty array');
    expect(() => parseConfig(withPrints({ sizes: [{ name: '8 x 10', price: '35', weightOz: 6 }] }))).toThrow(
      'prints.sizes[0].price must be a price like "35.00"',
    );
    expect(() => parseConfig(withPrints({ sizes: [{ name: 'A', price: '1.00', weightOz: 0 }] }))).toThrow(
      'prints.sizes[0].weightOz must be a positive number of ounces',
    );
    const dup = [{ name: 'A', price: '1.00', weightOz: 1 }, { name: 'A', price: '2.00', weightOz: 1 }];
    expect(() => parseConfig(withPrints({ sizes: dup }))).toThrow('duplicate size names');
  });
});
