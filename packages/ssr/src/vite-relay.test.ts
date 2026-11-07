import { describe, expect, it } from 'vitest';
import { transformRelayTags } from './vite-relay.ts';

const opts = { artifactDirectory: '/app/src/__generated__' };

describe('transformRelayTags', () => {
  it('replaces each tag with an import of its artifact', () => {
    const src = [
      "import { graphql } from 'react-relay';",
      'export const Q = graphql`',
      '  query FooPageQuery($id: ID!) { node(id: $id) { id } }',
      '`;',
      'const F = graphql`fragment FooPage_item on Item { id }`;',
    ].join('\n');
    const out = transformRelayTags(src, '/app/src/pages/FooPage.tsx', opts);
    expect(out?.code).toContain("import __relay_FooPageQuery from '../__generated__/FooPageQuery.graphql.ts';");
    expect(out?.code).toContain("import __relay_FooPage_item from '../__generated__/FooPage_item.graphql.ts';");
    expect(out?.code).toContain('export const Q = __relay_FooPageQuery;');
    expect(out?.code).toContain('const F = __relay_FooPage_item;');
    expect(out?.code).not.toContain('graphql`');
    expect(out?.map.mappings).not.toBe('');
  });

  it('leaves files without tags alone', () => {
    expect(transformRelayTags('const x = 1;', '/app/src/x.ts', opts)).toBeUndefined();
  });

  it('rejects anonymous operations', () => {
    expect(() => transformRelayTags('graphql`{ viewer { id } }`', '/app/src/x.ts', opts)).toThrow(/without an operation/);
  });

  it('imports an artifact once when a tag is reused', () => {
    const src = 'const a = graphql`query AQuery { id }`; const b = graphql`query AQuery { id }`;';
    const out = transformRelayTags(src, '/app/src/x.ts', opts);
    expect(out?.code.match(/import __relay_AQuery/g)).toHaveLength(1);
  });
});
