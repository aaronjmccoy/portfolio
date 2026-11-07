/**
 * Shared setup for the course exercises (docs/learn). Builds the same
 * in-memory index the server builds at startup, from the committed listing,
 * and runs GraphQL operations against the real schema in-process, which is
 * exactly what the SSR network layer does (src/relay/server-network.ts).
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execute, parse, validate } from 'graphql';
import type { ExecutionResult, GraphQLError } from 'graphql';
import { buildArchiveIndex } from '../../server/archive-index.ts';
import { loadTranscriptions } from '../../server/transcriptions.ts';
import { schema } from '../../server/schema.ts';
import type { Context } from '../../server/schema.ts';

/** apps/letters */
export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export async function loadContext(): Promise<Context> {
  const listing = await readFile(resolve(appRoot, 'data/listing.txt'), 'utf8');
  const transcriptions = await loadTranscriptions(resolve(appRoot, 'transcriptions'));
  const index = buildArchiveIndex(listing.split(/\r?\n/).filter(Boolean), transcriptions);
  return { index };
}

/**
 * Parse, validate and execute one operation. Errors come back on `errors`
 * (as a real client would see them) rather than as thrown exceptions, so a
 * failing exercise prints the GraphQL message.
 */
export async function gql<T = Record<string, unknown>>(
  ctx: Context,
  source: string,
  variables?: Record<string, unknown>,
): Promise<ExecutionResult<T>> {
  let document;
  try {
    document = parse(source);
  } catch (err) {
    return { errors: [err as GraphQLError] };
  }
  const invalid = validate(schema, document);
  if (invalid.length) return { errors: invalid };
  return (await execute({ schema, document, variableValues: variables, contextValue: ctx })) as ExecutionResult<T>;
}
