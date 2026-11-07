// @vitest-environment node
/**
 * Lesson 4 exercises: Relay on the client, and the compile step between a
 * graphql template tag and the artifact it becomes.
 * Read docs/learn/04-relay-client.md first. Run: pnpm learn 04
 *
 * A note on this file: the Vite plugin under test is a regex over source
 * text, so it rewrites the tag wherever it sees it, comments and strings
 * included. That is why MODULE below is assembled from two strings and why
 * the lesson's code lives in the Markdown, not in comments here.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { transformRelayTags } from '@portfolio/ssr/vite';
import type { Context } from '../../server/schema.ts';
import { createEnvironment } from '../relay/environment.ts';
import { createServerFetch } from '../relay/server-network.ts';
import { loadContext } from './helpers.ts';

/* Exercise 4a: what does the plugin (packages/ssr/src/vite-relay.ts) turn this
 * module into? Write the import line it prepends. */
const MODULE = 'const Q = graphql' + '`query LearnSectionsQuery { sections { id } }`;\n';
const EXPECTED_IMPORT = '';

describe('lesson 4: Relay on the client', () => {
  let ctx: Context;
  beforeAll(async () => {
    ctx = await loadContext();
  });

  it('4a: the tag becomes an import of the compiled artifact', () => {
    const out = transformRelayTags(MODULE, '/repo/apps/letters/src/pages/Learn.tsx', {
      artifactDirectory: '/repo/apps/letters/src/__generated__',
    });
    expect(out?.code.split('\n')[0]).toBe(EXPECTED_IMPORT);
    expect(out?.code).toContain('const Q = __relay_LearnSectionsQuery;');
  });

  /* Exercise 4b: run a compiled operation through a Relay Environment whose
   * network executes the schema in-process (what SSR does), then look at the
   * normalized store. Do LearnLetter.tsx first (the lesson has the two lines),
   * run `pnpm relay`, then replace this test's body with the version in the
   * lesson's Exercise section. */
  it('4b: fetchQuery fills the store with one record per Node', () => {
    const environment = createEnvironment(createServerFetch(ctx));
    expect(environment.getStore().getSource().toJSON()).toEqual({});
    throw new Error('exercise 4b: see the lesson, Exercise section');
  });
});
