/**
 * Minimal Admin GraphQL API client. Authenticates with a long-lived token when one is
 * given, otherwise mints a 24-hour token with the client credentials grant (Dev Dashboard
 * apps installed on a store in the same organization). Retries on THROTTLED.
 */
export type AdminEnv = {
  SHOPIFY_STORE_DOMAIN?: string | undefined;
  SHOPIFY_ADMIN_API_VERSION?: string | undefined;
  SHOPIFY_ADMIN_TOKEN?: string | undefined;
  SHOPIFY_CLIENT_ID?: string | undefined;
  SHOPIFY_CLIENT_SECRET?: string | undefined;
};

type GraphQLError = { message: string; extensions?: { code?: string } };
type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

export class AdminClient {
  readonly domain: string;
  readonly version: string;
  #env: AdminEnv;
  #token: { value: string; expiresAt: number } | undefined;

  constructor(env: AdminEnv) {
    if (!env.SHOPIFY_STORE_DOMAIN) throw new Error('SHOPIFY_STORE_DOMAIN is required');
    if (!env.SHOPIFY_ADMIN_TOKEN && !(env.SHOPIFY_CLIENT_ID && env.SHOPIFY_CLIENT_SECRET)) {
      throw new Error('set SHOPIFY_ADMIN_TOKEN, or SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET');
    }
    this.domain = env.SHOPIFY_STORE_DOMAIN;
    this.version = env.SHOPIFY_ADMIN_API_VERSION ?? '2026-10';
    this.#env = env;
  }

  async token(): Promise<string> {
    if (this.#env.SHOPIFY_ADMIN_TOKEN) return this.#env.SHOPIFY_ADMIN_TOKEN;
    if (this.#token && this.#token.expiresAt > Date.now() + 60_000) return this.#token.value;
    const res = await fetch(`https://${this.domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.#env.SHOPIFY_CLIENT_ID as string,
        client_secret: this.#env.SHOPIFY_CLIENT_SECRET as string,
      }),
    });
    const body = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };
    if (!res.ok || !body.access_token) {
      throw new Error(`token grant failed: ${res.status} ${body.error ?? ''} ${body.error_description ?? ''}`.trim());
    }
    this.#token = { value: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 86_399) * 1000 };
    return body.access_token;
  }

  async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`https://${this.domain}/admin/api/${this.version}/graphql.json`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'X-Shopify-Access-Token': await this.token() },
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) throw new Error(`Admin API ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const json = (await res.json()) as GraphQLResponse<T>;
      const throttled = json.errors?.some((e) => e.extensions?.code === 'THROTTLED');
      if (throttled && attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (json.errors?.length) throw new Error(`Admin API errors: ${json.errors.map((e) => e.message).join('; ')}`);
      if (!json.data) throw new Error('Admin API returned no data');
      return json.data;
    }
  }
}

export type UserError = { field?: string[] | null; message: string };

/** Throws when a mutation payload carries userErrors. */
export function assertNoUserErrors(what: string, errors: readonly UserError[]): void {
  if (errors.length) {
    const list = errors.map((e) => `${(e.field ?? []).join('.') || '(root)'}: ${e.message}`).join('; ');
    throw new Error(`${what}: ${list}`);
  }
}
