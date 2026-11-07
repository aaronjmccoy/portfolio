#!/usr/bin/env node
/**
 * catalog — upserts the Maller Art catalog into Shopify through the Admin
 * GraphQL API.
 *
 *   catalog import [--dry-run] [--catalog <dir>]
 *
 * Reads <dir>/products.json plus the image files it references, stages the
 * images with `stagedUploadsCreate`, and upserts each product with the
 * `productSet` mutation keyed by handle, so re-running is idempotent.
 */
import { parseArgs } from './args.ts';

const args = parseArgs(process.argv.slice(2));

if (args.command !== 'import') {
  console.error('usage: catalog import [--dry-run] [--catalog <dir>]');
  process.exit(2);
}

console.log(`catalog import ${args.dryRun ? '(dry run) ' : ''}from ${args.catalogDir}`);
console.log('not implemented yet');
