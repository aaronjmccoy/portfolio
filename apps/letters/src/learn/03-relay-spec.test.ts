// @vitest-environment node
/**
 * Lesson 3 exercises: the Relay server specification (Node, global ids,
 * connections). Read docs/learn/03-relay-spec.md first. Run: pnpm learn 03
 */
import { beforeAll, describe, expect, it } from 'vitest';
import type { Context } from '../../server/schema.ts';
import { gql, loadContext } from './helpers.ts';

/* Exercise 3a: page through chapter 3 two letters at a time. Write both
 * queries against schema/schema.graphql. Each selects the letters' `number`
 * and the connection's `pageInfo { endCursor hasNextPage }`. */
const FIRST_PAGE = ``;
const NEXT_PAGE = ``; // takes `$after: String`

/* Exercise 3b: fetch a letter through the Node interface. The query takes
 * `$id: ID!` and selects `number` and `pageCount` on Letter. */
const NODE_QUERY = ``;
/* What is inside the global id? Decode letter 440's id from base64 and write it here. */
const DECODED_ID = '';

type Edge = { node: { number: number } };
type Page = { section: { letters: { edges: Edge[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } } };

describe('lesson 3: the Relay server spec', () => {
  let ctx: Context;
  beforeAll(async () => {
    ctx = await loadContext();
  });

  it('3a: connections page with opaque cursors', async () => {
    const one = await gql<Page>(ctx, FIRST_PAGE);
    expect(one.errors).toBeUndefined();
    expect(one.data?.section.letters.edges.map((e) => e.node.number)).toEqual([18, 19]);
    expect(one.data?.section.letters.pageInfo.hasNextPage).toBe(true);

    const two = await gql<Page>(ctx, NEXT_PAGE, { after: one.data?.section.letters.pageInfo.endCursor });
    expect(two.errors).toBeUndefined();
    expect(two.data?.section.letters.edges.map((e) => e.node.number)).toEqual([20, 21]);
  });

  it('3b: every Node has a global id that `node(id:)` resolves', async () => {
    const { data } = await gql<{ letter: { id: string } }>(ctx, '{ letter(key: "440") { id } }');
    const id = data?.letter.id ?? '';
    expect(Buffer.from(id, 'base64').toString()).toBe(DECODED_ID);

    const r = await gql<{ node: { number: number; pageCount: number } }>(ctx, NODE_QUERY, { id });
    expect(r.errors).toBeUndefined();
    expect(r.data?.node).toEqual({ number: 440, pageCount: 4 });
  });
});
