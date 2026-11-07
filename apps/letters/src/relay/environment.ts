import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import type { FetchFunction } from 'relay-runtime';
import type { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

export const RELAY_DATA_ID = '__RELAY_DATA__';

/**
 * One factory for both sides. The server passes a fetch function that
 * executes against the schema in-process; the client passes one that POSTs
 * to /graphql and seeds the store from the records the server serialized.
 */
export function createEnvironment(fetchFn: FetchFunction, records?: RecordMap): Environment {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource(records), { gcReleaseBufferSize: 20 }),
    isServer: typeof window === 'undefined',
  });
}

export const httpFetch: FetchFunction = async (request, variables) => {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/graphql-response+json, application/json' },
    body: JSON.stringify({ query: request.text, variables, operationName: request.name }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  return res.json();
};

/** Records the server embedded in the page, if any. */
export function readServerRecords(): RecordMap | undefined {
  const el = document.getElementById(RELAY_DATA_ID);
  if (!el?.textContent) return undefined;
  try {
    return JSON.parse(el.textContent) as RecordMap;
  } catch {
    return undefined;
  }
}

/** Serializes the store for the page; `<` is escaped so it can't close the script tag. */
export function serializeRecords(environment: Environment): string {
  const json = JSON.stringify(environment.getStore().getSource().toJSON()).replace(/</g, '\\u003c');
  return `<script id="${RELAY_DATA_ID}" type="application/json">${json}</script>`;
}
