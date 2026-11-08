#!/usr/bin/env node
/**
 * catalog: bulk tooling for the Maller Art shop on the Admin GraphQL API.
 *
 *   catalog derive [--dry-run] [--only <original-handle>] [--config derive.config.json] [--stickers stickers]
 *
 * Megan creates each original painting in the Shopify admin and puts it in the
 * "originals" collection. `derive` then generates, for every original, a print product
 * with one variant per size and a sticker product (when stickers/<handle>.png exists),
 * reusing the original's photos, priced from derive.config.json, and publishes them to
 * the Headless channel. Products are keyed by handle and carry a fingerprint tag, so
 * re-running is idempotent: unchanged products are skipped, changed ones updated.
 */
import { parseArgs } from './args.ts';
import { derive } from './derive.ts';

const usage = 'usage: catalog derive [--dry-run] [--only <handle>] [--config <file>] [--stickers <dir>]';
let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (e) {
  console.error((e as Error).message);
  console.error(usage);
  process.exit(2);
}
if (args.command !== 'derive') {
  console.error(usage);
  process.exit(2);
}
try {
  await derive({ configPath: args.configPath, stickerDir: args.stickerDir, dryRun: args.dryRun, only: args.only });
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
