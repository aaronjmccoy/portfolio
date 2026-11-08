#!/usr/bin/env node
/**
 * catalog: bulk tooling for the Maller Art shop on the Admin GraphQL API.
 *
 *   catalog originals --dir <photos> [--skip a,b] [--dry-run] [--only <handle>]
 *   catalog derive [--dry-run] [--only <original-handle>] [--config derive.config.json] [--stickers stickers]
 *
 * `originals` turns a folder of photographs named by handle into DRAFT products in
 * the originals collection, every shot attached, for Megan to price and activate in
 * the admin. `derive` then generates, for every original, a print product with one
 * variant per size and a sticker product (when stickers/<handle>*.png exists),
 * reusing the original's photos, priced from derive.config.json, and publishes them
 * to the Headless channel. Products are keyed by handle and carry a fingerprint tag,
 * so re-running either command is idempotent.
 */
import { parseArgs } from './args.ts';
import { derive } from './derive.ts';
import { originals } from './originals.ts';

const usage = [
  'usage: catalog originals --dir <photos> [--skip a,b] [--dry-run] [--only <handle>]',
  '       catalog derive [--dry-run] [--only <handle>] [--config <file>] [--stickers <dir>]',
].join('\n');

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (e) {
  console.error((e as Error).message);
  console.error(usage);
  process.exit(2);
}
try {
  if (args.command === 'derive') {
    await derive({ configPath: args.configPath, stickerDir: args.stickerDir, dryRun: args.dryRun, only: args.only });
  } else if (args.command === 'originals') {
    if (!args.dir) throw new Error('originals needs --dir <photos>');
    await originals({ dir: args.dir, configPath: args.configPath, dryRun: args.dryRun, only: args.only, skip: args.skip });
  } else {
    console.error(usage);
    process.exit(2);
  }
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
