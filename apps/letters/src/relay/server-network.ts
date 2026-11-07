import { execute, parse } from 'graphql';
import type { FetchFunction, GraphQLResponse } from 'relay-runtime';
import { schema } from '../../server/schema.ts';
import type { Context } from '../../server/schema.ts';

/**
 * Server-side Relay network: runs the operation against the schema directly
 * with the request's context, so SSR never makes an HTTP round trip to itself.
 */
export function createServerFetch(context: Context): FetchFunction {
  return async (request, variables) => {
    if (!request.text) throw new Error(`operation ${request.name} has no text; persisted queries are not configured`);
    const result = await execute({
      schema,
      document: parse(request.text),
      variableValues: variables,
      contextValue: context,
      operationName: request.name,
    });
    return result as GraphQLResponse;
  };
}
