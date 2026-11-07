/**
 * Vite plugin that does what babel-plugin-relay does, without Babel:
 * every `graphql\`…\`` tag becomes a default import of the artifact that
 * relay-compiler wrote for that operation or fragment.
 *
 *   const Q = graphql`query FooQuery { … }`;
 *   →
 *   import __relay_FooQuery from './__generated__/FooQuery.graphql.ts';
 *   const Q = __relay_FooQuery;
 *
 * The artifact name is the operation/fragment name, which relay-compiler
 * already requires to be unique and to start with the module name, so the
 * mapping is exact. Applies in dev, build, SSR and Vitest alike.
 */
import { dirname, relative, resolve } from 'node:path';
import MagicString from 'magic-string';
import type { Plugin } from 'vite';

export type RelayPluginOptions = {
  /** Absolute path of relay.config.json's artifactDirectory */
  artifactDirectory: string;
  /** Artifact file extension; `.graphql.ts` for language "typescript" */
  extension?: string;
};

const TAG = /\bgraphql`([^`]*)`/g;
const NAME = /^\s*(?:query|mutation|subscription|fragment)\s+([A-Za-z_][A-Za-z0-9_]*)/;
const SOURCE = /\.[cm]?[jt]sx?$/;

/** Pure transform, exported for tests. Returns undefined when nothing changed. */
export function transformRelayTags(
  code: string,
  id: string,
  opts: RelayPluginOptions,
): { code: string; map: ReturnType<MagicString['generateMap']> } | undefined {
  if (!code.includes('graphql`')) return undefined;
  const s = new MagicString(code);
  const imports = new Map<string, string>();
  let changed = false;
  for (const m of code.matchAll(TAG)) {
    const name = NAME.exec(m[1] ?? '')?.[1];
    if (!name) throw new Error(`${id}: graphql tag without an operation or fragment name`);
    const ident = `__relay_${name}`;
    if (!imports.has(ident)) {
      const file = resolve(opts.artifactDirectory, `${name}${opts.extension ?? '.graphql.ts'}`);
      let spec = relative(dirname(id), file).replaceAll('\\', '/');
      if (!spec.startsWith('.')) spec = `./${spec}`;
      imports.set(ident, spec);
    }
    s.overwrite(m.index, m.index + m[0].length, ident);
    changed = true;
  }
  if (!changed) return undefined;
  const header = [...imports].map(([ident, spec]) => `import ${ident} from '${spec}';`).join('\n');
  s.prepend(`${header}\n`);
  return { code: s.toString(), map: s.generateMap({ hires: true, source: id, includeContent: true }) };
}

export function relay(opts: RelayPluginOptions): Plugin {
  const artifacts = opts.artifactDirectory.replaceAll('\\', '/');
  return {
    name: 'portfolio:relay',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0] ?? id;
      if (!SOURCE.test(file) || file.includes('/node_modules/') || file.startsWith(artifacts)) return;
      return transformRelayTags(code, file, opts);
    },
  };
}
