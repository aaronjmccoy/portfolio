// @vitest-environment node
/**
 * Lesson 2 exercises: designing the GraphQL schema with Pothos.
 * Read docs/learn/02-graphql-schema.md first. Run: pnpm learn 02
 *
 * Exercises 2b and 2c change server/schema.ts. After they pass, run
 * `pnpm schema:print` and read the diff of schema/schema.graphql.
 */
import { printSchema } from 'graphql';
import { beforeAll, describe, expect, it } from 'vitest';
import { schema } from '../../server/schema.ts';
import type { Context } from '../../server/schema.ts';
import { gql, loadContext } from './helpers.ts';

describe('lesson 2: the GraphQL schema', () => {
  let ctx: Context;
  beforeAll(async () => {
    ctx = await loadContext();
  });

  it('2a: resolvers read the index that arrives as context', async () => {
    // Passes today. Trace it: which resolver in schema.ts answers `letter(key:)`,
    // and where does the `index` it reads come from at runtime (server/index.ts)?
    const r = await gql<{ letter: { number: number; pageCount: number } }>(ctx, '{ letter(key: "440") { number pageCount } }');
    expect(r.errors).toBeUndefined();
    expect(r.data?.letter).toEqual({ number: 440, pageCount: 4 });
  });

  it('2b: add Section.pageCount, the scanned pages across all of its letters', async () => {
    const r = await gql<{ section: { pageCount: number } }>(ctx, '{ section(key: "ch3") { pageCount } }');
    expect(r.errors).toBeUndefined();
    expect(r.data?.section).toEqual({ pageCount: 754 });
  });

  it('2c: add Query.letterCount, non-null, from the index', async () => {
    const r = await gql<{ letterCount: number }>(ctx, '{ letterCount }');
    expect(r.errors).toBeUndefined();
    expect(r.data?.letterCount).toBe(456);
    expect(printSchema(schema)).toContain('letterCount: Int!');
  });
});
