/**
 * Pixel sizes of the original scans, written by scripts/derive-images.ts into
 * <LETTERS_DATA_DIR>/img/manifest.json and read once at startup. The UI puts
 * them on <img width height> so the page reserves space before the image
 * loads (no layout shift). Missing manifest → empty map, never an error.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type Dimensions = { width: number; height: number };
/** Keyed by page id (`440/pfr100313`) */
export type Manifest = Record<string, Dimensions>;

export function manifestPath(dataDir: string): string {
  return join(dataDir, 'img', 'manifest.json');
}

export async function loadDimensions(dataDir: string | undefined): Promise<Map<string, Dimensions>> {
  if (!dataDir) return new Map();
  let text: string;
  try {
    text = await readFile(manifestPath(dataDir), 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return new Map();
    throw err;
  }
  return new Map(Object.entries(JSON.parse(text) as Manifest));
}
