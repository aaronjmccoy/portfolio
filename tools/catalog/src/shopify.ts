/** Queries and mutations the derive command uses, and the slices of the result types it reads. */
import { assertNoUserErrors, type AdminClient, type UserError } from './admin.ts';

export type OriginalImage = { url: string; altText: string | null };
export type Original = {
  id: string;
  handle: string;
  title: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'UNLISTED';
  vendor: string;
  images: OriginalImage[];
};
export type Existing = { id: string; handle: string; tags: string[]; mediaCount: number; status: string };

type PageInfo = { hasNextPage: boolean; endCursor: string | null };
type Connection<N> = { nodes: N[]; pageInfo: PageInfo };

const PAGE = 50;

async function paginate<N>(
  client: AdminClient,
  query: string,
  vars: Record<string, unknown>,
  pick: (data: unknown) => Connection<N> | null,
): Promise<N[]> {
  const all: N[] = [];
  let after: string | null = null;
  for (;;) {
    const data = await client.request<unknown>(query, { ...vars, first: PAGE, after });
    const conn = pick(data);
    if (!conn) return all;
    all.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage) return all;
    after = conn.pageInfo.endCursor;
  }
}

type OriginalNode = {
  id: string;
  handle: string;
  title: string;
  status: Original['status'];
  vendor: string;
  media: { nodes: Array<{ image?: OriginalImage | null }> };
};

export async function fetchOriginals(client: AdminClient, collectionHandle: string): Promise<Original[]> {
  type Data = { collectionByHandle: { products: Connection<OriginalNode> } | null };
  const query = /* GraphQL */ `
    query Originals($handle: String!, $first: Int!, $after: String) {
      collectionByHandle(handle: $handle) {
        products(first: $first, after: $after, sortKey: TITLE) {
          nodes {
            id handle title status vendor
            media(first: 20) { nodes { ... on MediaImage { image { url altText } } } }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`;
  const nodes = await paginate<OriginalNode>(client, query, { handle: collectionHandle }, (d) => (d as Data).collectionByHandle?.products ?? null);
  return nodes.map((n) => ({
    id: n.id,
    handle: n.handle,
    title: n.title,
    status: n.status,
    vendor: n.vendor,
    images: n.media.nodes.flatMap((m) => (m.image ? [m.image] : [])),
  }));
}

type DerivedNode = { id: string; handle: string; tags: string[]; status: string; mediaCount: { count: number } | null };
const toExisting = (n: DerivedNode): Existing => ({ id: n.id, handle: n.handle, tags: n.tags, status: n.status, mediaCount: n.mediaCount?.count ?? 0 });

/**
 * Derived products looked up by their expected handles. Direct lookups are consistent
 * immediately after a write, unlike the search index behind `products(query:)`, which can
 * lag by minutes and would make a second run recreate what the first one just wrote.
 */
export async function fetchByHandles(client: AdminClient, handles: readonly string[]): Promise<Existing[]> {
  const out: Existing[] = [];
  const BATCH = 25;
  for (let i = 0; i < handles.length; i += BATCH) {
    const slice = handles.slice(i, i + BATCH);
    const fields = slice.map((_, k) => `p${k}: productByHandle(handle: $h${k}) { id handle tags status mediaCount { count } }`).join('\n');
    const args = slice.map((_, k) => `$h${k}: String!`).join(', ');
    const vars = Object.fromEntries(slice.map((h, k) => [`h${k}`, h]));
    const data = await client.request<Record<string, DerivedNode | null>>(`query Existing(${args}) { ${fields} }`, vars);
    for (const n of Object.values(data)) if (n) out.push(toExisting(n));
  }
  return out;
}

/** Every product tagged `derived`, from the search index; used only to spot orphans. */
export async function fetchExistingDerived(client: AdminClient): Promise<Existing[]> {
  type Data = { products: Connection<DerivedNode> };
  const query = /* GraphQL */ `
    query Derived($first: Int!, $after: String) {
      products(first: $first, after: $after, query: "tag:derived") {
        nodes { id handle tags status mediaCount { count } }
        pageInfo { hasNextPage endCursor }
      }
    }`;
  const nodes = await paginate<DerivedNode>(client, query, {}, (d) => (d as Data).products);
  return nodes.map(toExisting);
}

export async function fetchPublicationId(client: AdminClient, name: string): Promise<string> {
  const data = await client.request<{ publications: { nodes: Array<{ id: string; name: string }> } }>(
    /* GraphQL */ `{ publications(first: 25) { nodes { id name } } }`,
  );
  const hit = data.publications.nodes.find((p) => p.name === name);
  if (!hit) {
    throw new Error(`no sales channel named "${name}"; have: ${data.publications.nodes.map((p) => p.name).join(', ')}`);
  }
  return hit.id;
}

/** Collection ids by handle, creating any that are missing. */
export async function ensureCollections(client: AdminClient, handles: readonly string[], dryRun: boolean): Promise<Map<string, string>> {
  const data = await client.request<{ collections: { nodes: Array<{ id: string; handle: string }> } }>(
    /* GraphQL */ `{ collections(first: 100) { nodes { id handle } } }`,
  );
  const ids = new Map(data.collections.nodes.map((c) => [c.handle, c.id] as const));
  for (const handle of handles) {
    if (ids.has(handle)) continue;
    if (dryRun) {
      ids.set(handle, `gid://shopify/Collection/(would create ${handle})`);
      continue;
    }
    const title = handle.charAt(0).toUpperCase() + handle.slice(1);
    type Data = { collectionCreate: { collection: { id: string } | null; userErrors: UserError[] } };
    const res = await client.request<Data>(
      /* GraphQL */ `mutation($c: CollectionCreateInput!) {
        collectionCreate(collection: $c) { collection { id } userErrors { field message } }
      }`,
      { c: { title, handle } },
    );
    assertNoUserErrors(`collectionCreate ${handle}`, res.collectionCreate.userErrors);
    const id = res.collectionCreate.collection?.id;
    if (!id) throw new Error(`collectionCreate ${handle}: no collection returned`);
    ids.set(handle, id);
  }
  return ids;
}

export type FileInput = {
  originalSource: string;
  alt?: string;
  contentType: 'IMAGE';
  duplicateResolutionMode: 'APPEND_UUID';
};

export type ProductSetInput = {
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  status: 'ACTIVE' | 'DRAFT';
  tags: string[];
  collections: string[];
  files?: FileInput[];
  productOptions: Array<{ name: string; position: number; values: Array<{ name: string }> }>;
  variants: Array<{
    optionValues: Array<{ optionName: string; name: string }>;
    price: string;
    inventoryPolicy: 'CONTINUE' | 'DENY';
    inventoryItem: {
      tracked: boolean;
      requiresShipping: boolean;
      measurement: { weight: { value: number; unit: 'OUNCES' } };
    };
  }>;
};

export async function productSet(client: AdminClient, input: ProductSetInput): Promise<string> {
  type Data = { productSet: { product: { id: string } | null; userErrors: UserError[] } };
  const res = await client.request<Data>(
    /* GraphQL */ `mutation($input: ProductSetInput!, $identifier: ProductSetIdentifiers!) {
      productSet(input: $input, identifier: $identifier, synchronous: true) {
        product { id }
        userErrors { field message }
      }
    }`,
    { input, identifier: { handle: input.handle } },
  );
  assertNoUserErrors(`productSet ${input.handle}`, res.productSet.userErrors);
  const id = res.productSet.product?.id;
  if (!id) throw new Error(`productSet ${input.handle}: no product returned`);
  return id;
}

export async function publish(client: AdminClient, productId: string, publicationId: string): Promise<void> {
  type Data = { publishablePublish: { userErrors: UserError[] } };
  const res = await client.request<Data>(
    /* GraphQL */ `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id: productId, input: [{ publicationId }] },
  );
  assertNoUserErrors(`publish ${productId}`, res.publishablePublish.userErrors);
}

/** Uploads a local image through a staged target and returns the URL productSet accepts as originalSource. */
export async function stageUpload(client: AdminClient, filename: string, mimeType: string, bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  type Target = { url: string; resourceUrl: string; parameters: Array<{ name: string; value: string }> };
  type Data = { stagedUploadsCreate: { stagedTargets: Target[]; userErrors: UserError[] } };
  const res = await client.request<Data>(
    /* GraphQL */ `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    { input: [{ resource: 'IMAGE', filename, mimeType, httpMethod: 'POST', fileSize: String(bytes.byteLength) }] },
  );
  assertNoUserErrors(`stagedUploadsCreate ${filename}`, res.stagedUploadsCreate.userErrors);
  const target = res.stagedUploadsCreate.stagedTargets[0];
  if (!target) throw new Error(`no staged target for ${filename}`);
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([bytes], { type: mimeType }), filename);
  const up = await fetch(target.url, { method: 'POST', body: form });
  if (!up.ok) throw new Error(`staged upload of ${filename} failed: ${up.status} ${(await up.text()).slice(0, 200)}`);
  return target.resourceUrl;
}
